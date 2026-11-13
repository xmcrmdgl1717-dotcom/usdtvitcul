const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dns = require('dns');

// 强制优先 IPv4，规避 Render 等云平台 IPv6 出站问题
dns.setDefaultResultOrder('ipv4first');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ langs: [], globalDict: {} }, null, 2));
}

app.get('/api/data', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: '读取数据失败' });
    }
});

app.post('/api/data', (req, res) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: '保存数据失败' });
    }
});

// ==========================================
// 翻译代理接口（修复 Unexpected end of JSON input）
// ==========================================
app.post('/api/translate', async (req, res) => {
    const { text, targetLang, deeplKey } = req.body;
    
    if (!text || !deeplKey) {
        return res.status(400).json({ error: '缺少文本或 API Key' });
    }

    const cleanKey = deeplKey.trim();
    const isFreeApi = cleanKey.endsWith(':fx');
    const apiUrl = isFreeApi 
        ? 'https://api-free.deepl.com/v2/translate' 
        : 'https://api.deepl.com/v2/translate';

    const MAX_RETRIES = 3; // 增加到 3 次重试
    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            // 超时设置为 20 秒，给慢响应更多时间
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `DeepL-Auth-Key ${cleanKey}`
                },
                body: new URLSearchParams({ 
                    text: text, 
                    target_lang: targetLang.toUpperCase() 
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // 关键修复：先读取为文本，检查响应体是否为空或不完整
            const responseText = await response.text();

            if (!responseText || responseText.trim() === '') {
                // 空响应体，通常由连接截断引起，触发重试
                throw new Error('响应体为空，连接可能被中断');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseErr) {
                // JSON 解析失败，可能是响应被截断或返回了 HTML 错误页
                console.warn(`[翻译请求] JSON 解析失败 (第 ${attempt + 1} 次)，原始响应片段: ${responseText.slice(0, 100)}...`);
                throw new Error('响应数据不完整或格式错误');
            }

            if (response.ok) {
                return res.json({ translatedText: data.translations[0].text });
            }

            // 4xx 错误（Key 无效、额度耗尽等）直接返回，不重试
            if (response.status >= 400 && response.status < 500) {
                const errMsg = data.message || '翻译请求被拒绝，请检查 API Key 或额度';
                return res.status(response.status).json({ error: errMsg });
            }

            // 5xx 服务器错误，记录并准备重试
            lastError = new Error(`DeepL 服务器返回状态码: ${response.status}`);

        } catch (err) {
            lastError = err;
            console.warn(`[翻译请求] 第 ${attempt + 1} 次尝试失败:`, err.message);
        }

        // 重试等待（递增：1秒、2秒、3秒）
        if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
    }

    // 所有重试均失败，返回具体原因
    const cause = lastError?.message || '未知网络错误';
    console.error('[翻译请求] 最终失败，原因:', cause);
    
    res.status(502).json({ error: `网络请求失败 (${cause})，请稍后重试` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ 后端服务器已启动，监听端口: ${PORT}`);
    console.log(`✅ 前端访问: http://localhost:${PORT}/index.html`);
    console.log(`✅ 后台管理: http://localhost:${PORT}/admin.html`);
});
