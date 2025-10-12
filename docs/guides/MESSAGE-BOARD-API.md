# 留言板 API 文档

完整的留言板系统 API，基于 PostgreSQL + Express + TypeScript。

## 📋 功能特性

- ✅ 留言发布（支持回复功能）
- ✅ 留言查询（分页、排序、筛选）
- ✅ 留言树结构（展示评论和回复）
- ✅ 留言点赞/取消点赞
- ✅ 留言置顶/取消置顶
- ✅ 留言审核（批准/拒绝）
- ✅ 留言删除（软删除/硬删除）
- ✅ 留言搜索
- ✅ 热门留言
- ✅ 统计信息
- ✅ 批量操作
- ✅ IP 地址和 User-Agent 记录

## 🚀 快速开始

### 1. 初始化数据库表

```bash
POST /api/messages/init
```

**响应：**
```json
{
  "success": true,
  "message": "留言板表初始化成功"
}
```

## 📚 API 端点详解

### 1. 创建留言

发布新留言或回复已有留言。

**请求：**
```bash
POST /api/messages
Content-Type: application/json

{
  "user_name": "张三",
  "email": "zhangsan@example.com",
  "content": "这是一条留言",
  "parent_id": null  // null 表示顶级留言，数字表示回复某条留言
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_name": "张三",
    "email": "zhangsan@example.com",
    "content": "这是一条留言",
    "parent_id": null,
    "ip_address": "127.0.0.1",
    "user_agent": "Mozilla/5.0...",
    "status": "approved",
    "likes": 0,
    "is_pinned": false,
    "created_at": "2025-10-12T06:00:00.000Z",
    "updated_at": "2025-10-12T06:00:00.000Z"
  }
}
```

### 2. 获取留言列表

支持分页、排序、状态筛选、按父级 ID 筛选。

**请求：**
```bash
GET /api/messages?limit=20&offset=0&status=approved&parentId=null&sortBy=created_at&sortOrder=DESC
```

**参数说明：**
- `limit`: 每页数量（默认 20）
- `offset`: 偏移量（默认 0）
- `status`: 状态筛选（approved/pending/rejected/deleted，默认 approved）
- `parentId`: 父级 ID（null 表示顶级留言，数字表示某条留言的回复，不传则获取所有）
- `sortBy`: 排序字段（created_at/likes/updated_at，默认 created_at）
- `sortOrder`: 排序方向（ASC/DESC，默认 DESC）

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_name": "张三",
      "email": "zhangsan@example.com",
      "content": "这是一条留言",
      "parent_id": null,
      "status": "approved",
      "likes": 5,
      "is_pinned": true,
      "created_at": "2025-10-12T06:00:00.000Z"
    }
  ],
  "total": 100
}
```

### 3. 获取留言树

获取留言及其所有回复（树形结构）。

**请求：**
```bash
GET /api/messages/tree?limit=20&offset=0
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_name": "张三",
      "content": "这是一条留言",
      "replies": [
        {
          "id": 2,
          "user_name": "李四",
          "content": "这是回复",
          "parent_id": 1
        }
      ],
      "reply_count": 1
    }
  ],
  "total": 50
}
```

### 4. 获取指定留言

**请求：**
```bash
GET /api/messages/1
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_name": "张三",
    "content": "这是一条留言"
  }
}
```

### 5. 获取某条留言的所有回复

**请求：**
```bash
GET /api/messages/1/replies
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "user_name": "李四",
      "content": "这是回复",
      "parent_id": 1
    }
  ]
}
```

### 6. 更新留言

**请求：**
```bash
PUT /api/messages/1
Content-Type: application/json

{
  "content": "更新后的内容",
  "status": "approved"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "更新后的内容",
    "updated_at": "2025-10-12T07:00:00.000Z"
  }
}
```

### 7. 删除留言

**软删除（修改状态为 deleted）：**
```bash
DELETE /api/messages/1
```

**硬删除（从数据库彻底删除）：**
```bash
DELETE /api/messages/1?hard=true
```

**响应：**
```json
{
  "success": true,
  "message": "留言删除成功"
}
```

### 8. 点赞留言

**请求：**
```bash
POST /api/messages/1/like
```

**响应：**
```json
{
  "success": true,
  "data": {
    "likes": 6
  }
}
```

### 9. 取消点赞

**请求：**
```bash
POST /api/messages/1/unlike
```

**响应：**
```json
{
  "success": true,
  "data": {
    "likes": 5
  }
}
```

### 10. 置顶/取消置顶留言

**请求：**
```bash
POST /api/messages/1/pin
Content-Type: application/json

{
  "is_pinned": true  // true 置顶，false 取消置顶
}
```

**响应：**
```json
{
  "success": true,
  "message": "留言已置顶"
}
```

### 11. 审核留言

**请求：**
```bash
POST /api/messages/1/review
Content-Type: application/json

