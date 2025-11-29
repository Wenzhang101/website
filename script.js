// 数据存储管理 - 使用后端API
class DataManager {
    constructor() {
        // 不再使用localStorage，直接调用API
    }

    async addCustomer(customerData) {
        try {
            const result = await apiClient.submitCustomer(customerData);

            if (result.success) {
                this.showMessage('咨询提交成功！我们会尽快联系您。', 'success');
                return result.data;
            } else {
                throw new Error(result.error || '提交失败');
            }
        } catch (error) {
            console.error('提交咨询失败:', error);
            this.showMessage('提交失败，请稍后重试或直接联系我们。', 'error');
            throw error;
        }
    }

    showMessage(message, type = 'info') {
        // 创建消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: ${type === 'success' ? '#34c759' : type === 'error' ? '#ff3b30' : '#0071e3'};
        `;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// 页面路由管理
class PageRouter {
    constructor() {
        this.currentPage = 'home';
        this.pages = ['home', 'products', 'sunroom', 'projects', 'about', 'contact'];
        this.init();
    }

    init() {
        this.bindNavigation();
        this.showPage(this.currentPage);
    }

    bindNavigation() {
        // 导航链接点击事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page && this.pages.includes(page)) {
                    this.showPage(page);
                }
            });
        });

        // 页脚链接点击事件
        document.querySelectorAll('.footer-links a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page && this.pages.includes(page)) {
                    this.showPage(page);
                }
            });
        });

        // 轮播图按钮点击事件
        document.querySelectorAll('.carousel-slide .btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = btn.getAttribute('data-page');
                if (page && this.pages.includes(page)) {
                    this.showPage(page);
                }
            });
        });

        // 快速产品卡片点击事件
        document.querySelectorAll('.quick-product-card .btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = btn.getAttribute('data-page');
                if (page && this.pages.includes(page)) {
                    this.showPage(page);
                }
            });
        });
    }

    showPage(pageName) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 显示目标页面
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;

            // 更新导航栏激活状态
            this.updateNavActiveState(pageName);

            // 滚动到顶部
            window.scrollTo(0, 0);

        }
    }

    updateNavActiveState(pageName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });
    }
}

// 轮播图管理
class CarouselManager {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.autoPlayInterval = null;
        this.init();
    }

    init() {
        this.bindControls();
        this.startAutoPlay();
    }

    bindControls() {
        // 上一张/下一张按钮
        document.querySelector('.carousel-prev').addEventListener('click', () => {
            this.prevSlide();
        });

        document.querySelector('.carousel-next').addEventListener('click', () => {
            this.nextSlide();
        });

        // 指示器点击
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });

        // 鼠标悬停时暂停自动播放
        const carousel = document.querySelector('.carousel');
        carousel.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });

        carousel.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
    }

    showSlide(index) {
        // 隐藏所有幻灯片
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.indicators.forEach(indicator => indicator.classList.remove('active'));

        // 显示当前幻灯片
        this.slides[index].classList.add('active');
        this.indicators[index].classList.add('active');
        this.currentSlide = index;
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        this.showSlide(index);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// 后台管理
class AdminManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // 刷新数据按钮
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.refreshData();
        });

        // 模态框关闭
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // 点击模态框外部关闭
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });
    }

    refreshData() {
        const customers = this.dataManager.getAllCustomers();
        this.renderCustomerTable(customers);
    }

    renderCustomerTable(customers) {
        const tableBody = document.getElementById('customer-table-body');
        const totalCount = document.getElementById('total-count');

        tableBody.innerHTML = '';
        totalCount.textContent = customers.length;

        if (customers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #86868b;">
                        暂无客户数据
                    </td>
                </tr>
            `;
            return;
        }

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.type || '-'}</td>
                <td>${customer.timestamp}</td>
                <td class="action-buttons">
                    <button class="btn btn-small" onclick="adminManager.viewCustomer('${customer.id}')">查看</button>
                    <button class="btn btn-small btn-danger" onclick="adminManager.deleteCustomer('${customer.id}')">删除</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    viewCustomer(id) {
        const customer = this.dataManager.getCustomer(id);
        if (customer) {
            this.showCustomerModal(customer);
        }
    }

    showCustomerModal(customer) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = '客户详情';
        modalBody.innerHTML = `
            <div class="customer-detail">
                <div class="detail-item">
                    <strong>姓名：</strong>${customer.name}
                </div>
                <div class="detail-item">
                    <strong>电话：</strong>${customer.phone}
                </div>
                <div class="detail-item">
                    <strong>邮箱：</strong>${customer.email || '未填写'}
                </div>
                <div class="detail-item">
                    <strong>咨询类型：</strong>${customer.type || '未选择'}
                </div>
                <div class="detail-item">
                    <strong>咨询时间：</strong>${customer.timestamp}
                </div>
                <div class="detail-item">
                    <strong>咨询内容：</strong>
                    <div style="margin-top: 8px; padding: 12px; background: #f5f5f7; border-radius: 8px;">
                        ${customer.message}
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    deleteCustomer(id) {
        if (confirm('确定要删除这条客户记录吗？')) {
            this.dataManager.deleteCustomer(id);
            this.refreshData();
        }
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }
}

// 表单管理
class FormManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.init();
    }

    init() {
        this.bindFormEvents();
    }

    bindFormEvents() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactFormSubmit();
            });
        }
    }

    async handleContactFormSubmit() {
        const name = document.getElementById('contact-name').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const type = document.getElementById('contact-type').value;
        const message = document.getElementById('contact-message').value.trim();

        // 表单验证
        if (!name) {
            alert('请输入您的姓名');
            return;
        }

        if (!phone) {
            alert('请输入您的联系电话');
            return;
        }

        if (!message) {
            alert('请输入咨询内容');
            return;
        }

        // 手机号格式验证
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            alert('请输入正确的手机号码');
            return;
        }

        // 邮箱格式验证（如果填写了邮箱）
        if (email && !this.validateEmail(email)) {
            alert('请输入正确的邮箱地址');
            return;
        }

        // 保存客户信息
        const customerData = {
            name,
            phone,
            email,
            type,
            message
        };

        try {
            // 显示加载状态
            const submitBtn = document.querySelector('#contact-form button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;

            await this.dataManager.addCustomer(customerData);

            // 清空表单
            document.getElementById('contact-form').reset();

        } catch (error) {
            // 错误处理已经在DataManager中完成
        } finally {
            // 恢复按钮状态
            const submitBtn = document.querySelector('#contact-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = '提交咨询';
                submitBtn.disabled = false;
            }
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// 全局初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据管理器
    const dataManager = new DataManager();

    // 初始化页面路由
    const pageRouter = new PageRouter();

    // 初始化轮播图
    const carouselManager = new CarouselManager();


    // 初始化表单管理
    const formManager = new FormManager(dataManager);

    // 移动端菜单切换
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // 点击链接后关闭移动端菜单
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.8)';
            navbar.style.backdropFilter = 'blur(20px)';
        }
    });

    // 滚动动画效果现在由FadeInManager处理

    // 产品卡片悬停效果增强
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 加载动画
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

});

// 产品详情展示函数
function showProductDetail(productType) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // 产品详情数据
    const productDetails = {
        '平开窗': {
            title: '断桥铝平开窗',
            description: '采用优质断桥铝型材，卓越的隔音隔热性能，气密性优异，适合各种建筑需求。',
            features: [
                '采用6063-T5高强度铝合金型材',
                '多腔体结构设计，隔音效果达35-40分贝',
                '双层中空钢化玻璃，保温性能优异',
                '德国进口五金配件，使用寿命长',
                '多种开启方式可选（内开、外开、内开内倒）'
            ],
            specifications: [
                '型材厚度：1.4mm-2.0mm',
                '玻璃配置：5+12A+5中空玻璃',
                '颜色选择：银白、香槟、深灰、咖啡色',
                '适用场景：住宅、写字楼、酒店'
            ],
            price: '680-1280元/㎡'
        },
        '推拉窗': {
            title: '断桥铝推拉窗',
            description: '推拉顺畅，节省空间，适合各种户型需求，美观实用。',
            features: [
                '轨道式推拉设计，开启顺畅',
                '双层密封胶条，防水防尘',
                '高强度滑轮系统，承重能力强',
                '防撬设计，安全可靠',
                '节省室内空间，适合小户型'
            ],
            specifications: [
                '型材厚度：1.4mm-1.8mm',
                '玻璃配置：5+12A+5中空玻璃',
                '开启方式：左右推拉',
                '适用场景：阳台、厨房、卫生间'
            ],
            price: '550-980元/㎡'
        },
        '平开门': {
            title: '断桥铝平开门',
            description: '安全耐用，密封性能好，适合入户门使用，彰显品质。',
            features: [
                '加厚型材，防盗性能强',
                '多点锁闭系统，安全可靠',
                '优质密封胶条，隔音保温',
                '表面处理：粉末喷涂/电泳涂装',
                '可选配智能门锁系统'
            ],
            specifications: [
                '型材厚度：2.0mm-3.0mm',
                '玻璃配置：6+12A+6钢化玻璃',
                '开启方式：单开/子母门',
                '适用场景：入户门、室内门'
            ],
            price: '880-1580元/㎡'
        },
        '推拉门': {
            title: '断桥铝推拉门',
            description: '节省空间，推拉顺畅，适合阳台和室内隔断，美观实用。',
            features: [
                '吊轨/地轨两种安装方式',
                '重型滑轮，承重能力强',
                '双层中空玻璃，隔音隔热',
                '可选配纱窗，防蚊通风',
                '开启顺畅，使用寿命长'
            ],
            specifications: [
                '型材厚度：1.8mm-2.2mm',
                '玻璃配置：6+12A+6钢化玻璃',
                '开启方式：双向推拉',
                '适用场景：阳台门、室内隔断'
            ],
            price: '780-1380元/㎡'
        },
        '折叠门': {
            title: '断桥铝折叠门',
            description: '空间利用率高，开启面积大，适合大开口空间，灵活多变。',
            features: [
                '多扇折叠设计，开启面积大',
                '上吊轮系统，推拉轻便',
                '密封性能好，保温隔热',
                '可选配纱窗，通风防蚊',
                '适合大跨度空间'
            ],
            specifications: [
                '型材厚度：1.8mm-2.2mm',
                '玻璃配置：5+12A+5钢化玻璃',
                '开启方式：多扇折叠',
                '适用场景：大阳台、客厅隔断'
            ],
            price: '980-1880元/㎡'
        },
        '铝包木窗': {
            title: '铝包木窗',
            description: '结合木材温馨与铝材耐用，高端住宅首选，典雅大气。',
            features: [
                '外铝内木结构，美观耐用',
                '实木框架，天然环保',
                '铝合金外框，耐候性强',
                '三重密封设计，隔音保温',
                '高端五金配件，操作顺畅'
            ],
            specifications: [
                '木材：进口橡木/松木',
                '铝材厚度：1.8mm-2.5mm',
                '玻璃配置：6+16A+6Low-E玻璃',
                '适用场景：别墅、高端住宅'
            ],
            price: '1500-2800元/㎡'
        },
        '铝包木门': {
            title: '铝包木门',
            description: '典雅大气，保温隔音性能卓越，彰显尊贵品质。',
            features: [
                '实木门芯，隔音效果好',
                '铝合金包边，防潮防腐',
                '多点锁闭系统，安全可靠',
                '表面木纹处理，自然美观',
                '可选配智能门锁'
            ],
            specifications: [
                '木材：进口橡木/胡桃木',
                '铝材厚度：2.0mm-3.0mm',
                '玻璃配置：可选配艺术玻璃',
                '适用场景：入户门、室内门'
            ],
            price: '1800-3200元/㎡'
        },
        '铝包木阳光房': {
            title: '铝包木阳光房',
            description: '豪华配置，营造温馨舒适的休闲空间，享受阳光生活。',
            features: [
                '铝包木框架，结构稳固',
                '钢化玻璃顶棚，安全可靠',
                '可选配电动天窗，通风换气',
                '保温隔热性能优异',
                '豪华配置，提升生活品质'
            ],
            specifications: [
                '框架材料：铝包木复合型材',
                '玻璃配置：6+16A+6钢化玻璃',
                '可选配件：遮阳系统、通风系统',
                '适用场景：庭院、露台、屋顶'
            ],
            price: '2800-4500元/㎡'
        }
    };

    const product = productDetails[productType];
    if (!product) {
        alert('产品信息暂未完善');
        return;
    }

    modalTitle.textContent = product.title;
    modalBody.innerHTML = `
        <div class="product-detail">
            <div class="detail-section">
                <h4>产品描述</h4>
                <p>${product.description}</p>
            </div>

            <div class="detail-section">
                <h4>产品特点</h4>
                <ul class="feature-list">
                    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>

            <div class="detail-section">
                <h4>技术参数</h4>
                <ul class="spec-list">
                    ${product.specifications.map(spec => `<li>${spec}</li>`).join('')}
                </ul>
            </div>

            <div class="detail-section">
                <h4>参考价格</h4>
                <div class="price-display">
                    <span class="price">${product.price}</span>
                    <p style="color: #86868b; font-size: 14px; margin-top: 8px;">具体价格根据配置和尺寸确定</p>
                </div>
            </div>

            <div class="detail-section">
                <h4>立即咨询</h4>
                <p>如需了解更多详情或预约上门测量，请点击下方按钮联系我们。</p>
                <button class="btn btn-primary" onclick="pageRouter.showPage('contact'); closeModal();" style="margin-top: 15px;">
                    立即咨询
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// 模态框关闭函数
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// 浮现动画管理器
class FadeInManager {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.setupElements();
        this.setupIntersectionObserver();
    }

    setupElements() {
        // 为需要动画的元素添加类名
        const selectors = [
            '.section-title',
            '.section-subtitle',
            '.product-card',
            '.feature-card',
            '.quick-product-card',
            '.type-card',
            '.value-item',
            '.qualification-item',
            '.project-card',
            '.stat-card',
            '.contact-item',
            '.slide-content',
            '.sunroom-text',
            '.about-text'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                element.classList.add('fade-in-element');
                // 为元素添加延迟类
                const delayClass = `fade-in-delay-${(index % 5) + 1}`;
                element.classList.add(delayClass);
                this.elements.push(element);
            });
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                    // 动画完成后停止观察
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // 观察所有需要动画的元素
        this.elements.forEach(element => {
            observer.observe(element);
        });
    }
}

