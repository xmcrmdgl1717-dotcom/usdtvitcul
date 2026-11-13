const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dns = require('dns');
const { Agent, fetch } = require('undici');

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

// 创建带连接池的 undici Agent
const upstreamAgent = new Agent({
    connections: 10,
    pipelining: 1,
    keepAliveTimeout: 60000, // 保持连接活跃，减少重建频率
    keepAliveMaxTimeout: 120000,
});

// 判断是否可重试的状态码
const retryableStatuses = new Set([502, 503, 504]);

/**
 * 带指数退避重试的 fetch 封装
 * 参考 Render 官方文档：https://render.com/docs/outbound-connection-resets
 */
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                dispatcher: upstreamAgent, // 使用连接池
            });

            // 如果是可重试的服务器错误，抛出异常以触发重试
            if (retryableStatuses.has(response.status)) {
                await response.body?.cancel();
                throw new Error(`上游返回状态码 ${response.status}`);
            }

            return response;
        } catch (error) {
            // 如果是最后一次尝试，直接抛出错误
            if (attempt === retries) {
                throw error;
            }

            // 指数退避 + 随机抖动，避免重试风暴
            const delay = 500 * 2 ** attempt * (0.5 + Math.random());
            console.warn(`[重试] 第 ${attempt + 1} 次失败，${Math.round(delay)}ms 后重试...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}

// 翻译代理接口
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

    try {
        // 使用带重试的 fetch
        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `DeepL-Auth-Key ${cleanKey}`
            },
            body: new URLSearchParams({
                text: text,
                target_lang: targetLang.toUpperCase()
            })
        });

        // 防御性解析：先读取为文本
        const responseText = await response.text();

        if (!responseText || responseText.trim() === '') {
            throw new Error('响应体为空，连接可能被中断');
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseErr) {
            console.warn(`[翻译请求] JSON 解析失败，原始响应片段: ${responseText.slice(0, 100)}...`);
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

        // 其他错误
        throw new Error(`DeepL 返回状态码 ${response.status}`);

    } catch (err) {
        console.error('[翻译请求] 最终失败:', err.message);
        res.status(502).json({ error: `网络请求失败 (${err.message})，请稍后重试` });
    }
});

// 健康检查端点（可选，但推荐用于 Render）
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// 设置环境变量以兼容 Render 的代理超时
process.env.KEEP_ALIVE_TIMEOUT = '120';
process.env.HEADERS_TIMEOUT = '121';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ 后端服务器已启动，监听端口: ${PORT}`);
    console.log(`✅ 前端访问: http://localhost:${PORT}/index.html`);
    console.log(`✅ 后台管理: http://localhost:${PORT}/admin.html`);
});
