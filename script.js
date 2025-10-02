// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const countdownElement = document.getElementById('countdown');
    const redirectButton = document.getElementById('redirectBtn');

    // 设置倒计时初始值（与meta标签中的content值保持一致）
    let countdown = 3;

    // 更新倒计时显示
    function updateCountdown() {
        countdownElement.textContent = countdown;

        // 倒计时结束，执行重定向
        if (countdown <= 0) {
            redirectToHome();
            return;
        }

        // 每秒更新一次倒计时
        countdown--;
        setTimeout(updateCountdown, 1000);
    }

    // 重定向到主页函数
    function redirectToHome() {
        // 使用window.location.href进行重定向
        window.location.href = '/home/index.html';
    }

    // 手动重定向按钮点击事件
    redirectButton.addEventListener('click', function() {
        // 禁用按钮防止多次点击
        redirectButton.disabled = true;
        redirectButton.textContent = '跳转中...';

        // 执行重定向
        redirectToHome();
    });

    // 启动倒计时
    updateCountdown();

    // 备用重定向方案 - 如果meta重定向失败，使用JavaScript重定向
    setTimeout(function() {
        // 检查是否仍在当前页面
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            console.log('Meta重定向可能失败，使用JavaScript重定向');
            redirectToHome();
        }
    }, 4000); // 比meta重定向延迟多1秒
});