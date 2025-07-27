// 前端与后端集成的JavaScript代码示例

// 配置
const API_BASE_URL = 'http://localhost:3000/api'; // 开发环境
// const API_BASE_URL = 'https://curenova-website-backend.onrender.com/api'; // 生产环境

// 1. Google OAuth登录
function loginWithGoogle() {
  window.location.href = `${API_BASE_URL}/oauth/google`;
}

// 2. GitHub OAuth登录
function loginWithGitHub() {
  window.location.href = `${API_BASE_URL}/oauth/github`;
}

// 3. 邮箱注册
async function registerWithEmail(name, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // 注册成功，显示提示信息
      alert('注册成功！请检查您的邮箱并点击验证链接。');
      return data;
    } else {
      // 注册失败，显示错误信息
      alert(`注册失败: ${data.error}`);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('注册错误:', error);
    alert('注册失败，请稍后重试');
  }
}

// 4. 邮箱登录
async function loginWithEmail(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // 登录成功，保存JWT令牌
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 更新UI显示用户头像
      updateAuthUI();
      
      // 跳转到主页或用户仪表板
      window.location.href = '/dashboard';
      return data;
    } else {
      // 登录失败，显示错误信息
      alert(`登录失败: ${data.error}`);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('登录错误:', error);
    alert('登录失败，请稍后重试');
  }
}

// 5. 邮箱验证
async function verifyEmail(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('邮箱验证成功！');
      return data;
    } else {
      alert(`邮箱验证失败: ${data.error}`);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('邮箱验证错误:', error);
    alert('邮箱验证失败，请稍后重试');
  }
}

// 6. 检查认证状态
function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    return {
      isLoggedIn: true,
      user: JSON.parse(user),
      token
    };
  }
  
  return {
    isLoggedIn: false,
    user: null,
    token: null
  };
}

// 7. 登出
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // 更新UI，隐藏用户头像，显示登录按钮
  updateAuthUI();
  
  window.location.href = '/';
}

// 8. 发送API请求（带认证）
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options
  });

  if (response.status === 401) {
    // 令牌无效，清除本地存储并重定向到登录页
    logout();
    return;
  }

  return response.json();
}

// 9. 获取用户信息
async function getUserProfile() {
  return await apiRequest('/user/profile');
}

// 10. 更新认证UI（显示/隐藏用户头像）
async function updateAuthUI() {
  const token = localStorage.getItem('authToken');
  
  // 查找或创建用户头像显示区域
  let userProfileDisplay = document.getElementById('userProfileDisplay');
  if (!userProfileDisplay) {
    userProfileDisplay = document.createElement('div');
    userProfileDisplay.id = 'userProfileDisplay';
    userProfileDisplay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.95);
      padding: 10px 15px;
      border-radius: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      backdrop-filter: blur(10px);
    `;
    document.body.appendChild(userProfileDisplay);
  }

  // 查找登录/注册相关元素
  const authContainer = document.querySelector('.auth-container');
  const oauthButtons = document.querySelector('.oauth-buttons');
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const loginLink = document.querySelector('.login-link');
  const messageDiv = document.getElementById('message');

  if (token) {
    // 用户已登录
    try {
      const response = await getUserProfile();
      if (response && response.user) {
        const user = response.user;
        
        // 隐藏登录/注册相关元素
        if (oauthButtons) oauthButtons.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'none';
        if (loginLink) loginLink.style.display = 'none';
        if (messageDiv) messageDiv.style.display = 'none';
        if (authContainer) authContainer.style.display = 'none';

        // 显示用户头像和名称
        const avatarUrl = user.avatar || 'https://via.placeholder.com/40x40/4A90E2/FFFFFF?text=' + user.name.charAt(0).toUpperCase();
        
        userProfileDisplay.innerHTML = `
          <img src="${avatarUrl}" alt="User Avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #4A90E2;">
          <span style="font-weight: 500; color: #333;">${user.name}</span>
          <button onclick="authAPI.logout()" style="
            margin-left: 10px; 
            padding: 6px 12px; 
            background-color: #dc3545; 
            color: white; 
            border: none; 
            border-radius: 15px; 
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.3s;
          " onmouseover="this.style.backgroundColor='#c82333'" onmouseout="this.style.backgroundColor='#dc3545'">
            登出
          </button>
        `;
        userProfileDisplay.style.display = 'flex';
        
        // 更新localStorage中的用户信息
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // token无效或用户不存在，清除token并显示登录界面
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        userProfileDisplay.style.display = 'none';
        if (authContainer) authContainer.style.display = 'block';
        if (oauthButtons) oauthButtons.style.display = 'flex';
        if (registerForm) registerForm.style.display = 'block';
        if (loginLink) loginLink.style.display = 'block';
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 清除无效token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      userProfileDisplay.style.display = 'none';
      if (authContainer) authContainer.style.display = 'block';
      if (oauthButtons) oauthButtons.style.display = 'flex';
      if (registerForm) registerForm.style.display = 'block';
      if (loginLink) loginLink.style.display = 'block';
    }
  } else {
    // 用户未登录
    userProfileDisplay.style.display = 'none';
    if (authContainer) authContainer.style.display = 'block';
    if (oauthButtons) oauthButtons.style.display = 'flex';
    if (registerForm) registerForm.style.display = 'block';
    if (loginLink) loginLink.style.display = 'block';
  }
}

// 11. 处理OAuth回调
function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const provider = urlParams.get('provider');
  
  if (token) {
    // 保存JWT令牌
    localStorage.setItem('authToken', token);
    
    // 获取用户信息并更新UI
    getUserProfile().then(response => {
      if (response && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        updateAuthUI();
        alert(`${provider} 登录成功！`);
        window.location.href = '/dashboard';
      }
    }).catch(error => {
      console.error('OAuth回调处理失败:', error);
      alert('登录失败，请重试');
    });
  }
}

// 页面加载时检查OAuth回调和更新UI
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否是OAuth回调页面
  if (window.location.search.includes('token=')) {
    handleOAuthCallback();
  }
  
  // 检查邮箱验证
  const urlParams = new URLSearchParams(window.location.search);
  const emailToken = urlParams.get('token');
  if (emailToken && window.location.pathname.includes('verify-email')) {
    verifyEmail(emailToken);
  }
  
  // 更新认证UI
  updateAuthUI();
});

// 导出函数供HTML使用
window.authAPI = {
  loginWithGoogle,
  loginWithGitHub,
  registerWithEmail,
  loginWithEmail,
  verifyEmail,
  checkAuthStatus,
  logout,
  getUserProfile,
  updateAuthUI
}; 