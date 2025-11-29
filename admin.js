// 管理员配置
const ADMIN_CONFIG = {
    username: 'admin',
    password: 'jingheng2024',
    sessionKey: 'admin_logged_in'
};

// 数据存储管理
class DataManager {
    constructor() {
        this.storageKey = 'jingheng_customers';
        this.customers = this.loadCustomers();
    }

    loadCustomers() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    saveCustomers() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.customers));
    }

    getAllCustomers() {
        return this.customers;
    }

    deleteCustomer(id) {
        this.customers = this.customers.filter(customer => customer.id !== id);
        this.saveCustomers();
        return true;
    }

    getCustomer(id) {
        return this.customers.find(customer => customer.id === id);
    }

    getStatistics() {
        const today = new Date().toDateString();
        const todayCustomers = this.customers.filter(customer => {
            const customerDate = new Date(customer.timestamp).toDateString();
            return customerDate === today;
        });

        const windowCustomers = this.customers.filter(customer =>
            customer.type === '断桥铝门窗'
        );

        const sunroomCustomers = this.customers.filter(customer =>
            customer.type === '阳光房'
        );

        return {
            total: this.customers.length,
            today: todayCustomers.length,
            windows: windowCustomers.length,
            sunrooms: sunroomCustomers.length
        };
    }
}

// 会话管理
class SessionManager {
    constructor() {
        this.sessionKey = ADMIN_CONFIG.sessionKey;
    }

    isLoggedIn() {
        return sessionStorage.getItem(this.sessionKey) || localStorage.getItem(this.sessionKey);
    }

    getSessionData() {
        const sessionData = sessionStorage.getItem(this.sessionKey) || localStorage.getItem(this.sessionKey);
        if (sessionData) {
            try {
                return JSON.parse(sessionData);
            } catch (e) {
                console.error('解析会话数据失败:', e);
            }
        }
        return null;
    }

    logout() {
        sessionStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.sessionKey);
        window.location.href = 'admin-login.html';
    }

    checkAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'admin-login.html';
            return false;
        }
        return true;
    }
}

// 后台管理主类
class AdminManager {
    constructor() {
        this.dataManager = new DataManager();
        this.sessionManager = new SessionManager();
        this.init();
    }

    init() {
        // 检查登录状态
        if (!this.sessionManager.checkAuth()) {
            return;
        }

        // 显示用户信息
        this.displayUserInfo();

        // 绑定事件
        this.bindEvents();

        // 加载数据
        this.refreshData();
    }

    displayUserInfo() {
        const sessionData = this.sessionManager.getSessionData();
        if (sessionData && sessionData.username) {
            document.getElementById('current-user').textContent = sessionData.username;
        }
    }

    bindEvents() {
        // 刷新数据按钮
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.refreshData();
        });

        // 导出数据按钮
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        // 退出登录按钮
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // 模态框关闭
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // 点击模态框外部关闭
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    refreshData() {
        const customers = this.dataManager.getAllCustomers();
        this.renderCustomerTable(customers);
        this.updateStatistics();
        this.updateLastUpdateTime();
    }

    renderCustomerTable(customers) {
        const tableBody = document.getElementById('customer-table-body');
        const totalCount = document.getElementById('total-count');

        tableBody.innerHTML = '';
        totalCount.textContent = customers.length;

        if (customers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #86868b; padding: 40px;">
                        <div style="font-size: 16px; margin-bottom: 8px;">📭</div>
                        <div>暂无客户数据</div>
                    </td>
                </tr>
            `;
            return;
        }

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.escapeHtml(customer.name)}</td>
                <td>${this.escapeHtml(customer.phone)}</td>
                <td>${customer.email ? this.escapeHtml(customer.email) : '-'}</td>
                <td>${customer.type ? this.escapeHtml(customer.type) : '-'}</td>
                <td>${this.escapeHtml(customer.timestamp)}</td>
                <td class="action-buttons">
                    <button class="btn btn-small" onclick="adminManager.viewCustomer('${customer.id}')">查看</button>
                    <button class="btn btn-small btn-danger" onclick="adminManager.deleteCustomer('${customer.id}')">删除</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateStatistics() {
        const stats = this.dataManager.getStatistics();
        document.getElementById('total-customers').textContent = stats.total;
        document.getElementById('today-customers').textContent = stats.today;
        document.getElementById('window-customers').textContent = stats.windows;
        document.getElementById('sunroom-customers').textContent = stats.sunrooms;
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('last-update-time').textContent = timeString;
    }

    viewCustomer(id) {
        const customer = this.dataManager.getCustomer(id);
        if (customer) {
            this.showCustomerModal(customer);
        }
    }

    showCustomerModal(customer) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <div class="customer-detail">
                <div class="detail-item">
                    <strong>姓名：</strong>${this.escapeHtml(customer.name)}
                </div>
                <div class="detail-item">
                    <strong>电话：</strong>${this.escapeHtml(customer.phone)}
                </div>
                <div class="detail-item">
                    <strong>邮箱：</strong>${customer.email ? this.escapeHtml(customer.email) : '未填写'}
                </div>
                <div class="detail-item">
                    <strong>咨询类型：</strong>${customer.type ? this.escapeHtml(customer.type) : '未选择'}
                </div>
                <div class="detail-item">
                    <strong>咨询时间：</strong>${this.escapeHtml(customer.timestamp)}
                </div>
                <div class="detail-item">
                    <strong>咨询内容：</strong>
                    <div style="margin-top: 8px; padding: 12px; background: #f5f5f7; border-radius: 8px; line-height: 1.5;">
                        ${this.escapeHtml(customer.message).replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    deleteCustomer(id) {
        if (confirm('确定要删除这条客户记录吗？此操作不可恢复。')) {
            const success = this.dataManager.deleteCustomer(id);
            if (success) {
                this.refreshData();
                this.showNotification('客户记录已删除', 'success');
            } else {
                this.showNotification('删除失败，请重试', 'error');
            }
        }
    }

    exportData() {
        const customers = this.dataManager.getAllCustomers();
        if (customers.length === 0) {
            this.showNotification('没有数据可导出', 'warning');
            return;
        }

        // 转换为CSV格式
        const headers = ['姓名', '电话', '邮箱', '咨询类型', '咨询时间', '咨询内容'];
        const csvData = customers.map(customer => [
            customer.name,
            customer.phone,
            customer.email || '',
            customer.type || '',
            customer.timestamp,
            customer.message.replace(/"/g, '""') // 转义双引号
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        // 创建下载链接
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `客户数据_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('数据导出成功', 'success');
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    logout() {
        if (confirm('确定要退出登录吗？')) {
            this.sessionManager.logout();
        }
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
            </div>
        `;

        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#34c759' : type === 'error' ? '#ff3b30' : type === 'warning' ? '#ff9500' : '#0071e3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }

    .stat-card {
        background: #f5f5f7;
        padding: 30px 20px;
        border-radius: 12px;
        text-align: center;
        transition: transform 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-5px);
    }

    .stat-number {
        font-size: 32px;
        font-weight: 700;
        color: #0071e3;
        margin-bottom: 8px;
    }

    .stat-label {
        color: #86868b;
        font-size: 14px;
    }
`;
document.head.appendChild(style);

// 全局初始化
document.addEventListener('DOMContentLoaded', function() {
    window.adminManager = new AdminManager();
});