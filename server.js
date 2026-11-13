const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dns = require('dns');

// ==========================================
// 核心修复：强制 Node.js 优先解析 IPv4 地址
// 解决 Render 等云平台因不支持 IPv6 导致的 ENOTFOUND 错误
// ==========================================
dns.setDefaultResultOrder('ipv4first');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ langs: [], globalDict: {} }, null, 2));
}

// 获取数据接口
app.get('/api/data', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: '读取数据失败' });
    }
});

// 保存数据接口
app.post('/api/data', (req, res) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: '保存数据失败' });
    }
});

// ==========================================
// 翻译代理接口
// 包含：Header 鉴权、超时控制、失败重试、具体错误捕获
// ==========================================
app.post('/api/translate', async (req, res) => {
    const { text, targetLang, deeplKey } = req.body;
    
    if (!text || !deeplKey) {
        return res.status(400).json({ error: '缺少文本或 API Key' });
    }

    const cleanKey = deeplKey.trim();
    // 自动识别免费版（通常以 :fx 结尾）和专业版接口
    const isFreeApi = cleanKey.endsWith(':fx');
    const apiUrl = isFreeApi 
        ? 'https://api-free.deepl.com/v2/translate' 
        : 'https://api.deepl.com/v2/translate';

    const MAX_RETRIES = 2; // 最多重试 2 次
    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            // 设置 15 秒请求超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `DeepL-Auth-Key ${cleanKey}` // 最新的鉴权方式
                },
                body: new URLSearchParams({ 
                    text: text, 
                    target_lang: targetLang.toUpperCase() 
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (response.ok) {
                return res.json({ translatedText: data.translations[0].text });
            }

            // 如果遇到 4xx 错误（如 Key 填错、额度耗尽），直接返回，不需要重试
            if (response.status >= 400 && response.status < 500) {
                const errMsg = data.message || '翻译请求被拒绝，请检查 API Key 是否有效或额度是否耗尽';
                return res.status(response.status).json({ error: errMsg });
            }

            // 5xx 服务器错误，记录异常并准备重试
            lastError = new Error(`DeepL 服务器返回状态码: ${response.status}`);

        } catch (err) {
            // 捕获网络异常或超时
            lastError = err;
            console.warn(`[翻译请求] 第 ${attempt + 1} 次尝试失败:`, err.message);
        }

        // 如果还有重试机会，等待一小段时间再试 (1秒、2秒...)
        if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
    }

    // 如果重试完仍然失败，提取具体错误原因返回给前端
    const cause = lastError?.cause?.code || lastError?.cause?.message || lastError?.message || '未知网络错误';
    console.error('[翻译请求] 最终失败，原因:', cause);
    
    let friendlyMsg = `网络请求失败 (${cause})`;
    if (cause === 'ENOTFOUND') friendlyMsg = '网络解析失败，请确保服务器支持访问外网';
    if (cause === 'ETIMEDOUT' || lastError?.name === 'AbortError') friendlyMsg = '请求 DeepL 超时，请检查服务器网络';

    res.status(502).json({ error: friendlyMsg });
});

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ 后端服务器已启动，监听端口: ${PORT}`);
    console.log(`✅ 前端访问: http://localhost:${PORT}/index.html`);
    console.log(`✅ 后台管理: http://localhost:${PORT}/admin.html`);
});
