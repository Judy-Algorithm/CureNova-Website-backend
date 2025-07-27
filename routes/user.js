const express = require('express');
const User = require('../models/User');
const { auth, requireEmailVerification, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取用户信息（需要认证）
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新用户信息
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name) {
      updates.name = name.trim();
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: '没有提供要更新的信息' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: '用户信息更新成功',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

// 更改密码
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '当前密码和新密码都是必需的' });
    }

    // 验证当前密码
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: '当前密码错误' });
    }

    // 更新密码
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: '密码更改成功' });

  } catch (error) {
    console.error('更改密码错误:', error);
    res.status(500).json({ error: '更改密码失败' });
  }
});

// 删除账户
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: '账户已成功删除' });
  } catch (error) {
    console.error('删除账户错误:', error);
    res.status(500).json({ error: '删除账户失败' });
  }
});

// 管理员功能：获取所有用户（仅管理员）
router.get('/all', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    console.error('获取所有用户错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 管理员功能：更新用户状态
router.put('/:userId/status', auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      message: '用户状态更新成功',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({ error: '更新用户状态失败' });
  }
});

// 管理员功能：删除用户
router.delete('/:userId', auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: '不能删除自己的账户' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ message: '用户删除成功' });

  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

module.exports = router; 