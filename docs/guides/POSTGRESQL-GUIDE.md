# PostgreSQL HTTP API 使用指南

这是一个完整的 PostgreSQL + Express + TypeScript 示例，展示了如何在项目中使用 PostgreSQL 数据库。

## 📋 目录结构

```
server/
├── config/
│   └── postgres.ts          # PostgreSQL 连接配置
├── services/
│   └── postgresService.ts   # 业务逻辑层
├── controllers/
│   └── postgresController.ts # HTTP 请求处理层
└── routes/
    └── postgresRoutes.ts     # 路由定义
```

## 🔧 环境配置

在项目根目录创建 `.env` 文件，配置 PostgreSQL 连接信息：

```bash
# PostgreSQL 配置
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=api_server
PG_USER=postgres
PG_PASSWORD=your_password
```

## 📦 安装依赖

```bash
npm install pg @types/pg
```

## 🚀 集成到现有项目

在 `server/app.ts` 中注册路由：

```typescript
import postgresRoutes from './routes/postgresRoutes';

// 注册 PostgreSQL 路由
app.use('/api/postgres', postgresRoutes);
```

在 `server/server.ts` 中测试连接：

```typescript
import { testConnection } from './config/postgres';

// 启动时测试数据库连接
testConnection();
```

## 📚 API 接口文档

### 1. 初始化数据库表

创建 `users` 表及相关触发器。

**请求：**
```bash
POST /api/postgres/init
```

**响应：**
```json
{
  "success": true,
  "message": "数据库表初始化成功"
}
```

### 2. 创建用户

**请求：**
```bash
POST /api/postgres/users
Content-Type: application/json

{
  "name": "张三",
  "email": "zhangsan@example.com",
  "age": 25
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "age": 25,
    "created_at": "2025-10-12T06:00:00.000Z",
    "updated_at": "2025-10-12T06:00:00.000Z"
  }
}
```

### 3. 获取所有用户

**请求：**
```bash
GET /api/postgres/users?limit=10&offset=0
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "age": 25,
      "created_at": "2025-10-12T06:00:00.000Z",
      "updated_at": "2025-10-12T06:00:00.000Z"
    }
  ],
  "total": 1
}
```

### 4. 根据 ID 获取用户

**请求：**
```bash
GET /api/postgres/users/1
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "age": 25,
    "created_at": "2025-10-12T06:00:00.000Z",
    "updated_at": "2025-10-12T06:00:00.000Z"
  }
}
```

### 5. 搜索用户

**请求：**
```bash
GET /api/postgres/users/search?email=zhangsan
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "age": 25,
      "created_at": "2025-10-12T06:00:00.000Z",
      "updated_at": "2025-10-12T06:00:00.000Z"
    }
  ]
}
```

### 6. 更新用户

**请求：**
```bash
PUT /api/postgres/users/1
Content-Type: application/json

{
  "name": "张三（更新）",
  "age": 26
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三（更新）",
    "email": "zhangsan@example.com",
    "age": 26,
    "created_at": "2025-10-12T06:00:00.000Z",
    "updated_at": "2025-10-12T06:01:00.000Z"
  }
}
```

### 7. 删除用户

**请求：**
```bash
DELETE /api/postgres/users/1
```

**响应：**
```json
{
  "success": true,
  "message": "用户删除成功"
}
```

### 8. 批量创建用户

**请求：**
```bash
POST /api/postgres/users/batch
Content-Type: application/json

{
  "users": [
    {
      "name": "李四",
      "email": "lisi@example.com",
      "age": 30
    },
    {
      "name": "王五",
      "email": "wangwu@example.com",
      "age": 28
    }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "李四",
      "email": "lisi@example.com",
      "age": 30,
      "created_at": "2025-10-12T06:02:00.000Z",
      "updated_at": "2025-10-12T06:02:00.000Z"
    },
    {
      "id": 3,
      "name": "王五",
      "email": "wangwu@example.com",
      "age": 28,
      "created_at": "2025-10-12T06:02:00.000Z",
      "updated_at": "2025-10-12T06:02:00.000Z"
    }
  ]
}
```

### 9. 获取统计信息

**请求：**
```bash
GET /api/postgres/statistics
```

**响应：**
```json
{
  "success": true,
  "data": {
    "total_users": "3",
    "average_age": "27.6666666666666667",
    "first_user_date": "2025-10-12T06:00:00.000Z",
    "last_user_date": "2025-10-12T06:02:00.000Z"
  }
}
```

### 10. 执行原始查询（开发环境）

⚠️ **注意：此接口仅供开发测试，生产环境会被禁用。**

