const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const oauthRoutes = require('./routes/oauth');

const app = express();

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use(limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/oauth', oauthRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CureNova API is running',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 CureNova API server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_HOST ? 'Configured' : 'Not configured'}`);
  console.log(`🔐 OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Google configured' : 'Google not configured'}`);
  console.log(`🔐 OAuth: ${process.env.GITHUB_CLIENT_ID ? 'GitHub configured' : 'GitHub not configured'}`);
});

module.exports = app; 