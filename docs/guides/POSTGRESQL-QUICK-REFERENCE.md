# PostgreSQL 快速参考 🚀

## 环境配置

```bash
# .env 文件
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=api_server
PG_USER=postgres
PG_PASSWORD=your_password
```

## API 端点速查

| 操作 | 方法 | 端点 | 示例 |
|------|------|------|------|
| 初始化 | POST | `/api/postgres/init` | `curl -X POST http://localhost:3000/api/postgres/init` |
| 创建 | POST | `/api/postgres/users` | `curl -X POST .../users -d '{"name":"张三","email":"test@example.com"}'` |
| 列表 | GET | `/api/postgres/users` | `curl http://localhost:3000/api/postgres/users` |
| 详情 | GET | `/api/postgres/users/:id` | `curl http://localhost:3000/api/postgres/users/1` |
| 搜索 | GET | `/api/postgres/users/search?email=xxx` | `curl ".../users/search?email=test"` |
| 更新 | PUT | `/api/postgres/users/:id` | `curl -X PUT .../users/1 -d '{"age":26}'` |
| 删除 | DELETE | `/api/postgres/users/:id` | `curl -X DELETE http://localhost:3000/api/postgres/users/1` |
| 批量 | POST | `/api/postgres/users/batch` | `curl -X POST .../users/batch -d '{"users":[...]}'` |
| 统计 | GET | `/api/postgres/statistics` | `curl http://localhost:3000/api/postgres/statistics` |

## 代码示例速查

### 创建新的服务

```typescript
// server/services/myService.ts
import { pool } from '../config/postgres';

export class MyService {
    async create(data: any) {
        const query = 'INSERT INTO my_table (field) VALUES ($1) RETURNING *';
        const result = await pool.query(query, [data.field]);
        return result.rows[0];
    }
    
    async getAll() {
        const query = 'SELECT * FROM my_table ORDER BY id DESC';
        const result = await pool.query(query);
        return result.rows;
    }
}

export const myService = new MyService();
```

### 创建控制器

```typescript
// server/controllers/myController.ts
import { Request, Response } from 'express';
import { myService } from '../services/myService';

export class MyController {
    async create(req: Request, res: Response) {
        try {
            const data = await myService.create(req.body);
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const myController = new MyController();
```

### 创建路由

```typescript
// server/routes/myRoutes.ts
import express from 'express';
import { myController } from '../controllers/myController';

const router = express.Router();
router.post('/', (req, res) => myController.create(req, res));

export default router;
```

### 注册路由

```typescript
// server/app.ts
import myRoutes from '@routes/myRoutes';

app.use('/api/my', myRoutes);
```

## 常用 SQL 模式

### 插入数据
```typescript
const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *';
const result = await pool.query(query, [name, email]);
```

### 查询数据
```typescript
const query = 'SELECT * FROM users WHERE id = $1';
const result = await pool.query(query, [id]);
```

### 更新数据
```typescript
const query = 'UPDATE users SET name = $1 WHERE id = $2 RETURNING *';
const result = await pool.query(query, [name, id]);
```

### 删除数据
```typescript
const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
const result = await pool.query(query, [id]);
```

### 事务处理
```typescript
const client = await pool.connect();
try {
    await client.query('BEGIN');
    await client.query('INSERT INTO ...');
    await client.query('UPDATE ...');
    await client.query('COMMIT');
} catch (e) {
    await client.query('ROLLBACK');
    throw e;
} finally {
    client.release();
}
```

## 测试命令

```bash
# 运行测试脚本
./scripts/testing/test-postgres.sh

# 手动测试
curl -X POST http://localhost:3000/api/postgres/init
curl -X POST http://localhost:3000/api/postgres/users \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","email":"test@example.com","age":25}'
```

## 数据库管理

```bash
# 连接数据库
psql -U postgres -d api_server

# 查看表
\dt

# 查看表结构
\d users

# 查询数据
SELECT * FROM users;

# 退出
\q
```

## 文档链接

- 📖 完整文档：`docs/guides/POSTGRESQL-GUIDE.md`
- 🚀 快速开始：`docs/guides/POSTGRESQL-QUICKSTART.md`
- 📝 集成总结：`docs/guides/POSTGRESQL-INTEGRATION-SUMMARY.md`
- 🎨 前端示例：`src/views/PostgresDemoView.vue`

---

**需要帮助？** 查看完整文档或运行测试脚本！
