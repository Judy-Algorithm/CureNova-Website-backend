const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '访问被拒绝，请提供有效的token' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: '账户已被禁用' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: '无效的token' });
  }
};

const requireEmailVerification = async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({ 
      error: '请先验证您的邮箱地址',
      needsVerification: true 
    });
  }
  next();
};

const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

module.exports = {
  auth,
  requireEmailVerification,
  requireAdmin
}; 