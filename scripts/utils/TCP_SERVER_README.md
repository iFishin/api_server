# 高精度TCP服务器

这是一个专门用于网络延迟和响应时间测试的高精度TCP服务器实现。

## 功能特性

### 核心功能
1. **高精度时间戳记录** - 使用Node.js的`process.hrtime.bigint()`实现纳秒级精度
2. **主动数据发送** - 服务端主动发送100字节测试数据
3. **往返时间测量** - 精确测量数据发送到接收回复的完整时间
4. **超时检测** - 3秒响应超时机制
5. **双重日志系统** - 详细过程日志 + 汇总结果报告

### 测试流程
1. 客户端连接到TCP服务器
2. 服务器记录连接时间戳
3. 服务器主动发送100字节测试数据，记录发送完成时间戳
4. 等待客户端回复相同数据
5. 收到回复后记录接收完成时间戳
6. 计算往返时间差并记录到日志
7. 如果3秒内未收到回复，记录为超时

## 文件结构

```
scripts/utils/
├── tcp-server.js          # 主TCP服务器实现
├── tcp-client.js          # 测试客户端工具
├── start-tcp-server.sh    # 启动脚本
└── TCP_SERVER_README.md   # 本说明文档
```

## 使用方法

### 1. 启动TCP服务器

#### 使用启动脚本（推荐）
```bash
# 使用默认配置启动（端口8888，监听所有地址）
./scripts/utils/start-tcp-server.sh

# 指定端口启动
./scripts/utils/start-tcp-server.sh -p 9999

# 指定端口和监听地址
./scripts/utils/start-tcp-server.sh -p 8888 -h 192.168.1.100

# 查看帮助
./scripts/utils/start-tcp-server.sh --help
```

#### 直接使用Node.js启动
```bash
# 默认配置
node scripts/utils/tcp-server.js

# 指定端口
node scripts/utils/tcp-server.js 9999

# 指定端口和主机地址
node scripts/utils/tcp-server.js 8888 0.0.0.0
```

### 2. 使用测试客户端

#### 使用启动脚本启动客户端
```bash
# 连接到本地服务器
./scripts/utils/start-tcp-server.sh --client 8888 localhost

# 连接到远程服务器
./scripts/utils/start-tcp-server.sh --client 8888 192.168.1.100
```

#### 直接启动客户端
```bash
# 连接到本地服务器
node scripts/utils/tcp-client.js 8888 localhost

# 连接到远程服务器  
node scripts/utils/tcp-client.js 8888 192.168.1.100
```

### 3. 使用其他TCP客户端

您也可以使用任何TCP客户端工具连接到服务器：

```bash
# 使用telnet
telnet localhost 8888

# 使用nc (netcat)
nc localhost 8888

# 使用socat
socat - TCP:localhost:8888
```

**重要**: 客户端需要将接收到的数据原样回复给服务器，以完成往返时间测试。

## 日志文件

服务器运行时会生成两个日志文件：

### 1. 详细日志文件
- **位置**: `logs/tcp-server-detail.log`
- **内容**: 详细的连接、发送、接收过程记录
- **格式**: `[高精度时间戳] 详细消息`

示例：
```
[2024-01-15 14:30:25.123456789] TCP服务器启动 - 监听 0.0.0.0:8888
[2024-01-15 14:30:30.234567890] 会话1: 客户端连接 - 192.168.1.100:54321
[2024-01-15 14:30:30.234580000] 会话1: 准备发送100字节测试数据
[2024-01-15 14:30:30.234590000] 会话1: 数据发送完成
[2024-01-15 14:30:30.236580000] 会话1: 收到数据 100 字节
[2024-01-15 14:30:30.236590000] 会话1: 数据验证成功，往返时间: 2.000000ms
```

### 2. 汇总日志文件
- **位置**: `logs/tcp-server-summary.log`
- **内容**: 每次测试的汇总结果
- **格式**: CSV格式，便于数据分析

示例：
```
# TCP服务器时间差汇总报告
# 启动时间: 2024-01-15 14:30:25.123456789
# 格式: 会话ID, 发送时间戳, 接收时间戳, 往返时间(ms), 状态

1, 2024-01-15 14:30:30.234590000, 2024-01-15 14:30:30.236590000, 2.000000, 成功
2, 2024-01-15 14:30:35.345678901, 2024-01-15 14:30:38.345678901, Infinity, 超时
3, 2024-01-15 14:30:40.456789012, 2024-01-15 14:30:40.458789012, 2.000000, 成功
```

## 技术特点

### 高精度时间测量
- 使用`process.hrtime.bigint()`获取纳秒级精度
- 时间戳格式：`YYYY-MM-DD HH:mm:ss.sssnnnnnn`（毫秒+纳秒）
- 往返时间计算精确到微秒级

### 网络优化配置
- 启用`TCP_NODELAY`选项，禁用Nagle算法
- 启用`SO_KEEPALIVE`保持连接活跃
- 优化socket缓冲区设置

### 数据验证
- 使用随机标识符确保数据完整性
- 严格验证回复数据与发送数据的一致性
- 支持多会话并发测试

## 性能考虑

### 测量精度
- 理论精度：纳秒级（实际受系统时钟精度限制）
- 实际精度：通常在微秒级别
- 网络延迟：通常在毫秒级别，足够精确测量

### 系统要求
- Node.js 10.0+ （支持`process.hrtime.bigint()`）
- Linux/macOS/Windows操作系统
- 足够的文件系统权限（用于创建日志文件）

### 并发能力
- 支持多客户端同时连接
- 最大连接数：100（可配置）
- 每个连接独立处理，互不影响

## 故障排除

### 常见问题

1. **端口被占用**
   ```
   Error: listen EADDRINUSE :::8888
   ```
   解决：更换端口号或停止占用端口的进程

2. **权限不足**
   ```
   Error: EACCES: permission denied, open 'logs/tcp-server-detail.log'
   ```
   解决：确保对logs目录有写权限

3. **客户端连接被拒绝**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:8888
   ```
   解决：确认服务器已启动且端口正确

### 调试模式

启动服务器时会在控制台显示详细日志，便于实时监控：

```bash
# 启动后显示的信息
=== TCP服务器启动成功，监听地址: 0.0.0.0:8888 ===
详细日志文件: /usr/api_server/logs/tcp-server-detail.log
汇总日志文件: /usr/api_server/logs/tcp-server-summary.log
等待客户端连接...
```

## 扩展开发

### 自定义修改

1. **修改测试数据大小**
   ```javascript
   // 在tcp-server.js中修改
   this.testData = Buffer.alloc(200, 'A'); // 改为200字节
   ```

2. **调整超时时间**
   ```javascript
   // 修改超时设置（毫秒）
   responseTimeout = setTimeout(() => {
       // ...
   }, 5000); // 改为5秒超时
   ```

3. **添加统计功能**
   ```javascript
   // 可以添加成功率、平均延迟等统计
   ```

### API接口

服务器类提供了以下方法：

```javascript
const server = new HighPrecisionTCPServer(port, host);

// 启动服务器
server.start();

// 停止服务器
server.stop();

// 获取统计信息
const stats = server.getStats();
console.log(stats);
// {
//   sessionCount: 5,
//   isListening: true,
//   address: { address: '0.0.0.0', family: 'IPv4', port: 8888 }
// }
```

## 许可证

此项目遵循MIT许可证。
