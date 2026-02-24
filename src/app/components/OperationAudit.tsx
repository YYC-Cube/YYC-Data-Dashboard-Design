import React, { useState } from "react";
import {
  Search, Filter, Download, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, Eye, MoreHorizontal,
  User, Shield, Database, Server, Activity
} from "lucide-react";
import { GlassCard } from "./GlassCard";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell
} from "recharts";

const auditLogs = [
  { id: "AUD-20260222-0001", time: "14:32:08", user: "admin", role: "超级管理员", action: "模型部署", target: "DeepSeek-V3 部署至 GPU-A100-03", ip: "192.168.1.100", status: "success", risk: "low" },
  { id: "AUD-20260222-0002", time: "14:28:45", user: "ops_bot", role: "运维机器人", action: "节点重启", target: "GPU-H100-03 执行热重启", ip: "10.0.0.50", status: "success", risk: "medium" },
  { id: "AUD-20260222-0003", time: "14:25:10", user: "api_svc", role: "API 服务", action: "批量推理", target: "Batch#2847 提交 → LLaMA-70B", ip: "10.0.1.20", status: "running", risk: "low" },
  { id: "AUD-20260222-0004", time: "14:20:55", user: "dev_zhang", role: "开发者", action: "配置修改", target: "修改 Qwen-72B 推理参数", ip: "192.168.2.88", status: "success", risk: "medium" },
  { id: "AUD-20260222-0005", time: "14:15:22", user: "admin", role: "超级管理员", action: "数据迁移", target: "向量库分片迁移 Shard-05", ip: "192.168.1.100", status: "success", risk: "high" },
  { id: "AUD-20260222-0006", time: "14:10:08", user: "system", role: "系统", action: "自动告警", target: "GPU-A100-03 温度超过80°C", ip: "localhost", status: "warning", risk: "high" },
  { id: "AUD-20260222-0007", time: "14:05:33", user: "dev_li", role: "开发者", action: "模型下载", target: "Mixtral-8x7B 模型权重下载", ip: "192.168.2.92", status: "success", risk: "low" },
  { id: "AUD-20260222-0008", time: "14:00:11", user: "ops_bot", role: "运维机器人", action: "健康检查", target: "全节点巡检 → 7/8 正常", ip: "10.0.0.50", status: "success", risk: "low" },
  { id: "AUD-20260222-0009", time: "13:55:48", user: "admin", role: "超级管理员", action: "权限变更", target: "dev_wang 升级为运维角色", ip: "192.168.1.100", status: "success", risk: "high" },
  { id: "AUD-20260222-0010", time: "13:50:20", user: "api_svc", role: "API 服务", action: "异常请求", target: "非法Token访问 /api/v2/infer", ip: "203.0.113.45", status: "failed", risk: "high" },
];

const auditTrend = [
  { time: "08:00", ops: 120, errors: 2 },
  { time: "09:00", ops: 280, errors: 5 },
  { time: "10:00", ops: 450, errors: 3 },
  { time: "11:00", ops: 380, errors: 8 },
  { time: "12:00", ops: 320, errors: 4 },
  { time: "13:00", ops: 510, errors: 6 },
  { time: "14:00", ops: 420, errors: 3 },
];

const riskDistribution = [
  { level: "低风险", count: 245 },
  { level: "中风险", count: 82 },
  { level: "高风险", count: 18 },
  { level: "严重", count: 3 },
];

const tooltipStyle = {
  backgroundColor: "rgba(8, 25, 55, 0.95)",
  border: "1px solid rgba(0, 180, 255, 0.3)",
  borderRadius: "8px",
  color: "#e0f0ff",
  fontSize: "0.75rem",
  fontFamily: "'Rajdhani', sans-serif",
};

