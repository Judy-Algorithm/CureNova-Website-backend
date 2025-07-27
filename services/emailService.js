const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }

  async sendEmail(to, subject, html, text = '') {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"CureNova Bioscience" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CureNova Bioscience</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">欢迎加入 CureNova！</h2>
          <p>亲爱的 ${name}，</p>
          <p>感谢您注册 CureNova Bioscience。请点击下面的按钮验证您的邮箱地址：</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              验证邮箱地址
            </a>
          </div>
          
          <p>或者复制以下链接到浏览器：</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          
          <p>此链接将在24小时后失效。</p>
          
          <p>如果您没有注册 CureNova 账户，请忽略此邮件。</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            此邮件由 CureNova Bioscience 系统自动发送，请勿回复。
          </p>
        </div>
      </div>
    `;

    const text = `
      欢迎加入 CureNova！
      
      亲爱的 ${name}，
      
      感谢您注册 CureNova Bioscience。请访问以下链接验证您的邮箱地址：
      
      ${verificationUrl}
      
      此链接将在24小时后失效。
      
      如果您没有注册 CureNova 账户，请忽略此邮件。
    `;

    return await this.sendEmail(email, '验证您的 CureNova 账户', html, text);
  }

  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CureNova Bioscience</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">密码重置请求</h2>
          <p>亲爱的 ${name}，</p>
          <p>我们收到了您的密码重置请求。请点击下面的按钮重置您的密码：</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              重置密码
            </a>
          </div>
          
          <p>或者复制以下链接到浏览器：</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <p>此链接将在1小时后失效。</p>
          
          <p>如果您没有请求重置密码，请忽略此邮件。</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            此邮件由 CureNova Bioscience 系统自动发送，请勿回复。
          </p>
        </div>
      </div>
    `;

    const text = `
      密码重置请求
      
      亲爱的 ${name}，
      
      我们收到了您的密码重置请求。请访问以下链接重置您的密码：
      
      ${resetUrl}
      
      此链接将在1小时后失效。
      
      如果您没有请求重置密码，请忽略此邮件。
    `;

    return await this.sendEmail(email, '重置您的 CureNova 密码', html, text);
  }

  async sendWelcomeEmail(email, name) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CureNova Bioscience</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">欢迎来到 CureNova！</h2>
          <p>亲爱的 ${name}，</p>
          <p>恭喜！您的账户已成功创建并验证。</p>
          <p>现在您可以：</p>
          <ul>
            <li>访问我们的产品页面</li>
            <li>加入我们的社区</li>
            <li>联系我们的团队</li>
          </ul>
          
          <p>感谢您选择 CureNova Bioscience！</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            此邮件由 CureNova Bioscience 系统自动发送，请勿回复。
          </p>
        </div>
      </div>
    `;

    const text = `
      欢迎来到 CureNova！
      
      亲爱的 ${name}，
      
      恭喜！您的账户已成功创建并验证。
      
      现在您可以：
      - 访问我们的产品页面
      - 加入我们的社区
      - 联系我们的团队
      
      感谢您选择 CureNova Bioscience！
    `;

    return await this.sendEmail(email, '欢迎来到 CureNova！', html, text);
  }
}

module.exports = new EmailService(); 