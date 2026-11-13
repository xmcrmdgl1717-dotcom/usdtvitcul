const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ langs: [], globalDict: {} }, null, 2));
}

// 获取数据
app.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
});

// 保存数据
app.post('/api/data', (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('✅ 后端服务器已启动，请访问: http://localhost:3000/index.html');
    console.log('✅ 后台管理请访问: http://localhost:3000/admin.html');
});
