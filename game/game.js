// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const userDisplay = document.getElementById('userDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginStatus = document.getElementById('loginStatus');
    const gameTitle = document.getElementById('gameTitle');
    const gameSubtitle = document.getElementById('gameSubtitle');
    const startGameBtn = document.getElementById('startGame');
    const viewRulesBtn = document.getElementById('viewRules');
    const roleCards = document.querySelectorAll('.role-card');

    // 检查登录状态
    checkLoginStatus();

    // 退出登录按钮点击事件
    logoutBtn.addEventListener('click', function() {
        logout();
    });

    // 开始游戏按钮点击事件
    startGameBtn.addEventListener('click', function() {
        startGame();
    });

    // 查看规则按钮点击事件
    viewRulesBtn.addEventListener('click', function() {
        viewRules();
    });

    // 角色卡片点击事件
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            selectRole(this.dataset.role);
        });
    });

    // 检查登录状态函数
    function checkLoginStatus() {
        // 从sessionStorage获取登录信息
        const loginData = sessionStorage.getItem('jubenshaLogin');

        if (!loginData) {
            // 未登录，跳转到登录页面
            showLoginStatus('您尚未登录，即将跳转到登录页面...', 'warning');
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        try {
            // 解析登录数据
            const loginInfo = JSON.parse(loginData);

            // 验证登录数据完整性
            if (!loginInfo.isLoggedIn || !loginInfo.username) {
                showLoginStatus('登录信息不完整，请重新登录', 'error');
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }

            // 显示用户信息
            userDisplay.textContent = loginInfo.username;

            // 根据登录类型显示不同的欢迎信息
            if (loginInfo.isGuest) {
                showLoginStatus(`欢迎游客 ${loginInfo.username}！您的游戏进度将不会被保存。`, 'warning');
                gameTitle.textContent = `游客模式 - 剧本杀推理游戏`;
                gameSubtitle.textContent = '体验完整游戏内容，注册账号可保存进度';
            } else {
                showLoginStatus(`欢迎回来，${loginInfo.username}！`, 'success');
                gameTitle.textContent = `${loginInfo.username}的剧本杀之旅`;
                gameSubtitle.textContent = '选择角色开始你的推理冒险';
            }

            // 显示登录时间（如果有）
            if (loginInfo.loginTime) {
                const loginTime = new Date(loginInfo.loginTime);
                const timeString = loginTime.toLocaleString('zh-CN');
                console.log(`登录时间: ${timeString}`);
            }

        } catch (e) {
            console.error('解析登录信息失败:', e);
            showLoginStatus('登录信息错误，请重新登录', 'error');
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    // 显示登录状态函数
    function showLoginStatus(message, type) {
        loginStatus.textContent = message;
        loginStatus.className = `status-message ${type}`;
    }

    // 退出登录函数
    function logout() {
        // 清除sessionStorage中的登录信息
        sessionStorage.removeItem('jubenshaLogin');

        // 显示退出消息
        showLoginStatus('已退出登录，即将跳转...', 'success');

        // 跳转到登录页面
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1500);
    }

    // 开始游戏函数
    function startGame() {
        // 获取登录信息
        const loginData = sessionStorage.getItem('jubenshaLogin');

        if (!loginData) {
            showLoginStatus('请先登录后再开始游戏', 'error');
            return;
        }

        // 显示开始游戏消息
        const loginInfo = JSON.parse(loginData);
        showLoginStatus(`游戏即将开始，${loginInfo.username}！准备进入剧本...`, 'success');

        // 模拟游戏加载
        startGameBtn.textContent = '加载中...';
        startGameBtn.disabled = true;

        // 模拟游戏加载过程
        setTimeout(function() {
            showLoginStatus('游戏加载完成！正在进入剧本场景...', 'success');

            // 在实际应用中，这里会跳转到具体的游戏页面
            // window.location.href = 'game-scene.html';

            // 这里我们只是模拟，3秒后重置按钮状态
            setTimeout(function() {
                startGameBtn.textContent = '开始游戏';
                startGameBtn.disabled = false;
                showLoginStatus('您已进入剧本场景，请开始您的推理！', 'success');
            }, 3000);
        }, 2000);
    }

    // 查看规则函数
    function viewRules() {
        alert(`
剧本杀游戏规则：

1. 每个玩家会被分配一个角色，拥有独特的背景故事和目标
2. 玩家需要通过对话、调查线索来推理出真相
3. 凶手需要隐藏自己的身份，其他玩家需要找出凶手
4. 游戏分为多个阶段：角色介绍、搜证、讨论和投票
5. 最终投票选出凶手，揭晓真相

祝您游戏愉快！
        `);
    }

    // 选择角色函数
    function selectRole(role) {
        // 获取登录信息
        const loginData = sessionStorage.getItem('jubenshaLogin');

        if (!loginData) {
            showLoginStatus('请先登录后再选择角色', 'error');
            return;
        }

        const loginInfo = JSON.parse(loginData);

        // 移除其他角色的选中状态
        roleCards.forEach(card => {
            card.style.borderColor = 'transparent';
            card.style.background = 'rgba(255, 255, 255, 0.1)';
        });

        // 设置当前角色为选中状态
        const selectedCard = document.querySelector(`[data-role="${role}"]`);
        selectedCard.style.borderColor = '#6a11cb';
        selectedCard.style.background = 'rgba(106, 17, 203, 0.2)';

        // 显示选择结果
        let roleName = '';
        switch(role) {
            case 'detective':
                roleName = '侦探';
                break;
            case 'suspect':
                roleName = '嫌疑人';
                break;
            case 'victim':
                roleName = '受害者';
                break;
        }

        showLoginStatus(`${loginInfo.username} 选择了 ${roleName} 角色`, 'success');
    }
});