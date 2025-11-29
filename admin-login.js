// 管理员账号配置
const ADMIN_CONFIG = {
    username: 'admin',
    password: 'jingheng2024',
    sessionKey: 'admin_logged_in'
};

// 简单的登录管理
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // 检查是否已登录
    if (localStorage.getItem(ADMIN_CONFIG.sessionKey) || sessionStorage.getItem(ADMIN_CONFIG.sessionKey)) {
        window.location.href = 'admin.html';
        return;
    }

    // 检查记住我
    const savedSession = localStorage.getItem(ADMIN_CONFIG.sessionKey);
    if (savedSession) {
        try {
            const sessionData = JSON.parse(savedSession);
            if (sessionData.rememberMe) {
                document.getElementById('username').value = sessionData.username;
                document.getElementById('remember-me').checked = true;
            }
        } catch (e) {
            console.error('读取记住我设置失败:', e);
        }
    }

    // 表单提交事件
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // 密码框回车键支持
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    function handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // 显示加载状态
        setLoading(true);

        // 模拟网络延迟
        setTimeout(() => {
            if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
                loginSuccess(username, rememberMe);
            } else {
                loginFailed();
            }
            setLoading(false);
        }, 1000);
    }

    function loginSuccess(username, rememberMe) {
        // 创建会话
        const sessionData = {
            username: username,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe
        };

        // 存储会话信息
        if (rememberMe) {
            localStorage.setItem(ADMIN_CONFIG.sessionKey, JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem(ADMIN_CONFIG.sessionKey, JSON.stringify(sessionData));
        }

        // 显示成功消息
        showMessage('登录成功，正在跳转...', 'success');

        // 跳转到后台管理页面
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    }

    function loginFailed() {
        showMessage('账号或密码错误，请重新输入', 'error');

        // 清空密码框
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }

    function setLoading(loading) {
        const loginBtn = document.querySelector('.login-btn');
        const btnText = document.querySelector('.btn-text');
        const btnLoading = document.querySelector('.btn-loading');

        if (loading) {
            loginBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    function showMessage(message, type = 'error') {
        if (type === 'success') {
            errorMessage.style.background = '#34c759';
        } else {
            errorMessage.style.background = '#ff3b30';
        }

        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        // 3秒后自动隐藏
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});