{
  "status": "approved"  // approved 批准，rejected 拒绝
}
```

**响应：**
```json
{
  "success": true,
  "message": "留言已批准"
}
```

### 12. 搜索留言

在用户名、邮箱、内容中搜索关键词。

**请求：**
```bash
GET /api/messages/search?keyword=测试&limit=20&offset=0
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "user_name": "测试用户",
      "content": "包含测试关键词的留言"
    }
  ],
  "total": 3
}
```

### 13. 获取热门留言

按点赞数排序获取最热留言。

**请求：**
```bash
GET /api/messages/hot?limit=10
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_name": "张三",
      "content": "最热门的留言",
      "likes": 100
    }
  ]
}
```

### 14. 获取统计信息

**请求：**
```bash
GET /api/messages/statistics
```

**响应：**
```json
{
  "success": true,
  "data": {
    "total_messages": "150",
    "approved_messages": "120",
    "pending_messages": "20",
    "rejected_messages": "5",
    "top_level_messages": "100",
    "reply_messages": "50",
    "total_likes": "500",
    "first_message_date": "2025-01-01T00:00:00.000Z",
    "last_message_date": "2025-10-12T06:00:00.000Z"
  }
}
```

### 15. 批量删除留言

**请求：**
```bash
POST /api/messages/batch-delete
Content-Type: application/json

{
  "ids": [1, 2, 3],
  "hard": false  // false 软删除，true 硬删除
}
```

**响应：**
```json
{
  "success": true,
  "message": "成功删除 3 条留言"
}
```

## 📊 数据库表结构

```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'approved',
    likes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 状态说明

留言状态 (`status`) 有以下几种：

- `pending`: 待审核
- `approved`: 已批准（显示）
- `rejected`: 已拒绝（不显示）
- `deleted`: 已删除（软删除）

## 💡 使用场景

### 场景 1：显示留言板（带分页）

```bash
# 获取第一页（20 条顶级留言）
GET /api/messages?limit=20&offset=0&parentId=null&status=approved

# 获取第二页
GET /api/messages?limit=20&offset=20&parentId=null&status=approved
```

### 场景 2：显示留言及回复（树形结构）

```bash
# 直接获取留言树
GET /api/messages/tree?limit=20&offset=0
```

### 场景 3：用户发布留言

```bash
POST /api/messages
{
  "user_name": "用户名",
  "email": "user@example.com",
  "content": "留言内容"
}
```

### 场景 4：用户回复留言

```bash
POST /api/messages
{
  "user_name": "回复者",
  "email": "replier@example.com",
  "content": "回复内容",
  "parent_id": 1  # 被回复的留言 ID
}
```

### 场景 5：管理员审核待审核留言

```bash
# 1. 获取待审核留言
GET /api/messages?status=pending

# 2. 批准留言
POST /api/messages/1/review
{
  "status": "approved"
}

# 3. 拒绝留言
POST /api/messages/2/review
{
  "status": "rejected"
}
```

### 场景 6：显示热门留言（侧边栏）

```bash
GET /api/messages/hot?limit=5
```

## 🧪 测试示例

```bash
# 1. 初始化表
curl -X POST http://localhost:3000/api/messages/init

# 2. 发布留言
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"user_name":"张三","email":"test@example.com","content":"第一条留言"}'

# 3. 回复留言
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"user_name":"李四","content":"回复第一条","parent_id":1}'

# 4. 点赞
curl -X POST http://localhost:3000/api/messages/1/like

# 5. 获取留言树
curl http://localhost:3000/api/messages/tree

# 6. 搜索
curl "http://localhost:3000/api/messages/search?keyword=第一条"

# 7. 获取统计
curl http://localhost:3000/api/messages/statistics
```

## 🎨 前端集成示例

```typescript
// 获取留言列表
const getMessages = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const response = await axios.get(`/api/messages/tree?limit=${limit}&offset=${offset}`);
  return response.data;
};

// 发布留言
const postMessage = async (data) => {
  const response = await axios.post('/api/messages', data);
  return response.data;
};

// 点赞
const likeMessage = async (id) => {
  const response = await axios.post(`/api/messages/${id}/like`);
  return response.data;
};

// 回复留言
const replyMessage = async (parentId, data) => {
  const response = await axios.post('/api/messages', {
    ...data,
    parent_id: parentId
  });
  return response.data;
};
```

## 🔐 安全建议

1. **速率限制**：添加速率限制中间件，防止刷屏
2. **内容过滤**：添加敏感词过滤
3. **验证码**：发布留言时添加验证码验证
4. **权限控制**：管理员操作（审核、删除、置顶）需要身份验证
5. **XSS 防护**：前端显示时对内容进行转义
6. **SQL 注入防护**：已使用参数化查询

---

**祝使用愉快！** 🎉
