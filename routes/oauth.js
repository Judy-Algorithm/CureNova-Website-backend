const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const router = express.Router();

// 配置Google OAuth策略
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/oauth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 查找现有用户
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // 用户已存在，更新最后登录时间
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // 检查邮箱是否已被其他账户使用
    const existingUserByEmail = await User.findOne({ email: profile.emails[0].value });
    if (existingUserByEmail) {
      // 如果邮箱已存在，将Google ID添加到现有账户
      existingUserByEmail.googleId = profile.id;
      existingUserByEmail.isEmailVerified = true; // OAuth用户自动验证邮箱
      existingUserByEmail.lastLogin = new Date();
      await existingUserByEmail.save();
      return done(null, existingUserByEmail);
    }

    // 创建新用户
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0]?.value || '',
      isEmailVerified: true, // OAuth用户自动验证邮箱
      lastLogin: new Date()
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// 配置GitHub OAuth策略
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/api/oauth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 查找现有用户
    let user = await User.findOne({ githubId: profile.id });
    
    if (user) {
      // 用户已存在，更新最后登录时间
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // 检查邮箱是否已被其他账户使用
    const existingUserByEmail = await User.findOne({ email: profile.emails[0]?.value });
    if (existingUserByEmail) {
      // 如果邮箱已存在，将GitHub ID添加到现有账户
      existingUserByEmail.githubId = profile.id;
      existingUserByEmail.isEmailVerified = true; // OAuth用户自动验证邮箱
      existingUserByEmail.lastLogin = new Date();
      await existingUserByEmail.save();
      return done(null, existingUserByEmail);
    }

    // 创建新用户
    user = new User({
      githubId: profile.id,
      email: profile.emails[0]?.value || `${profile.username}@github.com`,
      name: profile.displayName || profile.username,
      avatar: profile.photos[0]?.value || '',
      isEmailVerified: true, // OAuth用户自动验证邮箱
      lastLogin: new Date()
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Google OAuth路由
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email', 'openid'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // 重定向到前端，携带token
      const frontendUrl = process.env.FRONTEND_URL || 'https://cure-nova-website.vercel.app';
      const redirectUrl = `${frontendUrl}/oauth-callback?token=${token}&provider=google`;
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth错误:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'https://cure-nova-website.vercel.app';
      res.redirect(`${frontendUrl}/signup.html?error=oauth_failed`);
    }
  }
);

// GitHub OAuth路由
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'] 
}));

router.get('/github/callback', 
  passport.authenticate('github', { session: false }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // 重定向到前端，携带token
      const frontendUrl = process.env.FRONTEND_URL || 'https://cure-nova-website.vercel.app';
      const redirectUrl = `${frontendUrl}/oauth-callback?token=${token}&provider=github`;
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub OAuth错误:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'https://cure-nova-website.vercel.app';
      res.redirect(`${frontendUrl}/signup.html?error=oauth_failed`);
    }
  }
);

// OAuth状态检查
router.get('/status', (req, res) => {
  res.json({
    google: {
      enabled: !!process.env.GOOGLE_CLIENT_ID,
      clientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured'
    },
    github: {
      enabled: !!process.env.GITHUB_CLIENT_ID,
      clientId: process.env.GITHUB_CLIENT_ID ? 'configured' : 'not configured'
    }
  });
});

module.exports = router; 