// API客户端配置
const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('admin_token');
    }

    // 设置认证令牌
    setToken(token) {
        this.token = token;
        localStorage.setItem('admin_token', token);
    }

    // 移除令牌
    removeToken() {
        this.token = null;
        localStorage.removeItem('admin_token');
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // 添加认证头
        if (this.token && !endpoint.includes('/admin/login')) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    // 管理员登录
    async adminLogin(username, password) {
        const data = await this.request('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (data.success) {
            this.setToken(data.token);
        }

        return data;
    }

    // 提交客户咨询
    async submitCustomer(customerData) {
        return await this.request('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    }

    // 获取客户列表
    async getCustomers() {
        return await this.request('/customers');
    }

    // 删除客户
    async deleteCustomer(id) {
        return await this.request(`/customers/${id}`, {
            method: 'DELETE'
        });
    }

    // 获取统计信息
    async getStats() {
        return await this.request('/stats');
    }

    // 检查登录状态
    isLoggedIn() {
        return !!this.token;
    }
}

// 创建全局API客户端实例
window.apiClient = new ApiClient();