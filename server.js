const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'jingheng_secret_key_2024';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // 提供静态文件服务

const db = new Database();

// JWT验证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '令牌无效' });
        }
        req.user = user;
        next();
    });
};

// 管理员登录
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        const admin = await db.verifyAdmin(username, password);

        if (admin) {
            const token = jwt.sign(
                { id: admin.id, username: admin.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: '登录成功',
                token,
                user: admin
            });
        } else {
            res.status(401).json({ error: '用户名或密码错误' });
        }
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 添加客户咨询
app.post('/api/customers', async (req, res) => {
    try {
        const { name, phone, email, type, message } = req.body;

        // 基本验证
        if (!name || !phone) {
            return res.status(400).json({ error: '姓名和电话不能为空' });
        }

        // 手机号格式验证
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: '手机号格式不正确' });
        }

        const customer = {
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : '',
            type: type ? type.trim() : '',
            message: message ? message.trim() : ''
        };

        const result = await db.addCustomer(customer);

        res.json({
            success: true,
            message: '咨询提交成功',
            data: result
        });
    } catch (error) {
        console.error('添加客户错误:', error);
        res.status(500).json({ error: '提交失败，请稍后重试' });
    }
});

// 获取所有客户（需要认证）
app.get('/api/customers', authenticateToken, async (req, res) => {
    try {
        const customers = await db.getAllCustomers();
        res.json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error('获取客户列表错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 删除客户（需要认证）
app.delete('/api/customers/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const success = await db.deleteCustomer(id);

        if (success) {
            res.json({
                success: true,
                message: '客户记录已删除'
            });
        } else {
            res.status(404).json({ error: '客户记录不存在' });
        }
    } catch (error) {
        console.error('删除客户错误:', error);
        res.status(500).json({ error: '删除失败' });
    }
});

// 获取统计信息（需要认证）
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await db.getCustomerStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('获取统计信息错误:', error);
        res.status(500).json({ error: '获取统计信息失败' });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
async function startServer() {
    try {
        await db.connect();

        app.listen(PORT, () => {
            console.log(`服务器运行在 http://localhost:${PORT}`);
            console.log('API端点:');
            console.log('  POST /api/admin/login - 管理员登录');
            console.log('  POST /api/customers - 添加客户咨询');
            console.log('  GET  /api/customers - 获取客户列表（需认证）');
            console.log('  DELETE /api/customers/:id - 删除客户（需认证）');
            console.log('  GET  /api/stats - 获取统计信息（需认证）');
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
}

startServer();

// 优雅关闭
process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    db.close();
    process.exit(0);
});