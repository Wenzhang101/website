const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'jingheng.db');
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('数据库连接失败:', err.message);
                    reject(err);
                } else {
                    console.log('成功连接到SQLite数据库');
                    this.initTables().then(resolve).catch(reject);
                }
            });
        });
    }

    initTables() {
        return new Promise((resolve, reject) => {
            // 客户信息表
            const customersTable = `
                CREATE TABLE IF NOT EXISTS customers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    email TEXT,
                    type TEXT,
                    message TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status INTEGER DEFAULT 1
                )
            `;

            // 管理员表
            const adminTable = `
                CREATE TABLE IF NOT EXISTS admin (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.run(customersTable, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.db.run(adminTable, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // 初始化管理员账号
                    this.initAdmin().then(resolve).catch(reject);
                });
            });
        });
    }

    initAdmin() {
        return new Promise((resolve, reject) => {
            const bcrypt = require('bcryptjs');
            const hashedPassword = bcrypt.hashSync('jingheng2024', 10);

            const sql = `INSERT OR IGNORE INTO admin (username, password) VALUES (?, ?)`;

            this.db.run(sql, ['admin', hashedPassword], function(err) {
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        console.log('管理员账号已创建: admin / jingheng2024');
                    }
                    resolve();
                }
            });
        });
    }

    // 添加客户
    addCustomer(customer) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO customers (name, phone, email, type, message) VALUES (?, ?, ?, ?, ?)`;

            this.db.run(sql, [
                customer.name,
                customer.phone,
                customer.email || '',
                customer.type || '',
                customer.message
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...customer });
                }
            });
        });
    }

    // 获取所有客户
    getAllCustomers() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM customers WHERE status = 1 ORDER BY timestamp DESC`;

            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 删除客户（软删除）
    deleteCustomer(id) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE customers SET status = 0 WHERE id = ?`;

            this.db.run(sql, [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    // 获取客户统计
    getCustomerStats() {
        return new Promise((resolve, reject) => {
            const stats = {};

            // 总客户数
            this.db.get(`SELECT COUNT(*) as total FROM customers WHERE status = 1`, [], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                stats.total = row.total;

                // 今日新增
                this.db.get(`SELECT COUNT(*) as today FROM customers WHERE status = 1 AND DATE(timestamp) = DATE('now')`, [], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    stats.today = row.today;

                    // 门窗咨询数
                    this.db.get(`SELECT COUNT(*) as windows FROM customers WHERE status = 1 AND type = '断桥铝门窗'`, [], (err, row) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        stats.windows = row.windows;

                        // 阳光房咨询数
                        this.db.get(`SELECT COUNT(*) as sunrooms FROM customers WHERE status = 1 AND type = '阳光房'`, [], (err, row) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            stats.sunrooms = row.sunrooms;
                            resolve(stats);
                        });
                    });
                });
            });
        });
    }

    // 验证管理员登录
    verifyAdmin(username, password) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM admin WHERE username = ?`;

            this.db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(false);
                } else {
                    const bcrypt = require('bcryptjs');
                    const isValid = bcrypt.compareSync(password, row.password);
                    resolve(isValid ? { id: row.id, username: row.username } : false);
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = Database;