const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const emailService = require('../services/emailService');
const { auth } = require('../middleware/auth');
const { 
  registerValidation, 
  loginValidation, 
  resetPasswordValidation, 
  newPasswordValidation 
} = require('../middleware/validation');

const router = express.Router();

// 用户注册
router.post('/register', registerValidation, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 创建新用户
    const user = new User({
      email,
      password,
      name
    });

    // 生成邮箱验证token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // 发送验证邮件
    try {
      await emailService.sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('邮件发送失败:', emailError);
      // 即使邮件发送失败，也返回成功响应，但提示用户
      return res.status(201).json({
        message: '注册成功，但验证邮件发送失败，请联系管理员',
        user: user.toJSON()
      });
    }

    res.status(201).json({
      message: '注册成功！请检查您的邮箱并点击验证链接',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// 用户登录
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 检查账户状态
    if (!user.isActive) {
      return res.status(401).json({ error: '账户已被禁用' });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成JWT token
    const token = generateToken(user._id);

    res.json({
      message: '登录成功',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 邮箱验证
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: '验证token是必需的' });
    }

    // 查找用户
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: '验证token无效或已过期' });
    }

    // 验证邮箱
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // 发送欢迎邮件
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('欢迎邮件发送失败:', emailError);
    }

    res.json({
      message: '邮箱验证成功！',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('邮箱验证错误:', error);
    res.status(500).json({ error: '邮箱验证失败，请稍后重试' });
  }
});

// 重新发送验证邮件
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: '邮箱已经验证过了' });
    }

    // 生成新的验证token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // 发送验证邮件
    try {
      await emailService.sendVerificationEmail(email, user.name, verificationToken);
      res.json({ message: '验证邮件已重新发送' });
    } catch (emailError) {
      console.error('邮件发送失败:', emailError);
      res.status(500).json({ error: '邮件发送失败，请稍后重试' });
    }

  } catch (error) {
    console.error('重新发送验证邮件错误:', error);
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// 忘记密码
router.post('/forgot-password', resetPasswordValidation, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // 为了安全，即使用户不存在也返回成功
      return res.json({ message: '如果该邮箱已注册，重置密码邮件将发送到您的邮箱' });
    }

    // 生成密码重置token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // 发送重置密码邮件
    try {
      await emailService.sendPasswordResetEmail(email, user.name, resetToken);
      res.json({ message: '密码重置邮件已发送到您的邮箱' });
    } catch (emailError) {
      console.error('邮件发送失败:', emailError);
      res.status(500).json({ error: '邮件发送失败，请稍后重试' });
    }

  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// 重置密码
router.post('/reset-password', newPasswordValidation, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ error: '重置token是必需的' });
    }

    // 查找用户
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: '重置token无效或已过期' });
    }

    // 更新密码
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: '密码重置成功' });

  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ error: '密码重置失败，请稍后重试' });
  }
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  res.json({
    user: req.user.toJSON()
  });
});

// 登出（客户端删除token即可）
router.post('/logout', auth, async (req, res) => {
  res.json({ message: '登出成功' });
});

module.exports = router; 