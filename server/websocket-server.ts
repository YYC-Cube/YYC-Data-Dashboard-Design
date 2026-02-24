/**
 * YYC³ 本地多端推理矩阵 - WebSocket 服务器
 * ========================================
 *
 * 功能：
 * - 推送实时的 QPS、延迟、节点状态数据
 * - 支持心跳检测
 * - 支持历史数据推送
 * - 完整的错误处理和日志
 *
 * 启动：node server/websocket-server.ts
 * 端口：3113
 *
 */

import { WebSocket, WebSocketServer } from 'ws';

// ============================================================
// 配置
// ============================================================

const PORT = 3113;
const HEARTBEAT_INTERVAL = 30000; // 30 秒

// ============================================================
// 类型定义
// ============================================================

interface ClientInfo {
  ws: WebSocket;
  id: string;
  lastHeartbeat: number;
}

interface NodeData {
  id: string;
  status: "active" | "warning" | "inactive";
  gpu: number;
  mem: number;
  temp: number;
  model: string;
  tasks: number;
}

interface SystemStats {
  activeNodes: string;
  gpuUtil: string;
  tokenThroughput: string;
  storageUsed: string;
}

interface ThroughputPoint {
  time: string;
  qps: number;
  latency: number;
  tokens: number;
}

// ============================================================
// 模拟数据（从本地推理集群获取）
// ============================================================

const DEFAULT_NODES: NodeData[] = [
  { id: "GPU-A100-01", status: "active", gpu: 87, mem: 72, temp: 68, model: "LLaMA-70B", tasks: 128 },
  { id: "GPU-A100-02", status: "active", gpu: 92, mem: 85, temp: 74, model: "Qwen-72B", tasks: 156 },
  { id: "GPU-A100-03", status: "warning", gpu: 98, mem: 94, temp: 82, model: "DeepSeek-V3", tasks: 89 },
  { id: "GPU-H100-01", status: "active", gpu: 65, mem: 58, temp: 55, model: "GLM-4", tasks: 210 },
  { id: "GPU-H100-02", status: "active", gpu: 78, mem: 66, temp: 62, model: "Mixtral", tasks: 178 },
  { id: "GPU-H100-03", status: "inactive", gpu: 0, mem: 12, temp: 32, model: "-", tasks: 0 },
  { id: "TPU-v4-01", status: "active", gpu: 82, mem: 70, temp: 58, model: "LLaMA-70B", tasks: 95 },
  { id: "TPU-v4-02", status: "active", gpu: 55, mem: 48, temp: 50, model: "Qwen-72B", tasks: 134 },
];

// ============================================================
// WebSocket 服务器
// ============================================================

