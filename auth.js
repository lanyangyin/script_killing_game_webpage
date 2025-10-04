// auth.js - 用户验证工具
async function validateCredentials(user, pwd) {
    try {
        const response = await fetch('users.json');
        const users = await response.json();

        // 检查普通用户
        const ordinaryUser = users.ordinary.find(u => u.user === user && u.password === pwd);
        if (ordinaryUser) {
            return true;
        }

        // 检查游客账号
        if (user === users.tourist.user && pwd === users.tourist.password) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('验证用户失败:', error);
        return false;
    }
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function getCurrentUserParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');
    const pwd = urlParams.get('pwd');
    return { user, pwd };
}

function addUserParamsToUrl(url) {
    const { user, pwd } = getCurrentUserParams();
    if (user && pwd) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}user=${encodeURIComponent(user)}&pwd=${encodeURIComponent(pwd)}`;
    }
    return url;
}