// 产品轮转管理器
class ProductCarouselManager {
    constructor() {
        this.carousels = [];
        this.init();
    }

    init() {
        this.setupCarousels();
    }

    setupCarousels() {
        const carouselElements = document.querySelectorAll('.product-carousel');

        // 产品图片数据
        const productImages = {
            '平开窗': [
                'images/products/pingkaichuang-1.jpg',
                'images/products/pingkaichuang-2.jpg',
                'images/products/pingkaichuang-3.jpg',
                'images/products/pingkaichuang-4.jpg'
            ],
            '推拉窗': [
                'images/products/tuilachuang-1.jpg',
                'images/products/tuilachuang-2.jpg',
                'images/products/tuilachuang-3.jpg',
                'images/products/tuilachuang-4.jpg'
            ],
            '平开门': [
                'images/products/pingkaimen-1.jpg',
                'images/products/pingkaimen-2.jpg',
                'images/products/pingkaimen-3.jpg',
                'images/products/pingkaimen-4.jpg'
            ],
            '推拉门': [
                'images/products/tuilamen-1.jpg',
                'images/products/tuilamen-2.jpg',
                'images/products/tuilamen-3.jpg',
                'images/products/tuilamen-4.jpg'
            ],
            '折叠门': [
                'images/products/zhediemen-1.jpg',
                'images/products/zhediemen-2.jpg',
                'images/products/zhediemen-3.jpg',
                'images/products/zhediemen-4.jpg'
            ],
            '铝包木窗': [
                'images/products/lvbaomuchuang-1.jpg',
                'images/products/lvbaomuchuang-2.jpg',
                'images/products/lvbaomuchuang-3.jpg',
                'images/products/lvbaomuchuang-4.jpg'
            ],
            '铝包木门': [
                'images/products/lvbaomumen-1.jpg',
                'images/products/lvbaomumen-2.jpg',
                'images/products/lvbaomumen-3.jpg',
                'images/products/lvbaomumen-4.jpg'
            ],
            '铝包木阳光房': [
                'images/products/lvbaomuyangguangfang-1.jpg',
                'images/products/lvbaomuyangguangfang-2.jpg',
                'images/products/lvbaomuyangguangfang-3.jpg',
                'images/products/lvbaomuyangguangfang-4.jpg'
            ]
        };

        carouselElements.forEach((carouselElement, index) => {
            const productType = carouselElement.getAttribute('data-product');
            const images = productImages[productType] || [
                `${productType} - 图片1`,
                `${productType} - 图片2`,
                `${productType} - 图片3`,
                `${productType} - 图片4`
            ];

            const carousel = new ProductCarousel(carouselElement, images, index);
            this.carousels.push(carousel);
        });
    }
}