export function OperationAudit() {
  const [selectedFilter, setSelectedFilter] = useState("全部");
  const [detailLog, setDetailLog] = useState<typeof auditLogs[0] | null>(null);

  const statusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />;
      case "running": return <RefreshCw className="w-4 h-4 text-[#00d4ff] animate-spin" />;
      case "failed": return <XCircle className="w-4 h-4 text-[#ff3366]" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-[#ffdd00]" />;
      default: return <Clock className="w-4 h-4 text-[#aa55ff]" />;
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {[
          { label: "今日操作", value: "1,284", icon: Activity, color: "#00d4ff", sub: "较昨日 +12%" },
          { label: "异常事件", value: "18", icon: AlertTriangle, color: "#ffdd00", sub: "需要处理 3 条" },
          { label: "安全事件", value: "3", icon: Shield, color: "#ff3366", sub: "1 条未处理" },
          { label: "活跃用户", value: "24", icon: User, color: "#00ff88", sub: "在线 18 人" },
        ].map((card) => (
          <GlassCard key={card.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <div style={{ fontSize: "1.5rem", color: card.color, fontFamily: "'Orbitron', sans-serif" }}>
              {card.value}
            </div>
            <div className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.75rem" }}>{card.label}</div>
            <div className="text-[rgba(0,212,255,0.3)] mt-1" style={{ fontSize: "0.65rem" }}>{card.sub}</div>
          </GlassCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3">
        <GlassCard className="md:col-span-8 p-3 md:p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.9rem" }}>操作频次趋势</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={auditTrend}>
              <defs>
                <linearGradient id="opsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
              <XAxis dataKey="time" tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} />
              <YAxis tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="ops" stroke="#00d4ff" fill="url(#opsGrad)" strokeWidth={2} name="操作数" />
              <Area type="monotone" dataKey="errors" stroke="#ff3366" fill="rgba(255,51,102,0.1)" strokeWidth={1.5} name="异常数" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard className="md:col-span-4 p-3 md:p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#ff6600]" />
            <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.9rem" }}>风险等级分布</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={riskDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
              <XAxis type="number" tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} />
              <YAxis dataKey="level" type="category" tick={{ fill: "rgba(0,212,255,0.5)", fontSize: 11 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} width={50} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} name="事件数">
                {riskDistribution.map((_, idx) => {
                  const colors = ["#00ff88", "#ffdd00", "#ff6600", "#ff3366"];
                  return <Cell key={idx} fill={colors[idx]} fillOpacity={0.7} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Audit Log Table */}
      <GlassCard className="p-3 md:p-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.9rem" }}>审计日志</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgba(0,212,255,0.4)]" />
              <input placeholder="搜索日志..." className="pl-8 pr-3 py-1.5 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] placeholder-[rgba(0,212,255,0.3)] focus:outline-none focus:border-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.75rem", width: "180px" }} />
            </div>
            {/* Filter */}
            {["全部", "成功", "异常", "告警"].map((f) => (
              <button key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition-all ${selectedFilter === f ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border border-[rgba(0,212,255,0.3)]" : "text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] border border-transparent"}`}
                style={{ fontSize: "0.72rem" }}
              >{f}</button>
            ))}
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)] text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] transition-all" style={{ fontSize: "0.72rem" }}>
              <Download className="w-3 h-3" /> 导出
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[rgba(0,180,255,0.08)]">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[rgba(0,40,80,0.3)]">
                {["状态", "审计ID", "时间", "用户", "角色", "操作", "目标", "IP地址", "风险", ""].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.7rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-t border-[rgba(0,180,255,0.05)] hover:bg-[rgba(0,180,255,0.03)] cursor-pointer transition-colors" onClick={() => setDetailLog(log)}>
                  <td className="px-3 py-2.5">{statusIcon(log.status)}</td>
                  <td className="px-3 py-2.5 text-[rgba(0,212,255,0.6)]" style={{ fontSize: "0.7rem", fontFamily: "'Orbitron', sans-serif" }}>{log.id}</td>
                  <td className="px-3 py-2.5 text-[#c0dcf0]" style={{ fontSize: "0.75rem" }}>{log.time}</td>
                  <td className="px-3 py-2.5 text-[#00d4ff]" style={{ fontSize: "0.75rem" }}>{log.user}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-[rgba(0,212,255,0.06)] text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.65rem" }}>{log.role}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[#c0dcf0]" style={{ fontSize: "0.75rem" }}>{log.action}</td>
                  <td className="px-3 py-2.5 text-[rgba(0,212,255,0.5)] max-w-[200px] truncate" style={{ fontSize: "0.72rem" }}>{log.target}</td>
                  <td className="px-3 py-2.5 text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.7rem", fontFamily: "monospace" }}>{log.ip}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded ${
                      log.risk === "low" ? "bg-[rgba(0,255,136,0.1)] text-[#00ff88]" :
                      log.risk === "medium" ? "bg-[rgba(255,221,0,0.1)] text-[#ffdd00]" :
                      "bg-[rgba(255,51,102,0.1)] text-[#ff3366]"
                    }`} style={{ fontSize: "0.62rem" }}>
                      {log.risk === "low" ? "低" : log.risk === "medium" ? "中" : "高"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button className="p-1 rounded hover:bg-[rgba(0,212,255,0.1)] transition-all">
                      <Eye className="w-3.5 h-3.5 text-[rgba(0,212,255,0.4)]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.72rem" }}>共 1,284 条记录</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-[rgba(0,212,255,0.1)] transition-all">
              <ChevronLeft className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
            </button>
            {[1, 2, 3, "...", 128].map((p, i) => (
              <button key={i} className={`px-2.5 py-1 rounded transition-all ${p === 1 ? "bg-[rgba(0,212,255,0.15)] text-[#00d4ff]" : "text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff]"}`} style={{ fontSize: "0.72rem" }}>
                {p}
              </button>
            ))}
            <button className="p-1.5 rounded hover:bg-[rgba(0,212,255,0.1)] transition-all">
              <ChevronRight className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Detail Modal */}
      {detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-0" onClick={() => setDetailLog(null)}>
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm" />
          <div className="relative w-full max-w-[500px] max-h-[85vh] overflow-auto rounded-2xl bg-[rgba(8,25,55,0.9)] backdrop-blur-2xl border border-[rgba(0,180,255,0.2)] shadow-[0_0_60px_rgba(0,180,255,0.1)] p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#e0f0ff]" style={{ fontSize: "1rem" }}>审计详情</h3>
              <button onClick={() => setDetailLog(null)} className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)]">
                <XCircle className="w-5 h-5 text-[rgba(0,212,255,0.4)]" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { k: "审计 ID", v: detailLog.id },
                { k: "操作时间", v: `2026-02-22 ${detailLog.time}` },
                { k: "操作用户", v: detailLog.user },
                { k: "用户角色", v: detailLog.role },
                { k: "操作类型", v: detailLog.action },
                { k: "操作目标", v: detailLog.target },
                { k: "来源 IP", v: detailLog.ip },
                { k: "操作状态", v: detailLog.status === "success" ? "成功" : detailLog.status === "failed" ? "失败" : detailLog.status === "warning" ? "告警" : "进行中" },
                { k: "风险等级", v: detailLog.risk === "low" ? "低风险" : detailLog.risk === "medium" ? "中风险" : "高风险" },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between py-2 border-b border-[rgba(0,180,255,0.06)]">
                  <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.78rem" }}>{row.k}</span>
                  <span className="text-[#c0dcf0]" style={{ fontSize: "0.78rem" }}>{row.v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button className="flex-1 py-2 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.2)] transition-all" style={{ fontSize: "0.8rem" }}>
                追溯链路
              </button>
              <button className="flex-1 py-2 rounded-xl bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] transition-all" style={{ fontSize: "0.8rem" }}>
                导出报告
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}