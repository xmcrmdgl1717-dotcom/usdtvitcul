const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 允许直接访问 html/css/js 文件

const DATA_FILE = path.join(__dirname, 'data.json');

// 如果 data.json 不存在，初始化它
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ langs: [], globalDict: {} }, null, 2));
}

// 获取语言和字典数据
app.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
});

// 保存语言和字典数据
app.post('/api/data', (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('后端服务器已启动: http://localhost:3000');
});
