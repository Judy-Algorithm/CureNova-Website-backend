// 前端与后端集成的JavaScript代码示例

// 配置
const API_BASE_URL = 'http://localhost:3000/api'; // 开发环境
// const API_BASE_URL = 'https://your-backend-domain.vercel.app/api'; // 生产环境

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

// 6. 检查用户登录状态
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
  return await apiRequest('/auth/me');
}

// 10. 处理OAuth回调
function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const provider = urlParams.get('provider');
  
  if (token) {
    // 保存JWT令牌
    localStorage.setItem('authToken', token);
    
    // 获取用户信息
    getUserProfile().then(data => {
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(`${provider} 登录成功！`);
      window.location.href = '/dashboard';
    });
  }
}

// 页面加载时检查OAuth回调
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
  getUserProfile
}; 