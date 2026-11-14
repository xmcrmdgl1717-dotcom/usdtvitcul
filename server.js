const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ 
        langs: [], 
        globalDict: {},
        faqs: [],
        testimonials: [],
        sysConfig: {
            safariTitle: "请使用 Safari 浏览器打开",
            safariDesc: "系统检测到您正在使用非苹果官方 Safari 访问，为了您的安全请您使用苹果官方 Safari 打开访问。"
        }
    }, null, 2));
}

app.get('/api/data', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        // 兼容旧数据
        if (!data.faqs) data.faqs = [];
        if (!data.testimonials) data.testimonials = [];
        if (!data.sysConfig) data.sysConfig = { safariTitle: "请使用 Safari 浏览器打开", safariDesc: "系统检测到您正在使用非苹果官方 Safari 访问，为了您的安全请您使用苹果官方 Safari 打开访问。" };
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

// 翻译代理
app.post('/api/translate', async (req, res) => {
    const { text, targetLang, deeplKey } = req.body;
    if (!text || !deeplKey) return res.status(400).json({ error: '缺少参数' });

    const cleanKey = deeplKey.trim();
    const isFreeApi = cleanKey.endsWith(':fx');
    const apiUrl = isFreeApi ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';

    const MAX_RETRIES = 3;
    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `DeepL-Auth-Key ${cleanKey}`
                },
                body: new URLSearchParams({ text: text, target_lang: targetLang.toUpperCase() }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            if (response.ok) return res.json({ translatedText: data.translations[0].text });
            
            if (response.status >= 400 && response.status < 500) {
                return res.status(response.status).json({ error: data.message || '翻译失败' });
            }
            lastError = new Error(`上游返回状态码 ${response.status}`);
        } catch (err) {
            lastError = err;
        }
        if (attempt < MAX_RETRIES) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
    res.status(502).json({ error: `网络请求失败，请稍后重试` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 后端服务器已启动，监听: ${PORT}`);
});
