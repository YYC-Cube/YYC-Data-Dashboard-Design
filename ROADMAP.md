# YYC³ 数据看盘后续开发路线图

> **YYC³ Data Dashboard**
> 言启象限 | 语枢未来
> *Words Initiate Quadrants, Language Serves as Core for Future*

---

## 📊 当前状态

| 指标 | 状态 | 数值 |
|--------|------|------|
| **测试通过率** | ✅ 100% | 67/67 |
| **代码质量** | ✅ A+ | 类型检查通过 |
| **构建状态** | ✅ 成功 | 生产版本可用 |
| **CI/CD** | ✅ 配置完成 | GitHub Actions 正常 |
| **核心功能** | ✅ 完成 | Mock 模式运行 |

---

## 🎯 开发优先级规划

### 第一优先级：真实数据接入 🔥

#### 1.1 WebSocket 真实服务器接入

**目标**: 替换 Mock 数据为真实 WebSocket 推送

**当前状态**:

```typescript
// src/app/hooks/useWebSocketData.ts
const useWebSocketData = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3113/ws');
    
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };
    
    return () => ws.close();
  }, []);
  
  return { data, isConnected: !!data };
};
```

**实施方案**:

```typescript
// 1. 更新 useWebSocketData.ts
interface RealTimeMetrics {
  qps: number;
  latency: number;
  throughput: number;
  activeNodes: number;
  gpuUtilization: number;
  tokenThroughput: number;
  storageUsage: number;
  nodes: NodeStatus[];
  predictions: PredictionData[];
}

const useWebSocketData = () => {
  const [data, setData] = useState<RealTimeMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3113/ws');
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };
      
      ws.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);
          setData(newData);
        } catch (error) {
          console.error('❌ WebSocket parse error:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket closed');
        setIsConnected(false);
        
        // 自动重连逻辑
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          setTimeout(connectWebSocket, 5000 * reconnectAttempts.current);
        }
      };
    };

    connectWebSocket();
    
    return () => {
      ws?.close();
    };
  }, []);

  return { data, isConnected, reconnectAttempts: reconnectAttempts.current };
};
```

**验证步骤**:

