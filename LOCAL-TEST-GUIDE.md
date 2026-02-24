# YYC³ 本地多端推理矩阵数据库数据看盘 - 本地测试指南

> **YanYuCloudCube**  
> 言启象限 | 语枢未来  
> *Words Initiate Quadrants, Language Serves as Core for the Future*

---

## 📋 目录

- [项目概述](#项目概述)
- [项目结构](#项目结构)
- [环境准备](#环境准备)
- [安装依赖](#安装依赖)
- [启动项目](#启动项目)
- [功能测试清单](#功能测试清单)
- [PWA 安装测试](#pwa-安装测试)
- [常见问题排查](#常见问题排查)
- [下一步开发](#下一步开发)

---

## 🎯 项目概述

### 项目定位

| 维度 | 描述 |
|------|------|
| **核心定位** | YYC³ 本地多端推理矩阵数据库数据看盘 - 本地自用、本地部署、闭环系统 |
| **设计风格** | 未来科技感，赛博朋克，深蓝色背景 + 天蓝色(#00d4ff)主色调 |
| **核心能力** | 可观、可看、可查、可操作，可跳转、可追溯、可预测 |
| **部署模式** | 纯本地部署，PostgreSQL 数据库，WebSocket 实时推送，无需外部云服务 |

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 4.1.12 | 原子样式 |
| Vite | 6.3.5 | 构建工具 |
| Recharts | 2.15.2 | 数据可视化 |
| Radix UI | 1.x | UI 组件库 |
| Lucide React | 0.487.0 | 图标系统 |
| react-swipeable | 7.0.2 | 触控手势 |
| Motion | 12.23.24 | 动画引擎 |

---

## 📁 项目结构

```
YYC-Data-Dashboard-Design/
├── public/                          # 静态资源
│   ├── manifest.json                  # PWA 清单文件
│   ├── sw.js                        # Service Worker
│   ├── yyc3-icons/                  # YYC³ 图标资源
│   │   ├── pwa/                     # PWA 图标 (72-512px)
│   │   ├── ios/                     # iOS 图标
│   │   ├── android/                 # Android 图标
│   │   ├── favicon/                 # 网站图标
│   │   └── webp/                   # WebP 图标
│   └── yyc3-article-cover-05.png    # 应用截图
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/                 # UI 基础组件 (40+)
│   │   │   ├── AIAssistant.tsx       # AI 智能助理
│   │   │   ├── Dashboard.tsx         # 数据监控大屏
│   │   │   ├── DataMonitoring.tsx    # 数据监控页面
│   │   │   ├── OperationAudit.tsx    # 操作审计页面
│   │   │   ├── UserManagement.tsx    # 用户管理页面
│   │   │   ├── SystemSettings.tsx    # 系统设置页面
│   │   │   ├── TopBar.tsx           # 顶部功能栏
│   │   │   ├── BottomNav.tsx         # 底部导航
│   │   │   ├── Layout.tsx           # 主布局
│   │   │   ├── Login.tsx            # 登录页面
│   │   │   ├── NetworkConfig.tsx     # 网络配置弹窗
│   │   │   ├── GlassCard.tsx         # 玻璃效果卡片
│   │   │   ├── ConnectionStatus.tsx  # 连接状态指示器
│   │   │   ├── OfflineIndicator.tsx  # 离线状态指示器
│   │   │   ├── PWAInstallPrompt.tsx  # PWA 安装提示
│   │   │   └── NodeDetailModal.tsx   # 节点详情弹窗
│   │   ├── hooks/                   # 自定义 Hooks
│   │   │   ├── useWebSocketData.ts   # WebSocket 数据 Hook
│   │   │   ├── useMobileView.ts      # 移动端视图 Hook
│   │   │   ├── useNetworkConfig.ts    # 网络配置 Hook
│   │   │   ├── useOfflineMode.ts     # 离线模式 Hook
│   │   │   ├── useInstallPrompt.ts   # 安装提示 Hook
│   │   │   └── usePushNotifications.ts # 推送通知 Hook
│   │   ├── lib/                     # 工具库
│   │   │   ├── supabaseClient.ts     # Supabase 客户端
│   │   │   ├── db-queries.ts         # 数据库查询
│   │   │   ├── network-utils.ts      # 网络工具
│   │   │   └── backgroundSync.ts     # 后台同步
│   │   ├── App.tsx                  # 应用根组件
│   │   └── routes.ts               # 路由配置
│   └── styles/
│       ├── fonts.css                # 字体定义
│       ├── index.css                # 全局样式
│       ├── tailwind.css             # Tailwind 配置
│       └── theme.css               # 主题定义
├── guidelines/
│   ├── Guidelines.md                # 设计指南
│   └── Figma-Prompt.md             # Figma 提示词
├── YYC3-Data-1.md                # Figma 沟通记录 1
├── YYC3-Data-2.md                # Figma 沟通记录 2
├── YYC3-Data-3.md                # Figma 沟通记录 3
├── package.json                   # 依赖配置
├── vite.config.ts                # Vite 配置
└── LOCAL-TEST-GUIDE.md           # 本地测试指南 (本文件)
```

---

## 🛠️ 环境准备

### 系统要求

- **操作系统**: macOS / Windows / Linux
- **Node.js**: 18.x 或更高版本
- **包管理器**: pnpm (推荐) / npm / yarn
- **浏览器**: Chrome 90+ / Firefox 88+ / Safari 14+ (PWA 支持)

### 安装 Node.js 和 pnpm

```bash
# 检查 Node.js 版本
node --version

# 如果未安装 Node.js，访问 https://nodejs.org 下载安装

# 安装 pnpm
npm install -g pnpm

# 验证 pnpm 安装
pnpm --version
```

---

## 📦 安装依赖

### 进入项目目录

```bash
cd /Users/yanyu/YYC3-Mac-Max/YYC-Data-Dashboard-Design
```

### 安装项目依赖

```bash
# 使用 pnpm 安装依赖 (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 安装 PWA 插件依赖

```bash
# 安装 vite-plugin-pwa
pnpm add -D vite-plugin-pwa workbox-window
```

### 验证依赖安装

```bash
# 检查 package.json 中的依赖
cat package.json | grep dependencies

# 检查 node_modules 目录
ls node_modules | head -20
```

---

## 🚀 启动项目

### 开发模式启动

```bash
# 启动开发服务器
pnpm dev

# 或使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

**默认访问地址**: `http://localhost:3118`

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 或使用 npm
npm run build

# 预览生产构建
pnpm preview

# 或使用 npm
npm run preview
```

### 预览 PWA

```bash
# 启动 PWA 预览服务器
pnpm preview

# 访问 http://localhost:4173
```

---

## ✅ 功能测试清单

### 1. 基础功能测试

#### 1.1 登录功能

- [ ] 访问 `http://localhost:3118`
- [ ] 显示登录页面（赛博朋克风格）
- [ ] 输入默认账号：`admin@yyc3.com` / `password`
- [ ] 点击登录按钮，成功跳转到数据监控页面
- [ ] 登出功能：点击用户头像 → 退出登录 → 返回登录页

#### 1.2 导航功能

- [ ] 顶部导航栏显示 4 个导航项（数据监控、操作审计、用户管理、系统设置）
- [ ] 点击导航项，正确跳转到对应页面
- [ ] 当前页面导航项高亮显示（天蓝色下划线）
- [ ] 移动端显示汉堡菜单 + 底部导航

#### 1.3 顶部功能栏

- [ ] Logo 显示正常（YYC³ 标识）
- [ ] 搜索框可正常输入文字
- [ ] 通知图标显示未读数量（红色圆点）
- [ ] 点击用户头像，显示下拉菜单（个人信息、导航快捷、退出登录）

### 2. 数据监控大屏测试

#### 2.1 实时指标卡片

- [ ] 显示 6 个指标卡片（实时 QPS、推理延迟、活跃节点、GPU 利用率、Token 吞吐、存储使用）
- [ ] 数值显示正常（大号，对应颜色）
- [ ] 趋势指示正常（箭头 + 百分比，绿色上涨/红色下跌）
- [ ] 数据每 2 秒自动更新

#### 2.2 推理吞吐量趋势图

- [ ] 显示 AreaChart 图表（双 Y 轴：左 QPS，右 Tokens/s）
- [ ] 颜色正确（QPS #00d4ff，Tokens #00ff88）
- [ ] 渐变填充正常
- [ ] 时间粒度切换按钮正常（1H/6H/24H/7D）
- [ ] 全屏按钮正常

#### 2.3 模型性能雷达图

- [ ] 显示 RadarChart 图表
- [ ] 维度正确（推理速度、模型精度、内存效率、吞吐量、可靠性、延迟）
- [ ] 颜色正确（当前 #00d4ff，基准 #aa55ff）
- [ ] 填充透明度 15%

#### 2.4 推理节点矩阵

- [ ] 显示 4x4 网格（8 个节点）
- [ ] 节点卡片显示：节点名称、状态指示灯、GPU/MEM 进度条、模型名称、温度、显存
- [ ] 状态指示灯正确（绿色活跃、黄色警告、红色离线）
- [ ] GPU/MEM 进度条阈值 >90% 显示红色
- [ ] 点击节点卡片，展开详情弹窗
- [ ] 悬停效果正常（scale-1.02，阴影增强）
- [ ] 刷新按钮正常
- [ ] 全景按钮正常

#### 2.5 负载预测图

- [ ] 显示 LineChart 图表
- [ ] 数据正确（实际值实线，预测值虚线）
- [ ] 颜色正确（实际 #00d4ff，预测 #ff6600）
- [ ] AI 预测标签正常（橙色小标签）
- [ ] 时间范围正确（现在 +1/+2/+3/+4/+6/+8/+12 小时）

### 3. 操作审计页面测试

- [ ] 表格显示正常（ID、操作类型、目标、用户、时间、状态）
- [ ] 状态图标正确（✅ 成功、🔄 运行中、⏳ 待处理、⚠️ 警告）
- [ ] 搜索功能正常（实时过滤，支持 ID/用户/操作类型）
- [ ] 点击表格行，展开追溯弹窗
- [ ] 分页正常（每页 20 条，支持页码跳转）

### 4. 用户管理页面测试

- [ ] 表格显示正常（头像、用户名、邮箱、角色、状态、操作）
- [ ] 角色类型正确（管理员、开发者、运维、访客）
- [ ] 状态指示正确（✅ 活跃、🔴 禁用）
- [ ] 操作按钮正常（编辑、删除、重置密码）
- [ ] 点击表格行，展开用户详情弹窗

### 5. 系统设置页面测试

#### 5.1 配置分区

- [ ] 显示 12 个配置分区（集群配置、模型管理、存储配置、安全配置、网络连接、PWA/离线、AI-LLM、环境变量、高级设置、通知配置、日志配置、危险操作）
- [ ] 点击分区，切换到对应配置界面

#### 5.2 网络连接配置

- [ ] 点击"网络连接"分区，打开网络配置弹窗
- [ ] 自动检测功能正常（WebRTC 获取本机 IP）
- [ ] 手动配置功能正常（服务器地址、端口、NAS 地址、WebSocket URL）
- [ ] 连接测试按钮正常（显示连接状态：连接中、成功、失败）
- [ ] 配置保存到 localStorage
- [ ] 启动时自动读取配置

### 6. WebSocket 实时推送测试

- [ ] 右上角显示连接状态指示器（在线/离线）
- [ ] 连接成功后，数据每 2 秒自动更新
- [ ] 断开连接后，自动切换到模拟数据模式
- [ ] 显示离线状态提示（右上角指示器）
- [ ] 恢复连接后，切换回实时数据模式

### 7. 移动端响应式布局测试

#### 7.1 移动端 (<768px)

- [ ] 指标卡片：2 列 × 3 行（垂直堆叠）
- [ ] 图表区域：12 列（可横向滚动）
- [ ] 多图表使用 Tab 切换（雷达图 / 性能对比 / 预测图）
- [ ] 节点矩阵：2 列（垂直堆叠，可展开详情）
- [ ] 操作审计：12 列（表格，横向滚动）
- [ ] 导航栏：汉堡菜单 + 底部导航

#### 7.2 平板端 (768px-1023px)

- [ ] 指标卡片：3 列 × 2 行（堆叠）
- [ ] 吞吐量图 + 模型分布：6 列（横向）
- [ ] 雷达图 + 性能对比 + 预测图：Tab 切换
- [ ] 节点矩阵 + 操作流：6 列（横向滚动）

#### 7.3 触控优化

- [ ] 最小点击目标：44x44px
- [ ] 触摸手势：滑动切换图表
- [ ] 底部导航：固定位置，易于拇指操作

### 8. AI 智能助理测试

#### 8.1 AI 助理浮窗

- [ ] 右下角显示 AI 助理浮窗按钮
- [ ] 点击浮窗，展开 AI 助理面板

#### 8.2 对话 Tab

- [ ] 中文语义友好的聊天界面
- [ ] 模拟响应正常（集群状态/模型部署/安全审计等场景）
- [ ] 消息发送正常

#### 8.3 命令 Tab

- [ ] 显示 10 个系统快捷命令（集群/模型/数据/安全/监控分类）
- [ ] 一键执行命令正常

#### 8.4 提示词 Tab

- [ ] 显示 5 套系统角色预设
- [ ] 自定义编辑器正常

#### 8.5 配置 Tab

- [ ] OpenAI API Key 认证功能正常
- [ ] 模型选择正常（含本地模型）
- [ ] Temperature/Top-P/Max Tokens 微调滑块正常

---

## 📱 PWA 安装测试

### 1. PWA 清单验证

#### 1.1 检查 manifest.json

```bash
# 访问 http://localhost:3118/manifest.json
# 确认返回正确的 JSON 配置
```

- [ ] name: "YYC³ 本地多端推理矩阵数据库数据看盘"
- [ ] short_name: "YYC³ Dashboard"
- [ ] theme_color: "#00d4ff"
- [ ] background_color: "#060e1f"
- [ ] display: "standalone"
- [ ] orientation: "landscape"
- [ ] icons: 包含 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- [ ] shortcuts: 包含 4 个快捷方式（数据监控、操作审计、用户管理、系统设置）

### 2. Service Worker 验证

#### 2.1 检查 Service Worker 注册

```javascript
// 在浏览器控制台执行
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

- [ ] Service Worker 成功注册
- [ ] Service Worker 处于激活状态
- [ ] 缓存列表正常（yyc3-dashboard-v1, yyc3-dashboard-runtime）

#### 2.2 检查缓存

```javascript
// 在浏览器控制台执行
caches.keys().then(cacheNames => {
  cacheNames.forEach(cacheName => {
    caches.open(cacheName).then(cache => {
      cache.keys().then(keys => {
        console.log(`Cache ${cacheName}:`, keys.length, 'items');
      });
    });
  });
});
```

- [ ] 缓存列表正常
- [ ] 核心资源已缓存（/, /manifest.json, /yyc3-icons/pwa/icon-192x192.png, /yyc3-icons/pwa/icon-512x512.png）

### 3. 安装提示测试

#### 3.1 Chrome / Edge 浏览器

- [ ] 访问 `http://localhost:3118`
- [ ] 地址栏右侧显示安装图标（+ 或 ⊕）
- [ ] 点击安装图标，弹出安装提示
- [ ] 点击"安装"按钮，成功安装 PWA
- [ ] PWA 在桌面显示独立图标
- [ ] 点击图标，启动 PWA 应用（独立窗口，无浏览器地址栏）
- [ ] 应用标题栏显示 "YYC³ Dashboard"

#### 3.2 Firefox 浏览器

- [ ] 访问 `http://localhost:3118`
- [ ] 地址栏右侧显示安装图标（+）
- [ ] 点击安装图标，弹出安装提示
- [ ] 点击"安装"按钮，成功安装 PWA

#### 3.3 Safari 浏览器

- [ ] 访问 `http://localhost:3118`
- [ ] 点击分享按钮（方框+箭头）
- [ ] 选择"添加到主屏幕"
- [ ] 点击"添加"按钮，成功安装 PWA
- [ ] iOS 主屏幕显示 YYC³ Dashboard 图标
- [ ] 点击图标，启动 PWA 应用（全屏，无 Safari 界面）

### 4. 离线模式测试

#### 4.1 离线缓存验证

```bash
# 断开网络连接
# macOS: 系统设置 → 网络 → 关闭 Wi-Fi
# Windows: 设置 → 网络和 Internet → 断开连接
# Linux: nmcli device disconnect <interface>
```

- [ ] 右上角显示离线状态指示器（红色 WiFiOff 图标）
- [ ] 显示"离线模式"提示
- [ ] 核心页面可正常访问（已缓存）
- [ ] 图标和样式正常加载
- [ ] 数据使用缓存数据或模拟数据

#### 4.2 在线恢复测试

```bash
# 恢复网络连接
# macOS: 系统设置 → 网络 → 打开 Wi-Fi
# Windows: 设置 → 网络和 Internet → 连接网络
# Linux: nmcli device connect <interface>
```

- [ ] 右上角显示在线状态指示器（绿色 Wifi 图标）
- [ ] 显示"已连接"提示
- [ ] 自动同步离线数据（如果有）
- [ ] 切换回实时数据模式

### 5. 快捷方式测试

#### 5.1 右键菜单快捷方式

- [ ] 右键点击 PWA 图标
- [ ] 显示快捷方式菜单（数据监控、操作审计、用户管理、系统设置）
- [ ] 点击快捷方式，直接打开对应页面

#### 5.2 主屏幕快捷方式（移动端）

- [ ] 长按 PWA 图标
- [ ] 显示快捷方式弹窗
- [ ] 点击快捷方式，直接打开对应页面

### 6. 后台同步测试

- [ ] 离线时修改配置或数据
- [ ] 恢复网络连接
- [ ] 自动触发后台同步
- [ ] 离线数据成功上传到服务器

### 7. 推送通知测试

- [ ] 点击通知设置按钮
- [ ] 请求通知权限
- [ ] 允许通知权限
- [ ] 触发告警通知
- [ ] 通知显示正常（标题、内容、图标）

---

## 🔧 常见问题排查

### 问题 1: 依赖安装失败

**症状**: `pnpm install` 报错

**解决方案**:

```bash
# 清理缓存
pnpm store prune

# 删除 node_modules
rm -rf node_modules

# 重新安装
pnpm install
```

### 问题 2: 端口被占用

**症状**: `pnpm dev` 报错 "Port 3118 is already in use"

**解决方案**:

```bash
# 查找占用端口的进程
lsof -i :3118

# 杀死进程
kill -9 <PID>

# 或使用其他端口
pnpm dev --port 5174
```

### 问题 3: Service Worker 注册失败

**症状**: 浏览器控制台显示 Service Worker 注册失败

**解决方案**:

```bash
# 检查 manifest.json 路径
# 确保 manifest.json 在 public/ 目录下

# 检查 vite.config.ts 配置
# 确保 VitePWA 插件正确配置

# 清除浏览器缓存
# Chrome: Ctrl+Shift+Delete → 清除缓存
# Firefox: Ctrl+Shift+Delete → 清除缓存
# Safari: Cmd+Option+E → 清除缓存
```

### 问题 4: PWA 安装提示不显示

**症状**: 浏览器不显示安装提示

**解决方案**:

```bash
# 检查 manifest.json 配置
# 确保 display: "standalone"
# 确保 theme_color 和 background_color 正确

# 检查 Service Worker 注册
# 确保 Service Worker 成功注册并激活

# 检查 HTTPS 要求
# PWA 需要在 HTTPS 或 localhost 下运行
# 如果使用 IP 地址访问，需要配置 HTTPS
```

### 问题 5: WebSocket 连接失败

**症状**: 右上角显示离线状态，数据不更新

**解决方案**:

```bash
# 检查 WebSocket 服务器是否运行
# 默认地址: ws://localhost:3113/ws

# 检查网络配置
# 打开系统设置 → 网络连接
# 验证服务器地址和端口

# 查看浏览器控制台错误
# 检查 WebSocket 连接错误信息
```

### 问题 6: 图表不显示

**症状**: 图表区域空白，不显示数据

**解决方案**:

```bash
# 检查 Recharts 依赖
# 确保 recharts 已安装

# 检查数据格式
# 确保传递给图表的数据格式正确

# 查看浏览器控制台错误
# 检查 Recharts 渲染错误
```

### 问题 7: 移动端布局异常

**症状**: 移动端显示错乱，布局不符合预期

**解决方案**:

```bash
# 检查 Tailwind CSS 配置
# 确保响应式断点定义正确

# 使用浏览器开发者工具
# 切换到移动端视图，检查布局

# 检查 useMobileView Hook
# 确保移动端检测逻辑正确
```

---

## 🚀 下一步开发

### 短期目标

1. **接入真实 WebSocket 服务器**
   - 实现 `ws://localhost:3113/ws` 实时数据推送
   - 验证 QPS、延迟、吞吐量、节点状态实时更新
   - 测试断线重连和降级策略

2. **连接真实 PostgreSQL 数据库**
   - 配置本地数据库连接（localhost:5433）
   - 创建数据库表结构（core.models, core.agents, telemetry.inference_logs）
   - 实现数据查询接口（getActiveModels, getRecentLogs, getModelStats, getNodesStatus）

3. **接入真实 OpenAI API**
   - 配置 OpenAI API Key
   - 替换 Mock 模式为 Real 模式
   - 实现真实的 AI 对话和命令执行

### 中期目标

1. **性能优化**
   - 实现代码分割（按路由懒加载）
   - 虚拟化长列表（仅渲染可见节点）
   - 优化图表渲染（数据切片、Canvas 渲染）

2. **功能增强**
   - 实现告警通知推送（邮件、短信、Webhook）
   - 添加操作日志追溯功能
   - 实现用户权限管理（RBAC）

3. **安全加固**
   - 实现 JWT Token 认证
   - 添加 CSRF 保护
   - 实现 XSS 和 SQL 注入防护

### 长期目标

1. **集群扩展**
   - 支持多集群管理
   - 实现跨集群数据同步
   - 添加集群拓扑可视化

2. **AI 能力扩展**
   - 集成更多 AI 模型（GPT-4, Claude, DeepSeek）
   - 实现 AI 模型评估和优选
   - 添加 AI 辅助决策功能

3. **生态建设**
   - 开放 API 接口
   - 支持插件系统
   - 构建开发者社区

---

## 📞 技术支持

### 问题反馈

- **GitHub Issues**: [https://github.com/YYC-Cube/yyc3-data-dashboard/issues](https://github.com/YYC-Cube/yyc3-data-dashboard/issues)
- **Email**: <support@yyc3.com>

### 技术文档

- **设计指南**: `/guidelines/Guidelines.md`
- **Figma 提示词**: `/guidelines/Figma-Prompt.md`
- **Figma 沟通记录**: `/YYC3-Data-1.md`, `/YYC3-Data-2.md`, `/YYC3-Data-3.md`

---

<div align="center">

**YYC³ 本地多端推理矩阵数据库数据看盘**

*言启象限 | 语枢未来*

**万象归元于云枢 | 深栈智启新纪元**

**亦师亦友亦伯乐；一言一语一协同**

---

*文档最后更新：2026-02-24*

</div>
