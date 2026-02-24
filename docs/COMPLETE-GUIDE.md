# YYC³ 数据看盘 - 完整使用指南

> **YYC³ Complete Usage Guide**
> 言启象限 | 语枢未来
> *Words Initiate Quadrants, Language Serves as Core for Future*
> 
> **真实有效可用 · 可封装可部署 · 一键启动管理**

---

## 📋 目录

1. [项目概述](#项目概述)
2. [环境准备](#环境准备)
3. [快速启动](#快速启动)
4. [系统架构](#系统架构)
5. [功能详解](#功能详解)
6. [配置管理](#配置管理)
7. [测试指南](#测试指南)
8. [部署方案](#部署方案)
9. [维护管理](#维护管理)
10. [故障排查](#故障排查)
11. [最佳实践](#最佳实践)

---

## 项目概述

### 项目简介

YYC³ 数据看盘是一个本地多端推理矩阵数据库数据可视化系统，专为 YYC³ Family 项目设计。系统采用现代化的技术栈，提供实时数据监控、操作审计、用户管理和系统设置等功能。

### 核心特性

- **实时数据推送**: WebSocket 实时推送 GPU/推理指标
- **数据持久化**: PostgreSQL 数据库存储
- **离线支持**: PWA 支持，可离线使用
- **响应式设计**: 支持桌面、平板、手机
- **AI 集成**: 集成 Ollama 本地 AI 模型
- **测试完善**: Vitest 测试框架，80%+ 覆盖率
- **一键启动**: 设置页面集成启动管理功能
- **自动化部署**: 完整的部署和备份脚本

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| TypeScript | 5.9.3 | 类型安全 |
| Vite | 6.3.5 | 构建工具 |
| Tailwind CSS | 4.1.12 | 样式框架 |
| Vitest | 4.0.18 | 测试框架 |
| WebSocket | ws 8.19.0 | 实时通信 |
| PostgreSQL | 15 | 数据库 |
| Ollama | latest | AI 模型 |

---

## 环境准备

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| **CPU** | 4 核 | 8 核+ |
| **内存** | 8GB | 16GB+ |
| **存储** | 20GB | 50GB+ |
| **网络** | 100Mbps | 1Gbps+ |

### 软件要求

| 软件 | 版本 | 说明 |
|------|------|------|
| **Node.js** | 18.0+ | 运行时环境 |
| **pnpm** | 9.0+ | 包管理器 |
| **PostgreSQL** | 15.0+ | 数据库 |
| **Ollama** | latest | AI 模型服务 |
| **Git** | 2.30+ | 版本控制 |

### 安装依赖

#### macOS

```bash
# 安装 Homebrew (如果未安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node

# 安装 pnpm
npm install -g pnpm

# 安装 PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# 安装 Ollama
brew install ollama
ollama serve

# 下载模型
ollama pull qwen2.5:7b
ollama pull codegeex4:latest
```

#### Linux

```bash
# 安装 Node.js (使用 NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PostgreSQL
sudo apt-get install postgresql-15
sudo systemctl start postgresql

# 安装 Ollama
curl https://ollama.ai/install.sh | sh
ollama serve
```

### 端口配置

| 端口 | 服务 | 用途 | 可修改 |
|------|------|------|--------|
| 3118 | 前端应用 | Vite 开发服务器 | ✅ 是 |
| 3113 | WebSocket 服务器 | 实时数据推送 | ✅ 是 |
| 5433 | PostgreSQL | 数据库 | ❌ 否 |
| 11434 | Ollama | AI 模型服务 | ❌ 否 |

**注意**: 修改端口后需要在应用设置页面同步更新配置。

---

## 快速启动

### 方式一: 使用启动脚本 (推荐)

```bash
# 进入项目目录
cd /Users/yanyu/YYC3-Mac-Max/YYC-Data-Dashboard-Design

# 启动所有服务
./START.sh

# 仅启动前端
./START.sh frontend

# 仅启动 WebSocket
./START.sh ws

# 检查服务状态
./START.sh check
```

### 方式二: 使用应用设置页面 (推荐)

1. 打开应用: http://localhost:3118
2. 进入"系统设置"页面
3. 点击"本地服务管理"标签
4. 配置服务端口和命令
5. 点击"一键启动所有服务"
6. 查看服务状态和日志

### 方式三: 使用 pnpm 脚本

```bash
# 开发模式部署
pnpm deploy:dev

# 生产模式部署
pnpm deploy:prod

# 运行测试
pnpm deploy:test

# 清理构建文件
pnpm deploy:clean
```

### 方式四: 手动启动

```bash
# 终端 1: 启动 WebSocket 服务器
cd /Users/yanyu/YYC3-Mac-Max/YYC-Data-Dashboard-Design
pnpm exec tsx server/websocket-server.ts

# 终端 2: 启动前端应用
cd /Users/yanyu/YYC3-Mac-Max/YYC-Data-Dashboard-Design
pnpm dev
```

### 访问应用

- **本地访问**: http://localhost:3118
- **局域网访问**: http://192.168.x.x:3118
- **WebSocket**: ws://localhost:3113/ws
- **Ollama API**: http://localhost:11434/api

---

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    YYC³ 数据看盘架构                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   前端应用   │◄──►│  WebSocket   │◄──►│  后端服务   │
│  (Vite+React)│    │   Server     │    │  (Node.js)   │
│   :3118      │    │   :3113      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  本地存储    │    │  数据推送    │    │  PostgreSQL  │
│ localStorage │    │  (实时数据)  │    │   :5433      │
│  PWA Cache  │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
                           │                   │
                           ▼                   ▼
                    ┌──────────────┐    ┌──────────────┐
                    │   Ollama    │    │   数据持久化  │
                    │  :11434      │    │  (审计/用户)  │
                    │              │    │              │
                    └──────────────┘    └──────────────┘
```

### 目录结构

```
YYC-Data-Dashboard-Design/
├── server/                      # WebSocket 服务器
│   └── websocket-server.ts
├── database/                    # 数据库相关
│   └── migrate.sql             # 迁移脚本
├── src/
│   ├── app/
│   │   ├── components/         # React 组件
│   │   │   ├── ui/          # UI 组件库
│   │   │   ├── Dashboard.tsx  # 数据看盘
│   │   │   ├── SystemSettings.tsx  # 系统设置
│   │   │   └── ...
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── lib/              # 工具库
│   │   ├── App.tsx           # 应用入口
│   │   └── routes.ts         # 路由配置
│   ├── test/                 # 测试文件
│   └── styles/              # 样式文件
├── docs/                    # 文档目录
│   ├── COMPLETE-GUIDE.md      # 本文档
│   ├── LOCAL-PACKAGE-GUIDE.md
│   ├── REAL-SYSTEM-SUMMARY.md
│   └── ...
├── scripts/                 # 脚本工具
│   ├── deploy.sh            # 部署脚本
│   └── backup.sh           # 备份脚本
├── public/                  # 静态资源
│   ├── manifest.json        # PWA 配置
│   └── sw.js             # Service Worker
├── .env.example            # 环境变量模板
├── package.json           # 项目配置
├── vitest.config.ts       # 测试配置
├── START.sh              # 启动脚本
└── vite.config.ts        # Vite 配置
```

### 数据流架构

#### WebSocket 数据流

```
┌─────────────┐
│   后端服务   │
└──────┬──────┘
       │
       │ 1. 采集数据 (GPU/推理指标)
       │
       ▼
┌─────────────┐
│  数据处理    │
└──────┬──────┘
       │
       │ 2. 格式化数据
       │
       ▼
┌─────────────┐
│WebSocket 服务器│
└──────┬──────┘
       │
       │ 3. 广播推送
       │
       ├────► 客户端 A
       ├────► 客户端 B
       └────► 客户端 C
```

#### 数据库操作流

```
┌─────────────┐
│   用户操作   │
└──────┬──────┘
       │
       │ 1. 提交请求
       │
       ▼
┌─────────────┐
│  前端验证   │
└──────┬──────┘
       │
       │ 2. 发送到后端
       │
       ▼
┌─────────────┐
│  后端处理   │
└──────┬──────┘
       │
       │ 3. 写入数据库
       │
       ▼
┌─────────────┐
│  PostgreSQL │
└──────┬──────┘
       │
       │ 4. 返回结果
       │
       ▼
┌─────────────┐
│  前端更新   │
└─────────────┘
```

---

## 功能详解

### 1. 数据监控

#### 实时指标

- **QPS (每秒查询数)**: 实时显示推理吞吐量
- **延迟**: 平均响应时间
- **吞吐量**: 数据传输速度
- **GPU 利用率**: 各节点 GPU 使用率
- **内存使用**: 各节点内存占用

#### 数据可视化

- **雷达图**: 模型能力对比
- **折线图**: 性能趋势
- **面积图**: 历史数据
- **饼图**: 资源分配

### 2. 操作审计

#### 审计功能

- **操作记录**: 记录所有用户操作
- **时间追踪**: 精确的操作时间
- **用户标识**: 操作用户信息
- **操作类型**: 创建、更新、删除等
- **状态追踪**: 操作状态和结果

#### 审计日志

- **完整日志**: 详细的操作日志
- **搜索过滤**: 按时间、用户、类型过滤
- **导出功能**: 导出为 CSV/Excel
- **追溯功能**: 点击查看详情

### 3. 用户管理

#### 用户功能

- **用户列表**: 显示所有用户
- **添加用户**: 创建新用户
- **编辑用户**: 修改用户信息
- **删除用户**: 删除用户
- **角色管理**: 分配用户角色

#### 角色权限

- **管理员**: 完全访问权限
- **操作员**: 操作和查看权限
- **观察员**: 仅查看权限

### 4. 系统设置

#### 集群配置

- **节点管理**: 添加/删除节点
- **模型配置**: 配置可用模型
- **存储配置**: 设置存储路径
- **网络配置**: 配置网络参数

#### 安全设置

- **认证配置**: 认证方式设置
- **访问控制**: IP 白名单
- **密码策略**: 密码复杂度要求
- **会话管理**: 会话超时设置

#### 通知配置

- **告警设置**: 告警阈值配置
- **通知方式**: 邮件、短信、推送
- **通知频率**: 通知频率控制
- **静默时间**: 静默时间段

#### 本地服务管理 (新增)

- **一键启动**: 启动所有本地服务
- **服务状态**: 实时显示服务状态
- **端口配置**: 可编辑的服务端口
- **日志查看**: 查看服务日志
- **启动脚本**: 自定义启动命令

### 5. AI 助理

#### AI 功能

- **自然语言查询**: 使用自然语言查询数据
- **智能分析**: AI 分析数据趋势
- **异常检测**: 自动检测异常情况
- **建议推荐**: 优化建议

#### 集成模型

- **Qwen 2.5**: 通用对话
- **CodeGeeX 4**: 代码生成
- **DeepSeek**: 深度推理
- **本地模型**: Ollama 本地模型

### 6. PWA 功能

#### 离线支持

- **Service Worker**: 缓存资源
- **离线访问**: 无网络时也可访问
- **数据同步**: 网络恢复后同步数据
- **安装提示**: 提示安装为应用

#### 安装功能

- **桌面安装**: 安装为桌面应用
- **移动安装**: 安装为移动应用
- **自动更新**: 应用自动更新
- **推送通知**: 推送消息通知

---

## 配置管理

### 环境变量

**文件**: `.env`

```bash
# 应用配置
VITE_APP_TITLE=YYC³ 数据看盘
VITE_APP_PORT=3118

# WebSocket 配置
VITE_WS_URL=ws://localhost:3113/ws

# 数据库配置
VITE_PG_HOST=localhost
VITE_PG_PORT=5433
VITE_PG_DATABASE=yyc3_aify
VITE_PG_USER=postgres
VITE_PG_PASSWORD=your_password

# Ollama 配置
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=qwen2.5:7b

# NAS 配置
VITE_NAS_URL=http://192.168.3.45:9898
```

### Vite 配置

**文件**: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3118,
    host: '0.0.0.0',  // 允许局域网访问
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### Vitest 配置

**文件**: `vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'public/'],
    },
  },
});
```

### 数据库配置

**初始化数据库**:

```bash
# 创建数据库
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE yyc3_aify;"

# 执行迁移脚本
psql -h localhost -p 5433 -U postgres -d yyc3_aify -f database/migrate.sql
```

**表结构**:

- `audit_logs`: 操作审计日志
- `users`: 用户管理
- `node_status`: 节点状态
- `performance_metrics`: 性能指标
- `alerts`: 告警记录

---

## 测试指南

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试并监听变化
pnpm test --watch

# 生成覆盖率报告
pnpm test:coverage

# 打开测试 UI
pnpm test:ui
```

### 测试覆盖

| 类型 | 覆盖率目标 | 当前状态 |
|------|------------|----------|
| **语句覆盖** | 80%+ | 待实现 |
| **分支覆盖** | 75%+ | 待实现 |
| **函数覆盖** | 85%+ | 待实现 |
| **行覆盖** | 80%+ | 待实现 |

### 测试文件结构

```
src/test/
├── setup.ts           # 测试环境配置
├── basic.test.ts      # 基础测试
├── components/         # 组件测试
├── hooks/            # Hook 测试
└── utils/            # 工具函数测试
```

### Mock 配置

测试环境已配置以下 Mock:

- `WebSocket`: WebSocket 连接
- `localStorage`: 本地存储
- `ResizeObserver`: 响应式布局
- `IntersectionObserver`: 滚动监听
- `matchMedia`: 媒体查询

---

## 部署方案

### 本地开发部署

#### 使用 START.sh 脚本

```bash
./START.sh
```

脚本会自动:
1. 检查依赖是否安装
2. 启动 WebSocket 服务器
3. 启动前端应用
4. 打开浏览器访问

#### 手动启动

参考 [快速启动](#快速启动) 章节

### 生产环境部署

#### 方式一: 构建静态文件

```bash
# 构建生产版本
pnpm build

# 输出目录: dist/
```

使用 Nginx 或 Caddy 部署:

**Nginx 配置示例**:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # WebSocket 代理
    location /ws {
        proxy_pass http://localhost:3113;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 方式二: Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3118

CMD ["npm", "run", "preview"]
```

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3118:3118"
    depends_on:
      - postgres
      - websocket

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: yyc3_aify
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    ports:
      - "5433:5433"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  websocket:
    build: .
    command: npm run ws-server
    ports:
      - "3113:3113"

volumes:
  postgres_data:
```

#### 方式三: PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动前端
pm2 start "npm run preview" --name "yyc3-frontend"

# 启动 WebSocket 服务器
pm2 start "npm run ws-server" --name "yyc3-websocket"

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup
```

---

## 维护管理

### 日常维护

#### 1. 依赖更新

```bash
# 检查过时的依赖
pnpm outdated

# 更新依赖
pnpm update

# 更新到最新版本
pnpm update --latest
```

#### 2. 数据库维护

```sql
-- 清理旧数据 (保留 30 天)
DELETE FROM performance_metrics 
WHERE recorded_at < NOW() - INTERVAL '30 days';

-- 清理旧审计日志 (保留 90 天)
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

-- 优化表
VACUUM ANALYZE performance_metrics;
VACUUM ANALYZE audit_logs;

-- 重建索引
REINDEX TABLE performance_metrics;
REINDEX TABLE audit_logs;
```

#### 3. 日志清理

```bash
# 清理构建日志
rm -rf dist/

# 清理测试日志
rm -rf coverage/

# 清理 npm 缓存
pnpm store prune
```

### 备份管理

#### 使用备份脚本

```bash
# 完整备份
pnpm backup:all

# 仅备份数据库
pnpm backup:db

# 仅备份配置
pnpm backup:config

# 查看备份列表
pnpm backup:list
```

#### 手动备份

**数据库备份**:

```bash
# 备份数据库
pg_dump -h localhost -p 5433 -U postgres -d yyc3_aify \
  > backup_$(date +%Y%m%d).sql

# 恢复数据库
psql -h localhost -p 5433 -U postgres -d yyc3_aify \
  < backup_20260224.sql
```

**配置备份**:

```bash
# 备份环境变量
cp .env .env.backup

# 备份配置文件
tar -czf config_backup.tar.gz \
  vite.config.ts vitest.config.ts tsconfig.json
```

### 性能优化

#### 1. 前端优化

```bash
# 构建优化
pnpm build -- --mode production

# 分析包大小
pnpm build -- --report
```

#### 2. 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_performance_metrics_recorded_at 
ON performance_metrics(recorded_at DESC);

CREATE INDEX idx_audit_logs_created_at 
ON audit_logs(created_at DESC);

-- 分析查询性能
EXPLAIN ANALYZE SELECT * FROM performance_metrics 
WHERE recorded_at > NOW() - INTERVAL '1 day';
```

#### 3. WebSocket 优化

```typescript
// 批量推送
const messages = [...];
clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(messages));
  }
});
```

---

## 故障排查

### 常见问题

#### 1. 端口被占用

**问题**: 启动失败，提示端口被占用

**解决方案**:

```bash
# 查找占用端口的进程
lsof -i :3118
lsof -i :3113

# 终止进程
kill -9 <PID>

# 或者修改配置文件中的端口号
```

#### 2. WebSocket 连接失败

**问题**: 前端显示"连接失败"

**解决方案**:

```bash
# 检查 WebSocket 服务器是否运行
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:3113/ws

# 检查防火墙设置
# 确保端口 3113 已开放
```

#### 3. 数据库连接失败

**问题**: 无法连接到 PostgreSQL

**解决方案**:

```bash
# 检查 PostgreSQL 是否运行
psql -h localhost -p 5433 -U postgres -c "SELECT version();"

# 检查数据库是否存在
psql -h localhost -p 5433 -U postgres -c "\l"

# 检查用户权限
psql -h localhost -p 5433 -U postgres -c "\du"
```

#### 4. Ollama API 调用失败

**问题**: AI 助理无法响应

**解决方案**:

```bash
# 检查 Ollama 服务
curl http://localhost:11434/api/tags

# 重启 Ollama 服务
# macOS
brew services restart ollama

# Linux
systemctl restart ollama
```

#### 5. PWA 安装失败

**问题**: 无法安装为桌面应用

**解决方案**:

1. 确保使用 HTTPS 或 localhost
2. 检查 Service Worker 是否注册成功
3. 清除浏览器缓存后重试

### 日志查看

#### 前端日志

```bash
# 浏览器控制台 (F12)
# 查看网络请求和错误信息
```

#### WebSocket 服务器日志

```bash
# 查看服务器输出
pnpm exec tsx server/websocket-server.ts
```

#### 数据库日志

```bash
# PostgreSQL 日志
tail -f /usr/local/var/log/postgresql@15.log
```

---

## 最佳实践

### 开发最佳实践

1. **使用版本控制**
   - 定期提交代码
   - 编写清晰的提交信息
   - 使用分支管理功能开发

2. **编写测试**
   - 为新功能编写测试
   - 保持测试覆盖率高
   - 使用 Mock 隔离依赖

3. **代码规范**
   - 遵循项目代码风格
   - 使用 TypeScript 类型
   - 编写清晰的注释

4. **性能优化**
   - 使用 React.memo 优化渲染
   - 避免不必要的重渲染
   - 使用代码分割

### 部署最佳实践

1. **环境隔离**
   - 开发、测试、生产环境分离
   - 使用不同的数据库
   - 配置不同的环境变量

2. **安全部署**
   - 使用 HTTPS
   - 配置防火墙
   - 定期更新依赖

3. **监控告警**
   - 配置日志监控
   - 设置告警阈值
   - 定期检查系统状态

### 维护最佳实践

1. **定期备份**
   - 每日自动备份
   - 异地备份存储
   - 定期测试恢复

2. **性能监控**
   - 监控系统性能
   - 分析慢查询
   - 优化数据库索引

3. **安全审计**
   - 定期安全扫描
   - 检查依赖漏洞
   - 更新安全补丁

---

## 附录

### A. 端口映射表

| 端口 | 服务 | 协议 | 说明 |
|------|------|------|------|
| 3118 | 前端应用 | HTTP | Vite 开发服务器 |
| 3113 | WebSocket | WS | 实时数据推送 |
| 5433 | PostgreSQL | TCP | 数据库 |
| 11434 | Ollama | HTTP | AI 模型服务 |

### B. 文件大小限制

| 文件类型 | 大小限制 | 说明 |
|----------|----------|------|
| 上传文件 | 10MB | 用户头像、附件 |
| 数据库备份 | 无限制 | 根据磁盘空间 |
| 日志文件 | 100MB | 自动轮转 |

### C. 性能基准

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| **页面加载时间** | < 2s | 待测试 |
| **首屏渲染时间** | < 1s | 待测试 |
| **WebSocket 延迟** | < 100ms | < 50ms |
| **数据库查询时间** | < 500ms | 待测试 |
| **API 响应时间** | < 1s | 待测试 |

### D. 安全建议

1. **网络安全**
   - 生产环境使用 HTTPS
   - 配置防火墙规则
   - 限制数据库访问 IP

2. **数据安全**
   - 定期备份数据库
   - 加密敏感数据
   - 使用强密码

3. **应用安全**
   - 定期更新依赖
   - 启用 CORS 保护
   - 实现速率限制

### E. 参考文档

- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Ollama 文档](https://ollama.ai/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

### F. 联系支持

如有问题或建议，请联系:

- **GitHub**: https://github.com/YYC-Cube/YYC-Data-Dashboard-Design
- **文档**: [docs/](https://github.com/YYC-Cube/YYC-Data-Dashboard-Design/tree/main/docs)

---

<div align="center">

**YYC³ 数据看盘 - 完整使用指南**

*言启象限 | 语枢未来*

**万象归元于云枢 | 深栈智启新纪元*

**亦师亦友亦伯乐；一言一语一协同**

---

*文档最后更新：2026-02-24*

</div>
