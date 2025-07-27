# CureNova 后端 API

这是 CureNova Bioscience 官方网站的后端 API 服务，提供完整的用户认证和管理功能。

## 功能特性

### 🔐 认证系统
- **邮箱 + 密码注册登录** - 传统用户认证
- **Google OAuth 登录** - 第三方Google认证
- **GitHub OAuth 登录** - 第三方GitHub认证
- **JWT Token 认证** - 安全的无状态认证

### 📧 邮件服务
- **邮箱验证** - 注册后发送验证邮件
- **密码重置** - 忘记密码时发送重置邮件
- **欢迎邮件** - 邮箱验证成功后发送欢迎邮件

### 👤 用户管理
- **用户信息管理** - 查看和更新个人信息
- **密码管理** - 更改密码功能
- **账户管理** - 删除账户功能
- **管理员功能** - 用户管理和系统管理

## 技术栈

- **Node.js** - 运行环境
- **Express.js** - Web框架
- **MongoDB** - 数据库
- **Mongoose** - ODM
- **JWT** - 认证令牌
- **Passport.js** - OAuth认证
- **Nodemailer** - 邮件服务
- **bcryptjs** - 密码加密
- **express-validator** - 输入验证

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `env.example` 文件为 `.env` 并配置以下环境变量：

```bash
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/curenova

# JWT密钥
JWT_SECRET=your_jwt_secret_key_here

# 邮件配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# OAuth配置
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 服务器配置
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. 运行开发服务器

```bash
npm run dev
```

### 4. 生产环境部署

```bash
npm start
```

## API 端点

### 认证相关

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "张三"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### 邮箱验证
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_here"
}
```

#### 重新发送验证邮件
```
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 忘记密码
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 重置密码
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "NewPassword123"
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### OAuth 认证

#### Google OAuth
```
GET /api/oauth/google
```

#### GitHub OAuth
```
GET /api/oauth/github
```

#### OAuth 状态检查
```
GET /api/oauth/status
```

### 用户管理

#### 获取用户信息
```
GET /api/user/profile
Authorization: Bearer <jwt_token>
```

#### 更新用户信息
```
PUT /api/user/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "新名字",
  "avatar": "avatar_url"
}
```

#### 更改密码
```
PUT /api/user/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

#### 删除账户
```
DELETE /api/user/account
Authorization: Bearer <jwt_token>
```

### 管理员功能

#### 获取所有用户
```
GET /api/user/all
Authorization: Bearer <jwt_token>
```

#### 更新用户状态
```
PUT /api/user/:userId/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "isActive": true,
  "role": "admin"
}
```

#### 删除用户
```
DELETE /api/user/:userId
Authorization: Bearer <jwt_token>
```

## 部署到 Vercel

### 1. 准备部署

确保你的项目包含以下文件：
- `package.json`
- `index.js`
- `vercel.json`

### 2. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 3. 登录 Vercel

```bash
vercel login
```

### 4. 部署项目

```bash
vercel
```

### 5. 配置环境变量

在 Vercel 控制台中配置所有必要的环境变量。

## 数据库设置

### MongoDB Atlas (推荐)

1. 注册 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建新集群
3. 获取连接字符串
4. 在环境变量中设置 `MONGODB_URI`

### 本地 MongoDB

```bash
# 安装 MongoDB
brew install mongodb-community

# 启动 MongoDB
brew services start mongodb-community
```

## OAuth 配置

### Google OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据
5. 设置授权重定向 URI: `https://your-domain.vercel.app/api/oauth/google/callback`

### GitHub OAuth

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 设置授权回调 URL: `https://your-domain.vercel.app/api/oauth/github/callback`

## 邮件服务配置

### Gmail SMTP

1. 启用 Gmail 的"两步验证"
2. 生成"应用专用密码"
3. 在环境变量中配置：
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_USER=your_email@gmail.com`
   - `EMAIL_PASS=your_app_password`

## 安全特性

- **密码加密** - 使用 bcryptjs 加密存储
- **JWT 认证** - 无状态的安全认证
- **输入验证** - 使用 express-validator 验证输入
- **速率限制** - 防止 API 滥用
- **CORS 配置** - 跨域请求控制
- **Helmet** - 安全头设置

## 错误处理

所有 API 端点都包含完整的错误处理：

```json
{
  "error": "错误描述",
  "details": [
    {
      "field": "email",
      "message": "请输入有效的邮箱地址"
    }
  ]
}
```

## 开发指南

### 添加新的 API 端点

1. 在 `routes/` 目录下创建新的路由文件
2. 在 `index.js` 中注册路由
3. 添加适当的中间件（认证、验证等）
4. 编写错误处理

### 添加新的数据库模型

1. 在 `models/` 目录下创建新的模型文件
2. 定义 Schema 和验证规则
3. 添加必要的中间件（如密码加密）

### 添加新的邮件模板

1. 在 `services/emailService.js` 中添加新的邮件方法
2. 创建 HTML 和纯文本模板
3. 在相应的路由中调用邮件服务

## 测试

```bash
# 运行测试
npm test

# 运行开发服务器
npm run dev
```

## 许可证

MIT License

## 支持

如有问题，请联系开发团队。 