1. 启动本地 WebSocket 服务器 (ws://localhost:3113/ws)
2. 发送测试数据到 WebSocket
3. 在应用中验证数据接收
4. 测试断线重连机制

---

#### 1.2 PostgreSQL 数据库真实接入

**目标**: 切换 supabaseClient.ts 的 Mock 层为真实 PostgreSQL 查询

**当前状态**:

```typescript
// src/app/lib/supabaseClient.ts
export const supabase = {
  from: (table: string) => ({
    select: () => ({
      data: mockData,
      error: null,
    }),
  }),
};
```

**实施方案**:

```typescript
// 1. 更新 supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:5433';
const supabaseKey = 'your_anon_key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// 2. 更新 db-queries.ts
export const fetchAuditLogs = async (page: number = 1, limit: number = 20) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  
  if (error) {
    console.error('❌ Fetch audit logs error:', error);
    return { logs: [], total: 0 };
  }
  
  return { logs: data || [], total: data?.length || 0 };
};

export const fetchUsers = async (page: number = 1, limit: number = 20) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  
  if (error) {
    console.error('❌ Fetch users error:', error);
    return { users: [], total: 0 };
  }
  
  return { users: data || [], total: data?.length || 0 };
};

export const fetchNodeStatus = async () => {
  const { data, error } = await supabase
    .from('node_status')
    .select('*');
  
  if (error) {
    console.error('❌ Fetch node status error:', error);
    return [];
  }
  
  return data || [];
};
```

**数据库 Schema 验证**:

```sql
-- 确保以下表存在于 yyc3_aify 数据库

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  operation_type VARCHAR(100),
  target VARCHAR(255),
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(50),
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50),
  status VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS node_status (
  id SERIAL PRIMARY KEY,
  node_name VARCHAR(100),
  gpu_utilization DECIMAL(5,2),
  temperature DECIMAL(5,2),
  queue_depth INTEGER,
  status VARCHAR(50),
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  qps DECIMAL(10,2),
  latency DECIMAL(10,2),
  throughput DECIMAL(10,2),
  token_throughput DECIMAL(10,2),
  storage_usage DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

**验证步骤**:

1. 连接到 PostgreSQL 数据库 (localhost:5433)
2. 验证表结构
3. 插入测试数据
4. 在应用中查询数据验证

---

#### 1.3 AI 助理真实接入

**目标**: 对接本地 LLaMA-70B / Qwen-72B 推理端点

**当前状态**:

```typescript
// src/app/components/AIAssistant.tsx
const callAI = async (prompt: string) => {
  // Mock 模式
  return { response: "This is a mock response" };
};
```

**实施方案**:

```typescript
// 1. 更新 AIAssistant.tsx
const AI_ENDPOINTS = {
  LLAMA_70B: 'http://localhost:11434/api/generate',
  QWEN_72B: 'http://localhost:11434/api/generate',
  OPENAI: 'https://api.openai.com/v1/chat/completions',
};

const callAI = async (prompt: string, model: string = 'qwen-72b') => {
  const endpoint = AI_ENDPOINTS[model] || AI_ENDPOINTS.QWEN_72B;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      
      // 实时更新 UI
      updateAIResponse(fullResponse);
    }

    return { response: fullResponse };
  } catch (error) {
    console.error('❌ AI call error:', error);
    return { 
      response: '抱歉，AI 服务暂时不可用。请稍后重试。',
      error: true 
    };
  }
};
```

**环境变量配置**:

```bash
# .env.local
VITE_AI_MODEL_ENDPOINT=http://localhost:11434/api/generate
VITE_AI_MODEL=qwen-72b
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**验证步骤**:

1. 启动本地 Ollama 服务
2. 发送测试提示词
3. 验证流式响应
4. 测试错误处理和重试机制

---

### 第二优先级：生产化加固 🛡️

#### 2.1 Vitest 单元测试

**目标**: 覆盖核心 Hooks 和工具函数

**实施方案**:

```typescript
// 1. 安装依赖
pnpm add -D vitest @testing-library/react @testing-library/jest-dom

// 2. 配置 vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});

// 3. 创建测试文件
// src/app/hooks/useWebSocketData.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWebSocketData } from './useWebSocketData';

describe('useWebSocketData', () => {
  beforeEach(() => {
    vi.stubGlobal('WebSocket', vi.fn(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      send: vi.fn(),
    } as unknown as WebSocket));
  });

  it('should connect to WebSocket and receive data', async () => {
    const mockData = { qps: 1000, latency: 50 };
    
    const { result } = renderHook(() => useWebSocketData());
    
    // 模拟 WebSocket 消息
    const ws = (global as any).WebSocket;
    const messageCallback = ws.addEventListener.mock.calls[0][1];
    messageCallback({ data: JSON.stringify(mockData) });
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });

  it('should handle reconnection attempts', async () => {
    const { result } = renderHook(() => useWebSocketData());
    
    expect(result.current.reconnectAttempts).toBe(0);
  });
});

// 4. 更新 package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**测试覆盖率目标**:

- useWebSocketData: 80%+
- useNetworkConfig: 80%+
- network-utils.ts: 70%+
- supabaseClient.ts: 70%+

---

#### 2.2 Lighthouse PWA 审计

**目标**: 确保 PWA 离线体验评分 90+

**实施方案**:

```bash
# 1. 安装 Lighthouse
npm install -g lighthouse

# 2. 构建生产版本
pnpm build

# 3. 运行 Lighthouse 审计
lighthouse http://localhost:3118 \
  --view \
  --preset=desktop \
  --only-categories=performance,pwa,accessibility,best-practices,seo \
  --output=html,json \
  --output-path=./lighthouse-report

