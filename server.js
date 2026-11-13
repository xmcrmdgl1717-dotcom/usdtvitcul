const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'data.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ langs: [], globalDict: {} }, null, 2));
}

app.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
});

app.post('/api/data', (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

// 修改后的翻译代理接口：使用 Authorization Header 鉴权
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
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                // 关键修改：将 Key 放入 Authorization 头部
                'Authorization': `DeepL-Auth-Key ${cleanKey}` 
            },
            body: new URLSearchParams({ 
                text: text, 
                target_lang: targetLang.toUpperCase() 
            })
        });

        const data = await response.json();

        if (response.ok) {
            res.json({ translatedText: data.translations[0].text });
        } else {
            console.error("DeepL API 报错:", data);
            const errMsg = data.message || (data.error && data.error.message) || '翻译失败，请检查 Key 是否正确或额度是否用尽';
            res.status(response.status).json({ error: errMsg });
        }
    } catch (error) {
        console.error("请求代理异常:", error);
        res.status(500).json({ error: '网络请求失败，请检查后端服务或服务器网络' });
    }
});

app.listen(3000, () => {
    console.log('✅ 后端服务器已启动，请访问: http://localhost:3000/index.html');
    console.log('✅ 后台管理请访问: http://localhost:3000/admin.html');
});
