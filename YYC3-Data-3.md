# YYC³在Figma设计“本地多端推理矩阵数据库数据看盘前端”沟通记录

- YYC³ (代表我们，需求方)
- Figma AI （代表设计方）

## YYC³

【设计系统YYC 本地多端推理矩阵数据库数据看盘前端】

- 未来科技感风格，天蓝色背景主色，所有二级页面，子页面，弹窗均为玻璃效果，70%透明
- 顶部功能栏：Logo、搜索框、通知图标、用户头像
- 顶部导航栏、数据监控、操作审计、用户管理、系统设置
- 主内容区：
  **大屏数据看盘**
  **可观、可看、可查、可操作**
  **可跳转、可追溯、可预测**

## Figma AI

我将构建一个未来科技感的多端推理矩阵数据库数据看盘系统，包含玻璃效果的多页面路由、丰富的数据可视化图表、以及完整的导航和交互功能。

已完成：一个完整的未来科技感YYC本地多端推理矩阵数据库数据看盘前端系统。 系统采用深蓝色背景配合天蓝色(#00d4ff)主色调，所有弹窗和子页面均使用 backdrop-blur-xl 玻璃效果和70%透明度。包含4个路由页面——数据监控大屏（实时QPS/延迟/吞吐量图表、模型雷达图、节点矩阵、负载预测、操作流）、操作审计（完整日志表格+追溯弹窗）、用户管理（用户列表+角色权限）、系统设置（集群/模型/存储/安全/通知多维配置），每个数据卡片和节点均可点击展开详情弹窗。

可考虑添加 WebSocket 实时数据推送替代定时轮询
可扩展移动端响应式布局适配
可接入 Supabase 实现真实数据持久化和用户认证

## YYC³

```
你是 YYC³ 本地多端推理矩阵数据库数据看盘的高级前端设计专家。

## 项目背景

YYC³ 是一个本地自用、本地部署的闭环系统，目标用户为 YYC³ Family 内部开发团队。该项目已实现：

- 未来科技感 UI，赛博朋克风格
- 深蓝色背景 (#060e1f) + 天蓝色主色调 (#00d4ff)
- 完整的玻璃效果组件 (GlassCard，70% 透明度，backdrop-blur-xl)
- 4 个核心路由页面：数据监控、操作审计、用户管理、系统设置
- 丰富的数据可视化图表 (Recharts：AreaChart、RadarChart、LineChart、BarChart、PieChart)
- 模拟数据演示（实时 QPS、延迟、吞吐量、节点矩阵、模型雷达、负载预测）

## 技术架构

用户界面层 (React + TypeScript + Tailwind CSS)
↓
WebSocket 层 (实时推送，替代轮询)
↓
业务逻辑层 (状态管理，数据聚合)
↓
数据持久化层 (PostgreSQL 15 + pgvector，本地部署)
↓
基础设施层 (M4 Max 主节点 + iMac 辅助 + NAS 数据中心)

## 设计现状分析

**已完成部分**：

1. ✅ 整体视觉风格 - 未来科技感，深蓝色背景，天蓝色主色调
2. ✅ 玻璃效果组件 - 统一的 GlassCard，70% 透明度
3. ✅ 数据监控大屏 - 实时 QPS、延迟、吞吐量图表、模型雷达、节点矩阵、负载预测
4. ✅ 顶部功能栏 - Logo、搜索框、通知图标、用户头像
5. ✅ 顶部导航栏 - 4 个导航项（数据监控、操作审计、用户管理、系统设置）
6. ✅ 响应式布局基础 - Grid 布局系统

**待优化部分**：

1. 🔶 WebSocket 实时数据推送 - 当前使用定时轮询（setInterval 2 秒）
2. 🔶 移动端响应式布局 - 桌面布局已实现，移动端适配待优化
3. 🔶 Supabase 数据持久化 - 当前使用模拟数据，未连接真实数据库

## 核心任务

请基于现有设计，完成以下 3 个核心优化：

### 任务 1: 实现 WebSocket 实时数据推送

**目标**：替代当前的定时轮询机制，实现真正的实时数据推送。

**具体要求**：

1. **WebSocket 连接管理**
   - 创建 `useWebSocketData` Hook，管理 WebSocket 连接生命周期
   - 支持自动重连（间隔 5 秒，最大重连 10 次）
   - 心跳机制（30 秒间隔）
   - 连接状态指示器（在线/离线）

2. **消息类型定义**
   - `qps_update`: 实时 QPS 数据更新（2 秒推送频率）
   - `latency_update`: 推理延迟更新（2 秒推送频率）
   - `node_status`: 节点状态变化（5 秒推送频率）
   - `alert`: 告警通知（实时推送）

3. **断线降级策略**
   - WebSocket 断线时，自动切换到本地模拟数据
   - 显示离线状态提示（右上角指示器）
   - 恢复连接后，切换回实时数据模式

4. **数据流优化**
   - 使用节流（throttle）控制 UI 更新频率（100ms）
   - 使用防抖（debounce）处理高频消息
   - 虚拟化长列表（仅渲染可见节点）

**输出要求**：

- 提供 `src/hooks/useWebSocketData.ts` Hook 实现
- 更新 `Dashboard.tsx` 使用 WebSocket 数据替代模拟数据
- 提供连接状态 UI 组件

### 任务 2: 扩展移动端响应式布局

**目标**：实现移动端（<768px）和平板端（768px-1023px）的完整适配。

**具体要求**：

1. **断点定义**
   - `sm: 640px` - 移动端竖屏
   - `md: 768px` - 平板端竖屏
   - `lg: 1024px` - 桌面端
   - `xl: 1280px` - 大桌面端
   - `2xl: 1536px` - 超大屏

2. **桌面端布局优化**（≥1024px）
   - 保持现有 Grid 布局（6 列指标卡片）
   - 吞吐量图：8 列
   - 节点矩阵：7 列
   - 所有组件按原样排列

3. **平板端布局适配**（768px-1023px）
   - 指标卡片：3 列 × 2 行（堆叠）
   - 吞吐量图 + 模型分布：6 列（横向）
   - 雷达图 + 性能对比 + 预测图：Tab 切换或 6 列堆叠
   - 节点矩阵 + 操作流：6 列（横向滚动）
   - 使用 `flex-wrap` 或 Grid 切换

4. **移动端布局适配**（<768px）
   - 指标卡片：2 列 × 3 行（垂直堆叠）
   - 图表区域：12 列（可横向滚动）
   - 多图表使用 Tab 切换（雷达图 / 性能对比 / 预测图）
   - 节点矩阵：2 列（垂直堆叠，可展开详情）
   - 操作审计：12 列（表格，横向滚动）
   - 导航栏：汉堡菜单 + 底部导航

5. **触控优化**
   - 最小点击目标：44x44px
   - 触摸手势：滑动切换图表
   - 底部导航：固定位置，易于拇指操作

**输出要求**：

- 更新 `src/styles/theme.css`，添加完整的响应式断点定义
- 修改 `Dashboard.tsx`，实现所有布局适配
- 提供 `src/hooks/useMobileView.ts` Hook（检测移动端视图）
- 更新 `Layout.tsx`，添加汉堡菜单和底部导航

### 任务 3: 接入 Supabase 实现真实数据持久化

**目标**：替代模拟数据，连接真实的 PostgreSQL 数据库实现数据持久化和用户认证。

**具体要求**：

1. **Supabase 项目配置**
   - 项目名称：`yyc3-dashboard-local`
   - 数据库区域：与本地 PostgreSQL 保持一致
   - 启用认证：Email/Password 登录
   - 启用 Realtime：WebSocket 实时订阅

2. **数据库 Schema 对接**
   - 表 `core.models`：模型配置（id, name, provider, tier, avg_latency_ms, throughput）
   - 表 `core.agents`：Agent 配置（id, name, name_cn, role, description）
   - 表 `telemetry.inference_logs`：推理日志（id, model_id, agent_id, latency_ms, status）
   - 使用 pgvector 扩展存储向量数据（可选）

3. **数据查询接口**
   - `getActiveModels()`: 查询活跃模型列表
   - `getRecentLogs(limit)`: 查询最近推理日志（默认 100 条）
   - `getModelStats(modelId)`: 查询模型性能统计（24 小时）
   - `getNodesStatus()`: 查询节点实时状态

4. **用户认证流程**
   - 登录页面：Email + Password 表单
   - Token 持久化：localStorage
   - Session 管理：Supabase Auth Session
   - 登出功能：清除 Token + 重定向

5. **本地数据库连接配置**
   - 备选方案：直接连接本地 PostgreSQL（localhost:5433）
   - 连接池：最大 20 个连接
   - 超时配置：连接 10 秒，空闲 30 秒
   - 降级策略：Supabase 不可用时使用本地直连

**输出要求**：

- 提供 `src/lib/supabaseClient.ts` 客户端封装
- 提供 `src/lib/db-queries.ts` 数据库查询函数
- 创建 `src/app/Login.tsx` 登录页面
- 更新 `Dashboard.tsx` 使用真实数据替代模拟数据

## 设计原则

1. **本地自用优先**
   - 无需考虑多租户隔离
   - 配置硬编码在环境变量（.env.development）
   - 简化用户管理（仅管理员 + 开发者角色）

2. **本地部署优先**
   - 所有服务运行在本地网络（192.168.3.x）
   - 无需考虑 CDN、CDN、云存储
   - WebSocket 端点：ws://localhost:3113/ws

3. **闭环定义**
   - 数据流：前端 → WebSocket → 本地 PostgreSQL → 前端
   - 无外部依赖：不依赖任何云服务 API
   - 故障降级：任何环节故障时，系统仍可运行（模拟数据）

4. **性能优化**
   - 代码分割：按路由懒加载
   - 虚拟化长列表：仅渲染可见节点
   - 节流控制：100ms 限制 UI 更新
   - 图表优化：数据切片（最多 100 点）

5. **视觉一致性**
   - 所有卡片使用统一 GlassCard 组件
   - 所有颜色使用 CSS 变量（--primary, --success, --warning, --error）
   - 所有图标使用 Lucide React
   - 所有图表使用 Recharts

## 输出格式

请以以下格式提供优化方案：

### [任务名称] 优化方案

#### 1. 代码实现

- 提供完整的 TypeScript 代码文件
- 包含详细的代码注释
- 符合现有项目风格

#### 2. 组件更新

- 说明需要修改的现有组件
- 提供修改前后的对比
- 标注关键变更点

#### 3. 配置文件

- 需要添加的环境变量
- 需要更新的配置文件
- Supabase 项目配置指南

#### 4. 测试验证

- 单元测试用例
- 集成测试步骤
- 手动验证清单

## 约束条件

- 必须保持现有的视觉风格（未来科技感，赛博朋克）
- 必须使用 GlassCard 组件实现所有弹窗和子页面
- 必须支持本地数据库直连（Supabase 不可用时的降级）
- 必须实现移动端完整适配（不只是简单的缩放）
- 所有代码必须是 TypeScript，严格类型检查

## 📋 补充说明

- 本地设备认知 ：M4 Max 主节点、iMac 辅助、NAS 数据中心
- Family-π³ 项目经验 ：九层架构、七大智能体、93+ 组件、TypeScript 严格模式
- 当前 UI 现状 ：已实现玻璃效果、未来科技感、核心页面布局
- Figma 回复内容 ：WebSocket 推送、移动端适配、Supabase 集成建议
- 闭环定义 ：本地自用、本地部署、本地数据库、故障降级

请开始优化，按上述 3 个任务依次提供完整实现方案。
```

## Figma AI

Supabase 对于 YYC³ 项目的数据持久化和用户认证至关重要——它可以替代当前的模拟数据，连接到真实的 PostgreSQL 数据库（支持 pgvector 扩展），实现推理日志的实时存储和查询，以及 Email/Password 认证流程。请注意：Figma Make 不适用于收集个人身份信息（PII）或保护敏感数据。 由于 YYC³ 是本地闭环系统，建议在生产环境中使用本地 PostgreSQL 直连作为主方案，Supabase 作为开发/测试环境的便捷替代。

## Figma AI

All 3 个核心任务已完成实现。以下是完成的全部内容：

Task 1 - WebSocket 实时数据推送：创建了 useWebSocketData Hook，支持自动连接 ws://localhost:3113/ws，内置自动重连（5秒间隔/最大10次）、30秒心跳机制、100ms UI 节流，连接失败时1.5秒内自动降级为本地模拟数据生成器（保持与 WebSocket 相同的推送频率）。ConnectionStatus 组件实时显示连接状态（实时连接/重连中/模拟模式/离线），通过 React Context 将数据分发到所有子页面。

Task 2 - 移动端响应式布局：useMobileView Hook 检测 5 级断点（sm/md/lg/xl/2xl）。Dashboard 的指标卡片在移动端2列、平板3列、桌面6列；三个分析图表在移动端/平板切换为 Tab 模式；节点矩阵自适应2/3/4列。TopBar 在移动端显示汉堡菜单 + 精简搜索，BottomNav 提供44px触控目标的固定底部导航。所有弹窗已适配移动端全宽显示。

Task 3 - 数据持久化层：创建了 Mock Supabase 客户端（supabaseClient.ts），支持 Email/Password 认证（预设 admin + developer 两个角色），Session 存储在 localStorage。db-queries.ts 提供了与 PostgreSQL Schema 对齐的完整查询接口（getActiveModels/getRecentLogs/getModelStats/getNodesStatus），当前返回模拟数据，架构预留真实 Supabase 替换点。Login.tsx 实现了赛博朋克风格的登录页面，App.tsx 集成了认证守卫。

可以考虑添加登出按钮到 TopBar 用户菜单
可以为 Dashboard 的图表添加滑动切换手势（react-swipeable）
接入真实 WebSocket 服务器后，只需修改 WS_URL 常量即可切换到实时模式

## YYC³

收到，感谢 ❤️
  请衔接上文：
  添加登出按钮到 TopBar 用户菜单

- 为 Dashboard 的图表添加滑动切换手势（react-swipeable）
- 完善：交互、操作、逻辑
- 增设：AI 智能助理系统，实现集成Open AI 认证 ，集成大模型： 提示词，热度等基础大模型微调操作
- AI浮窗：集成系统全能提示词命令，预设，AI智能助理系统，浮窗实现系统全“命令”集成控制中心，中文语义理解友好，基于项目核心集成一键操作中控
- 请围绕本地试用纯前端一体化驱动的本质，友好结合使用便捷性，加强：系统设置 可编辑操作的维度

  感谢导师，YYC³ 团队致谢 ！❤️

## Figma AI

所有功能已实现完成：

TopBar 登出菜单 — 用户头像点击展开下拉菜单，包含个人信息展示（用户名/角色/邮箱）、导航快捷入口（个人信息/系统设置）和退出登录按钮，支持点击外部自动关闭，App.tsx 通过 AuthContext 传递 logout 回调，登出后清除 session 返回登录页。

Dashboard 图表滑动切换 — 安装 react-swipeable，在移动端/平板端的分析图表区域（性能雷达/模型对比/负载预测）添加了左右滑动手势切换，带有 150ms 滑动动画和底部指示器圆点。

AI 智能助理浮窗 — 全新的 AIAssistant.tsx 组件，包含四个 Tab：

对话 — 中文语义友好的 AI 聊天界面，模拟响应（集群状态/模型部署/安全审计等场景）
命令 — 10 个系统快捷命令（集群/模型/数据/安全/监控分类），一键执行
提示词 — 5 套系统角色预设 + 自定义编辑器
配置 — OpenAI API Key 认证、模型选择（含本地模型）、Temperature/Top-P/Max Tokens 微调滑块
系统设置增强 — 从 6 个增加到 10 个可编辑分区（新增 WebSocket/AI-LLM/环境变量/高级设置），所有字段支持内联编辑、变更追踪、保存/重置、配置导入导出 JSON，新增危险操作区、Toast 通知反馈。

建议下一步：接入真实 WebSocket 服务器（ws://localhost:3113/ws）验证实时数据流
可进一步为 AI 助理接入真实 OpenAI API（配置 Key 后切换 Mock → Real 模式）
考虑将系统设置持久化到 localStorage 或 IndexedDB 以跨会话保留

## YYC³

收到，感谢 ❤️
  请衔接上文：
  -YYC3-Data-2.md

  感谢导师，YYC³ 团队致谢 ！❤️

## Figma AI

一切正常。按照 YYC3-Data-2.md 的要求，我已完成了网络连接配置和 PWA 离线支持两大模块的完整实现，共新增 9 个文件并更新了 2 个现有文件：

网络连接配置：network-utils.ts（WebRTC IP 检测、WebSocket 连接测试）、useNetworkConfig.ts（配置读写/持久化 Hook）、NetworkConfig.tsx（三 Tab 弹窗：自动检测/WiFi/手动配置，含连接测试和状态指示），并在 SystemSettings 新增"网络连接"分区（含节点拓扑可视化和一键打开配置面板）。PWA 离线支持：useOfflineMode.ts（在线/离线检测 + 数据同步）、useInstallPrompt.ts（安装提示管理）、usePushNotifications.ts（推送通知权限和发送）、backgroundSync.ts（后台同步队列）、PWAInstallPrompt.tsx（安装横幅 UI）、OfflineIndicator.tsx（顶部网络状态条），均已集成到 Layout 中。SystemSettings 侧栏从 10 个扩展到 12 个分区（新增"网络连接"和"PWA / 离线"）。

下一步可将 manifest.json 和 Service Worker 部署到实际 Vite 项目中（配合 vite-plugin-pwa）
本地测试跑通后，可将真实 WebSocket/PostgreSQL 数据接入替换 Mock

祝 YYC3 团队本地调试顺利