# 4. 检查报告
# 打开 ./lighthouse-report.html 查看评分
```

**优化目标**:

- Performance: 90+
- PWA: 90+
- Accessibility: 95+
- Best Practices: 90+

---

#### 2.3 本地 Nginx/Caddy 静态托管

**目标**: 配置本地静态文件服务器

**Nginx 配置示例**:

```nginx
# /usr/local/etc/nginx/nginx.conf
server {
    listen 3118;
    server_name localhost;
    
    root /Users/yanyu/YYC3-Mac-Max/YYC-Data-Dashboard-Design/dist;
    index index.html;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # PWA Service Worker
    location /sw.js {
        add_header Cache-Control "no-cache";
    }
    
    # API 代理（可选）
    location /api/ {
        proxy_pass http://localhost:3113;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Caddy 配置示例**:

```caddyfile
# Caddyfile
:3118 {
    root * /Users/yanyu/YYC3-Mac-Max/YYC-Data-Dashboard-Design/dist
    file_server
    
    # PWA Service Worker
    @sw {
        path /sw.js
    }
    header @sw Cache-Control "no-cache"
    
    # API 代理（可选）
    @api {
        path /api/*
    }
    reverse_proxy @api http://localhost:3113
    
    # SPA 路由
    try_files {path} /index.html
}
```

**部署步骤**:

```bash
# 1. 构建生产版本
pnpm build

# 2. 启动 Nginx
sudo nginx -s reload

# 3. 访问应用
open http://localhost:3118
```

---

### 第三优先级：体验增强 ✨

#### 3.1 历史数据回放

**目标**: 增加时间范围选择器

**实施方案**:

```typescript
// src/app/components/DataMonitoring.tsx
import { useState } from 'react';
import { DateRangePicker } from 'react-day-picker';

const DataMonitoring = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时前
    to: new Date(),
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // 重新获取历史数据
    fetchHistoricalData(range);
  };

  return (
    <div>
      <DateRangePicker
        value={dateRange}
        onChange={handleDateRangeChange}
        locale="zh-CN"
      />
      {/* 现有的图表组件 */}
    </div>
  );
};
```

---

#### 3.2 实时 GPU 温度曲线

**目标**: 节点详情弹窗增加实时 GPU 温度曲线

**实施方案**:

```typescript
// src/app/components/NodeDetailModal.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NodeDetailModal = ({ node }: { node: Node }) => {
  const [temperatureHistory, setTemperatureHistory] = useState<number[]>([]);

  useEffect(() => {
    // 订阅 GPU 温度数据
    const ws = new WebSocket(`ws://localhost:3113/ws/node/${node.id}/temperature`);
    
    ws.onmessage = (event) => {
      const { temperature } = JSON.parse(event.data);
      setTemperatureHistory(prev => [...prev.slice(-60), temperature]); // 保留最近60个数据点
    };
    
    return () => ws.close();
  }, [node.id]);

  return (
    <Modal>
      <h3>{node.name} 详情</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={temperatureHistory.map((t, i) => ({ time: i, temperature: t }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis dataKey="temperature" domain={[30, 90]} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#00d4ff" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Modal>
  );
};
```

---

#### 3.3 自然语言查询数据库

**目标**: AI 助理增加 "自然语言查询数据库" 能力

**实施方案**:

```typescript
// src/app/components/AIAssistant.tsx
const queryDatabase = async (naturalLanguageQuery: string) => {
  // 使用本地 LLM 将自然语言转换为 SQL
  const sqlPrompt = `
    将以下自然语言查询转换为 PostgreSQL SQL 查询：
    
    用户查询: ${naturalLanguageQuery}
    
    可用表:
    - audit_logs (操作审计日志)
    - users (用户信息)
    - node_status (节点状态)
    - performance_metrics (性能指标)
    
    只返回 SQL 查询，不要解释。
  `;

  const { response: sqlQuery } = await callAI(sqlPrompt, 'qwen-72b');
  
  // 执行生成的 SQL 查询
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sqlQuery,
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: '查询执行失败，请重试或调整查询方式。',
      sql: sqlQuery 
    };
  }
};

