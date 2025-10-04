// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const guestButton = document.querySelector('.btn-guest');
    const rememberCheckbox = document.getElementById('remember');

    // 检查是否有保存的登录信息
    checkSavedLogin();

    // 登录表单提交事件
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止表单默认提交行为

        // 获取输入值
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // 表单验证
        if (!validateForm(username, password)) {
            return;
        }

        // 处理登录
        handleLogin(username, password, rememberCheckbox.checked);
    });

    // 游客登录按钮点击事件
    guestButton.addEventListener('click', function() {
        handleGuestLogin();
    });

    // 表单验证函数
    function validateForm(username, password) {
        // 检查用户名是否为空
        if (username === '') {
            showMessage('请输入用户名', 'error');
            usernameInput.focus();
            return false;
        }

        // 检查密码是否为空
        if (password === '') {
            showMessage('请输入密码', 'error');
            passwordInput.focus();
            return false;
        }

        // 检查用户名长度
        if (username.length < 3) {
            showMessage('用户名至少需要3个字符', 'error');
            usernameInput.focus();
            return false;
        }

        // 检查密码长度
        if (password.length < 6) {
            showMessage('密码至少需要6个字符', 'error');
            passwordInput.focus();
            return false;
        }

        return true;
    }

    // 处理登录函数
    // 修改 handleLogin 函数
    async function handleLogin(username, password, remember) {
        const submitBtn = document.querySelector('.btn-login');
        const originalText = submitBtn.textContent;

        // 显示加载状态
        submitBtn.textContent = '登录中...';
        submitBtn.disabled = true;

        try {
            // 验证用户
            const validation = await validateUser(username, password);

            if (validation.isValid) {
                // 存储登录状态到sessionStorage
                const loginData = {
                    isLoggedIn: true,
                    username: username,
                    isGuest: validation.isTourist,
                    loginTime: new Date().toISOString()
                };
                sessionStorage.setItem('jubenshaLogin', JSON.stringify(loginData));

                // 如果勾选了"记住我"，保存登录信息到localStorage
                if (remember) {
                    localStorage.setItem('jubenshaRemember', JSON.stringify({
                        username: username
                    }));
                }

                showMessage(`欢迎 ${username}！登录成功`, 'success');

                // 跳转到主页，传递用户参数
                setTimeout(function() {
                    const params = new URLSearchParams({
                        user: username,
                        pwd: password
                    });
                    window.location.href = `index.html?${params.toString()}`;
                }, 1500);
            } else {
                showMessage('用户名或密码错误，请重试', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            showMessage('登录失败，请稍后重试', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // 验证用户函数
    async function validateUser(username, password) {
        try {
            const response = await fetch('users.json');
            const users = await response.json();

            // 检查普通用户
            const ordinaryUser = users.ordinary.find(u => u.user === username && u.password === password);
            if (ordinaryUser) {
                return { isValid: true, isTourist: false };
            }

            // 检查游客账号
            if (username === users.tourist.user && password === users.tourist.password) {
                return { isValid: true, isTourist: true };
            }

            return { isValid: false };
        } catch (error) {
            console.error('验证用户失败:', error);
            return { isValid: false };
        }
    }

    // 处理游客登录函数
    // 修改 handleGuestLogin 函数
    async function handleGuestLogin() {
        const guestBtn = document.querySelector('.btn-guest');
        const originalText = guestBtn.textContent;

        // 显示加载状态
        guestBtn.textContent = '进入中...';
        guestBtn.disabled = true;

        try {
            const response = await fetch('users.json');
            const users = await response.json();

            const guestUsername = '游客_' + Math.floor(Math.random() * 10000);

            // 存储游客登录状态到sessionStorage
            const loginData = {
                isLoggedIn: true,
                username: guestUsername,
                isGuest: true,
                loginTime: new Date().toISOString()
            };
            sessionStorage.setItem('jubenshaLogin', JSON.stringify(loginData));

            showMessage(`欢迎 ${guestUsername}！您已进入游客模式`, 'success');

            // 跳转到主页，使用游客账号密码
            setTimeout(function() {
                const params = new URLSearchParams({
                    user: users.tourist.user,
                    pwd: users.tourist.password
                });
                window.location.href = `index.html?${params.toString()}`;
            }, 1500);
        } catch (error) {
            showMessage('游客登录失败，请稍后重试', 'error');
            guestBtn.textContent = originalText;
            guestBtn.disabled = false;
        }
    }

    // 显示消息函数
    function showMessage(message, type) {
        // 移除可能已存在的消息
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;

        // 添加样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 50px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: fadeIn 0.3s ease;
        `;

        // 根据消息类型设置背景颜色
        if (type === 'success') {
            messageEl.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        } else if (type === 'error') {
            messageEl.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
        } else {
            messageEl.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
        }

        // 添加到页面
        document.body.appendChild(messageEl);

        // 3秒后自动移除消息
        setTimeout(function() {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'fadeOut 0.3s ease';
                setTimeout(function() {
                    if (messageEl.parentNode) {
                        messageEl.remove();
                    }
                }, 300);
            }
        }, 3000);

        // 添加淡入动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; top: 0; }
                to { opacity: 1; top: 20px; }
            }
            @keyframes fadeOut {
                from { opacity: 1; top: 20px; }
                to { opacity: 0; top: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // 检查保存的登录信息函数
    function checkSavedLogin() {
        const savedLogin = localStorage.getItem('jubenshaRemember');

        if (savedLogin) {
            try {
                const loginData = JSON.parse(savedLogin);
                if (loginData.username) {
                    usernameInput.value = loginData.username;
                    rememberCheckbox.checked = true;
                }
            } catch (e) {
                console.error('解析保存的登录信息失败:', e);
            }
        }
    }
});