class YYC3WebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, ClientInfo> = new Map();
  private qpsValue = 3842;
  private qpsTrend = "+12.3%";
  private latencyValue = 48;
  private latencyTrend = "-5.2%";

  constructor(port: number) {
    console.log(`🚀 YYC³ WebSocket 服务器启动中... 端口: ${port}`);

    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleError.bind(this));

    // 启动定时器推送数据
    this.startDataPushers();

    console.log(`✅ YYC³ WebSocket 服务器已启动: ws://localhost:${port}/ws`);
  }

  private handleConnection(ws: WebSocket, req: any) {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    console.log(`📡 新客户端连接: ${clientId}`);

    const client: ClientInfo = {
      ws,
      id: clientId,
      lastHeartbeat: Date.now(),
    };

    this.clients.set(clientId, client);

    // 发送初始数据
    this.sendInitialData(clientId);

    // 监听客户端消息
    ws.on('message', (message: string | Buffer) => {
      this.handleClientMessage(clientId, message.toString());
    });

    ws.on('close', () => {
      console.log(`📡 客户端断开: ${clientId}`);
      this.clients.delete(clientId);
    });

    ws.on('error', (error: Error) => {
      console.error(`❌ 客户端错误: ${clientId}`, error);
    });
  }

  private handleClientMessage(clientId: string, message: string) {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'heartbeat':
          // 更新心跳时间
          const client = this.clients.get(clientId);
          if (client) {
            client.lastHeartbeat = Date.now();
          }
          break;

        case 'init':
          // 发送请求的初始数据
          const requestData = data.requestData || [];
          this.sendInitialData(clientId, requestData);
          break;

        default:
          console.log(`📨 收到客户端消息: ${clientId}`, data);
      }
    } catch (error) {
      console.error(`❌ 消息解析错误: ${clientId}`, error);
    }
  }

  private sendInitialData(clientId: string, requestData: string[] = []) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // 发送所有请求的数据类型
    if (requestData.length === 0 || requestData.indexOf('throughput_history') !== -1) {
      this.sendThroughputHistory(clientId);
    }
    if (requestData.length === 0 || requestData.indexOf('node_status') !== -1) {
      this.sendNodeStatus(clientId);
    }
    if (requestData.length === 0 || requestData.indexOf('system_stats') !== -1) {
      this.sendSystemStats(clientId);
    }
  }

  private sendThroughputHistory(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const data: ThroughputPoint[] = this.generateThroughputHistory();

    client.ws.send(JSON.stringify({
      type: 'throughput_history',
      payload: data,
    }));
  }

  private sendNodeStatus(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.ws.send(JSON.stringify({
      type: 'node_status',
      payload: DEFAULT_NODES,
    }));
  }

  private sendSystemStats(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const activeNodes = `${this.clients.size} connected`;
    const gpuUtil = this.calculateAverageGpuUtil();
    const tokenThroughput = this.calculateAverageThroughput();
    const storageUsed = "12.8TB";

    client.ws.send(JSON.stringify({
      type: 'system_stats',
      payload: {
        activeNodes,
        gpuUtil: `${gpuUtil}%`,
        tokenThroughput: `${tokenThroughput}K/s`,
        storageUsed,
      },
    }));
  }

  private startDataPushers() {
    // QPS 更新（每 2 秒）
    setInterval(() => {
      this.updateQPS();
      this.broadcastQPS();
    }, 2000);

    // 延迟更新（每 2 秒）
    setInterval(() => {
      this.updateLatency();
      this.broadcastLatency();
    }, 2000);

    // 节点状态更新（每 5 秒）
    setInterval(() => {
      this.updateNodes();
      this.broadcastNodes();
    }, 5000);

    // 系统指标更新（每 10 秒）
    setInterval(() => {
      this.broadcastSystemStats();
    }, 10000);

    // 心跳检查（每 30 秒）
    setInterval(() => {
      this.checkHeartbeats();
    }, HEARTBEAT_INTERVAL);
  }

  private updateQPS() {
    // 模拟 QPS 波动
    const change = (Math.random() - 0.5) * 200;
    this.qpsValue = Math.max(500, Math.min(6000, this.qpsValue + change));

    const trendPct = ((this.qpsValue - 3842) / 3842 * 100).toFixed(1);
    this.qpsTrend = `${Number(trendPct) >= 0 ? "+" : ""}${trendPct}%`;
  }

  private updateLatency() {
    // 模拟延迟波动
    const change = (Math.random() - 0.5) * 5;
    this.latencyValue = Math.max(15, Math.min(120, this.latencyValue + change));

    const trendPct = ((this.latencyValue - 48) / 48 * 100).toFixed(1);
    this.latencyTrend = `${Number(trendPct) >= 0 ? "+" : ""}${trendPct}%`;
  }

  private updateNodes() {
    // 模拟节点状态变化
    DEFAULT_NODES.forEach(node => {
      if (node.status === 'inactive') return;

      // 随机调整 GPU 和温度
      node.gpu = Math.max(10, Math.min(100, node.gpu + (Math.random() - 0.5) * 3));
      node.temp = Math.max(30, Math.min(90, node.temp + (Math.random() - 0.5) * 2));

      // 随机调整任务数
      node.tasks = Math.max(0, Math.floor(node.tasks + (Math.random() - 0.5) * 10));

      // 偶尔切换状态
      if (Math.random() < 0.05) {
        node.status = node.gpu > 95 ? 'warning' : 'active';
      }
    });
  }

  private calculateAverageGpuUtil(): number {
    const activeNodes = DEFAULT_NODES.filter(n => n.status !== 'inactive');
    if (activeNodes.length === 0) return 0;

    const total = activeNodes.reduce((sum, n) => sum + n.gpu, 0);
    return parseFloat((total / activeNodes.length).toFixed(1));
  }

  private calculateAverageThroughput(): number {
    const history = this.generateThroughputHistory();
    const total = history.reduce((sum, h) => sum + h.tokens, 0);
    return Math.floor(total / history.length);
  }

  private generateThroughputHistory(): ThroughputPoint[] {
    const now = new Date();
    const hours = now.getHours();
    const points: ThroughputPoint[] = [];

    for (let i = 0; i < 12; i++) {
      const hour = (hours - i + 24) % 24;
      const qps = Math.floor(500 + Math.random() * 5500);
      const latency = Math.floor(15 + Math.random() * 105);
      const tokens = Math.floor(Math.random() * 150000);

      points.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        qps,
        latency,
        tokens,
      });
    }

    return points;
  }

  private broadcastQPS() {
    const message = JSON.stringify({
      type: 'qps_update',
      payload: {
        qps: this.qpsValue,
        trend: this.qpsTrend,
      },
    });

    this.clients.forEach((client, id) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  private broadcastLatency() {
    const message = JSON.stringify({
      type: 'latency_update',
      payload: {
        latency: this.latencyValue,
        trend: this.latencyTrend,
      },
    });

    this.clients.forEach((client, id) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  private broadcastNodes() {
    const message = JSON.stringify({
      type: 'node_status',
      payload: DEFAULT_NODES,
    });

    this.clients.forEach((client, id) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  private broadcastSystemStats() {
    const activeNodes = `${this.clients.size} connected`;
    const gpuUtil = this.calculateAverageGpuUtil();
    const tokenThroughput = this.calculateAverageThroughput();
    const storageUsed = "12.8TB";

    const message = JSON.stringify({
      type: 'system_stats',
      payload: {
        activeNodes,
        gpuUtil: `${gpuUtil}%`,
        tokenThroughput: `${tokenThroughput}K/s`,
        storageUsed,
      },
    });

    this.clients.forEach((client, id) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  private checkHeartbeats() {
    const now = Date.now();
    const timeout = HEARTBEAT_INTERVAL * 2; // 60 秒超时

    this.clients.forEach((client, id) => {
      if (now - client.lastHeartbeat > timeout) {
        console.log(`⚠️  客户端心跳超时，断开连接: ${id}`);
        client.ws.close(1000, 'Heartbeat timeout');
        this.clients.delete(id);
      }
    });
  }

  private handleError(error: Error) {
    console.error('❌ WebSocket 服务器错误:', error);
  }

  public shutdown() {
    console.log('🛑 关闭 YYC³ WebSocket 服务器...');

    this.clients.forEach((client, id) => {
      client.ws.close(1000, 'Server shutdown');
    });

    this.wss.close(() => {
      console.log('✅ YYC³ WebSocket 服务器已关闭');
    });
  }
}

// ============================================================
// 启动服务器
// ============================================================

const server = new YYC3WebSocketServer(PORT);

// 优雅关闭
process.on('SIGINT', () => {
  server.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.shutdown();
  process.exit(0);
});

console.log(`
╔══════════════════════════════════════════════════╗
║                                                        ║
║   YYC³ WebSocket 服务器                             ║
║                                                        ║
║   端口: ${PORT}                                   ║
║   协议: ws://localhost:${PORT}/ws                     ║
║                                                        ║
║   按 Ctrl+C 停止服务器                              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
`);
