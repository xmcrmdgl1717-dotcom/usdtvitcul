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

// 新增：DeepL 翻译代理接口（解决前端 CORS 跨域问题）
app.post('/api/translate', async (req, res) => {
    const { text, targetLang, deeplKey } = req.body;
    
    if (!text || !deeplKey) {
        return res.status(400).json({ error: 'Missing text or deeplKey' });
    }

    try {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 
                auth_key: deeplKey, 
                text: text, 
                target_lang: targetLang.toUpperCase() 
            })
        });

        if (response.ok) {
            const data = await response.json();
            res.json({ translatedText: data.translations[0].text });
        } else {
            const errText = await response.text();
            console.error("DeepL API Error:", errText);
            res.status(response.status).json({ error: errText });
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('✅ 后端服务器已启动，请访问: http://localhost:3000/index.html');
    console.log('✅ 后台管理请访问: http://localhost:3000/admin.html');
});