// 单个产品轮转类
class ProductCarousel {
    constructor(element, images, index) {
        this.element = element;
        this.images = images;
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.index = index; // 用于延迟自动播放
        this.init();
    }

    init() {
        this.renderImages();
        this.renderIndicators();
        this.bindEvents();
        this.startAutoPlay();
    }

    renderImages() {
        const imagesContainer = this.element.querySelector('.carousel-images');
        imagesContainer.innerHTML = '';

        this.images.forEach((imageText, index) => {
            const imageDiv = document.createElement('div');
            imageDiv.className = `carousel-image ${index === 0 ? 'active' : ''}`;
            // 替换为img标签
            const img = document.createElement('img');
            img.src = imageText;
            img.alt = '产品图片';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';

            imageDiv.appendChild(img);
            imagesContainer.appendChild(imageDiv);

        });
    }

    renderIndicators() {
        const indicatorsContainer = this.element.querySelector('.carousel-indicators');
        indicatorsContainer.innerHTML = '';

        this.images.forEach((_, index) => {
            const indicator = document.createElement('span');
            indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
    }

    bindEvents() {
        const prevBtn = this.element.querySelector('.carousel-prev');
        const nextBtn = this.element.querySelector('.carousel-next');

        prevBtn.addEventListener('click', () => this.prevSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());

        // 鼠标悬停时暂停自动播放
        this.element.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });

        this.element.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
    }

    showSlide(index) {
        const images = this.element.querySelectorAll('.carousel-image');
        const indicators = this.element.querySelectorAll('.carousel-indicator');

        // 隐藏所有图片和指示器
        images.forEach(img => img.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        // 显示当前图片和指示器
        images[index].classList.add('active');
        indicators[index].classList.add('active');

        this.currentIndex = index;
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.showSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        this.showSlide(index);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        // 为不同的轮转设置不同的延迟，避免同时切换
        const delay = 4000 + (this.index * 1000);
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, delay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// 绑定模态框关闭事件
document.addEventListener('DOMContentLoaded', function() {
    // 绑定关闭按钮点击事件
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // 点击模态框外部关闭
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    // ESC键关闭模态框
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    // 初始化浮现动画管理器
    const fadeInManager = new FadeInManager();

    // 初始化产品轮转管理器
    const productCarouselManager = new ProductCarouselManager();
});