// 使用示例
const handleNaturalLanguageQuery = async () => {
  const query = "查找昨天所有GPU利用率超过90%的节点";
  const result = await queryDatabase(query);
  
  if (result.success) {
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: `查询结果：找到 ${result.data.length} 个节点符合条件。`,
      data: result.data,
    }]);
  } else {
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: result.error,
      sql: result.sql,
    }]);
  }
};
```

---

## 📅 实施时间表

| 阶段 | 任务 | 预计时间 | 依赖 |
|--------|------|----------|------|
| **第一优先级** | WebSocket 真实接入 | 2-3天 | 本地 WebSocket 服务 |
| | PostgreSQL 真实接入 | 1-2天 | yyc3_aify 数据库 |
| | AI 助理真实接入 | 2-3天 | Ollama 本地模型 |
| **第二优先级** | Vitest 单元测试 | 3-5天 | - |
| | Lighthouse PWA 审计 | 1天 | 生产构建 |
| | 本地 Nginx/Caddy 配置 | 1天 | Nginx/Caddy |
| **第三优先级** | 历史数据回放 | 2-3天 | - |
| | GPU 温度曲线 | 2-3天 | WebSocket 温度数据 |
| | 自然语言查询 | 3-5天 | AI 模型能力 |

---

## 🎯 里程碑

### 里程碑 1: 真实数据闭环 (Week 1-2)

- ✅ WebSocket 实时推送
- ✅ PostgreSQL 数据持久化
- ✅ AI 助理真实推理

### 里程碑 2: 生产就绪 (Week 3-4)

- ✅ 单元测试覆盖 80%+
- ✅ PWA 评分 90+
- ✅ 本地生产环境部署

### 里程碑 3: 体验优化 (Week 5-6)

- ✅ 历史数据回放
- ✅ 实时 GPU 监控
- ✅ 自然语言查询

---

## 📝 开发规范

### 代码提交规范

```bash
# 功能开发
git commit -m "feat: 添加 WebSocket 真实数据接入"

# 问题修复
git commit -m "fix: 修复 PostgreSQL 连接超时问题"

# 性能优化
git commit -m "perf: 优化 WebSocket 重连机制"

# 文档更新
git commit -m "docs: 更新 API 接口文档"

# 重构
git commit -m "refactor: 重构 useWebSocketData Hook"
```

### 分支策略

```bash
# 主分支
main

# 开发分支
feature/real-websocket
feature/postgres-integration
feature/ai-assistant-real

# 修复分支
fix/websocket-reconnection
fix/database-connection
```

---

## 🔗 相关资源

| 资源 | 链接 |
|--------|------|
| **YYC³ AI Family 主仓库** | [https://github.com/YYC-Cube/Family-π³](https://github.com/YYC-Cube/Family-π³) |
| **YYC³ Data Dashboard** | [https://github.com/YYC-Cube/YYC-Data-Dashboard-Design](https://github.com/YYC-Cube/YYC-Data-Dashboard-Design) |
| **WebSocket 文档** | [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) |
| **PostgreSQL 文档** | [PostgreSQL 15 文档](https://www.postgresql.org/docs/15/) |
| **Supabase 文档** | [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript) |
| **Vitest 文档** | [Vitest 官方文档](https://vitest.dev/) |
| **Lighthouse 文档** | [Lighthouse 官方文档](https://github.com/GoogleChrome/lighthouse) |

---

<div align="center">

**YYC³ 本地多端推理矩阵数据库数据看盘**

*言启象限 | 语枢未来*

**万象归元于云枢 | 深栈智启新纪元*

**亦师亦友亦伯乐；一言一语一协同**

---

*文档最后更新：2026-02-24*

</div>