**请求：**
```bash
POST /api/postgres/query
Content-Type: application/json

{
  "sql": "SELECT * FROM users WHERE age > $1",
  "params": [25]
}
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "李四",
      "email": "lisi@example.com",
      "age": 30,
      "created_at": "2025-10-12T06:02:00.000Z",
      "updated_at": "2025-10-12T06:02:00.000Z"
    }
  ]
}
```

## 🧪 测试示例

使用 `curl` 测试 API：

```bash
# 1. 初始化数据库
curl -X POST http://localhost:3000/api/postgres/init

# 2. 创建用户
curl -X POST http://localhost:3000/api/postgres/users \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","email":"zhangsan@example.com","age":25}'

# 3. 获取所有用户
curl http://localhost:3000/api/postgres/users

# 4. 获取指定用户
curl http://localhost:3000/api/postgres/users/1

# 5. 搜索用户
curl "http://localhost:3000/api/postgres/users/search?email=zhangsan"

# 6. 更新用户
curl -X PUT http://localhost:3000/api/postgres/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age":26}'

# 7. 删除用户
curl -X DELETE http://localhost:3000/api/postgres/users/1

# 8. 批量创建
curl -X POST http://localhost:3000/api/postgres/users/batch \
  -H "Content-Type: application/json" \
  -d '{"users":[{"name":"李四","email":"lisi@example.com","age":30},{"name":"王五","email":"wangwu@example.com","age":28}]}'

# 9. 获取统计
curl http://localhost:3000/api/postgres/statistics
```

## 💡 开发建议

### 1. 服务层（Service Layer）

服务层包含纯业务逻辑，不处理 HTTP 请求：

```typescript
// server/services/yourService.ts
export class YourService {
    async createItem(data: any) {
        const query = 'INSERT INTO items (name) VALUES ($1) RETURNING *';
        const result = await pool.query(query, [data.name]);
        return result.rows[0];
    }
}
```

### 2. 控制器层（Controller Layer）

控制器处理 HTTP 请求和响应：

```typescript
// server/controllers/yourController.ts
export class YourController {
    async createItem(req: Request, res: Response) {
        try {
            const data = await yourService.createItem(req.body);
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
```

### 3. 路由层（Routes Layer）

路由定义 URL 映射：

```typescript
// server/routes/yourRoutes.ts
import { yourController } from '../controllers/yourController';

router.post('/items', (req, res) => yourController.createItem(req, res));
```

### 4. 使用事务

对于需要多个操作同时成功或失败的场景：

```typescript
const client = await pool.connect();
try {
    await client.query('BEGIN');
    
    // 执行多个操作
    await client.query('INSERT INTO table1 ...');
    await client.query('UPDATE table2 ...');
    
    await client.query('COMMIT');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
}
```

### 5. 参数化查询（防止 SQL 注入）

❌ **错误做法（SQL 注入风险）：**
```typescript
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

✅ **正确做法：**
```typescript
const query = 'SELECT * FROM users WHERE email = $1';
const result = await pool.query(query, [email]);
```

### 6. 连接池管理

- 使用连接池而非单一连接
- 设置合理的连接数限制（max）
- 及时释放连接（client.release()）
- 应用退出时关闭连接池

### 7. 错误处理

```typescript
try {
    const result = await pool.query(query, params);
    return { success: true, data: result.rows };
} catch (error) {
    const err = error as any;
    
    // 处理特定错误
    if (err.code === '23505') {
        return { success: false, error: '唯一约束违反' };
    }
    
    return { success: false, error: err.message };
}
```

## 🔒 生产环境注意事项

1. **环境变量**：敏感信息（密码）必须使用环境变量
2. **连接池配置**：根据服务器资源调整连接数
3. **SQL 注入防护**：始终使用参数化查询
4. **错误信息**：生产环境不要暴露详细错误
5. **权限控制**：添加认证和授权中间件
6. **日志记录**：记录所有数据库操作日志
7. **备份策略**：定期备份数据库
8. **性能优化**：添加索引、查询优化、缓存机制

## 📖 扩展阅读

- [node-postgres 官方文档](https://node-postgres.com/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Express 最佳实践](https://expressjs.com/en/advanced/best-practice-performance.html)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)

## 🎯 下一步

基于此示例，你可以：

1. 创建新的表和服务
2. 添加身份认证和授权
3. 实现数据验证和清洗
4. 添加缓存层（Redis）
5. 实现日志系统
6. 添加单元测试和集成测试
7. 实现 API 版本控制
8. 添加 API 文档（Swagger）

---

**最后更新：** 2025年10月12日
