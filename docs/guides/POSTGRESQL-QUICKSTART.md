# PostgreSQL 快速开始

## 📦 一、安装 PostgreSQL

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 启动服务
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

## 🔧 二、配置数据库

### 1. 切换到 postgres 用户
```bash
sudo -i -u postgres
```

### 2. 进入 PostgreSQL 命令行
```bash
psql
```

### 3. 创建数据库和用户
```sql
-- 创建数据库
CREATE DATABASE api_server;

-- 创建用户（如果需要）
CREATE USER api_user WITH ENCRYPTED PASSWORD 'your_password';

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE api_server TO api_user;

-- 退出
\q
```

### 4. 测试连接
```bash
# 使用 postgres 用户
psql -U postgres -d api_server

# 或使用自定义用户
psql -U api_user -d api_server -h localhost
```

## ⚙️ 三、配置项目

### 1. 配置环境变量

在项目根目录创建 `.env` 文件（或修改现有的）：

```bash
# PostgreSQL 配置
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=api_server
PG_USER=postgres
PG_PASSWORD=your_password
```

### 2. 安装依赖（已完成）
```bash
npm install pg @types/pg
```

## 🚀 四、启动服务

### 开发模式
```bash
npm run dev
```

### 生产模式
```bash
npm run build
npm start
```

## 🧪 五、测试 API

### 方法 1：使用测试脚本
```bash
./scripts/testing/test-postgres.sh
```

### 方法 2：使用 curl

#### 1. 初始化数据库表
```bash
curl -X POST http://localhost:3000/api/postgres/init
```

#### 2. 创建用户
```bash
curl -X POST http://localhost:3000/api/postgres/users \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","email":"zhangsan@example.com","age":25}'
```

#### 3. 获取所有用户
```bash
curl http://localhost:3000/api/postgres/users
```

#### 4. 获取指定用户
```bash
curl http://localhost:3000/api/postgres/users/1
```

#### 5. 更新用户
```bash
curl -X PUT http://localhost:3000/api/postgres/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age":26}'
```

#### 6. 删除用户
```bash
curl -X DELETE http://localhost:3000/api/postgres/users/1
```

## 📚 六、API 文档

完整 API 文档请查看：`docs/guides/POSTGRESQL-GUIDE.md`

## 🔍 七、常见问题

### 1. 连接失败

**错误信息：** `connection refused` 或 `could not connect to server`

**解决方法：**
```bash
# 检查 PostgreSQL 服务状态
sudo systemctl status postgresql

# 启动服务
sudo systemctl start postgresql

# 检查端口是否监听
sudo netstat -tlnp | grep 5432
```

### 2. 认证失败

**错误信息：** `password authentication failed`

**解决方法：**
```bash
# 编辑 pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# 确保有以下配置（用于本地连接）
local   all             postgres                                peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

### 3. 数据库不存在

**错误信息：** `database "api_server" does not exist`

**解决方法：**
```bash
# 创建数据库
sudo -u postgres createdb api_server

# 或使用 SQL
sudo -u postgres psql -c "CREATE DATABASE api_server;"
```

### 4. 修改 postgres 用户密码

```bash
sudo -u postgres psql

# 在 psql 中执行
ALTER USER postgres PASSWORD 'new_password';
\q
```

### 5. 允许远程连接（可选）

**编辑 postgresql.conf：**
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf

# 修改监听地址
listen_addresses = '*'  # 或指定 IP
```

**编辑 pg_hba.conf：**
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf

# 添加远程连接规则
host    all             all             0.0.0.0/0               md5
```

**重启服务：**
```bash
sudo systemctl restart postgresql
```

## 🛠️ 八、数据库管理工具

### 1. psql（命令行）
```bash
# 连接数据库
psql -U postgres -d api_server

# 常用命令
\l          # 列出所有数据库
\dt         # 列出所有表
\d users    # 查看表结构
\q          # 退出
```

### 2. pgAdmin（图形界面）
```bash
# 安装 pgAdmin
sudo apt install pgadmin4

# 访问 http://localhost/pgadmin4
```

### 3. DBeaver（跨平台）
官方网站：https://dbeaver.io/

## 📊 九、数据库备份与恢复

### 备份
```bash
# 备份单个数据库
pg_dump -U postgres api_server > backup.sql

# 备份所有数据库
pg_dumpall -U postgres > all_backup.sql
```

### 恢复
```bash
# 恢复数据库
psql -U postgres api_server < backup.sql

# 恢复所有数据库
psql -U postgres < all_backup.sql
```

## 🎓 十、学习资源

- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [node-postgres 文档](https://node-postgres.com/)
- [PostgreSQL 教程](https://www.postgresqltutorial.com/)

---

**祝你使用愉快！** 🎉
