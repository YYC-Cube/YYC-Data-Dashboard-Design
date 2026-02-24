-- YYC³ 数据看盘数据库初始化脚本
-- ==========================================
-- 数据库: yyc3_aify
-- 端口: 5433
-- 主机: localhost
--
-- 功能：
-- - 创建操作审计日志表
-- - 创建用户管理表
-- - 创建节点状态表
-- - 创建性能指标表
-- - 创建告警记录表
--
-- 执行方式:
-- psql -h localhost -p 5433 -d yyc3_aify -f database/migrate.sql
-- ==========================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================
-- 操作审计日志表
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  operation_type VARCHAR(100) NOT NULL,
  target VARCHAR(255),
  user_id INTEGER,
  username VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  details TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation_type ON audit_logs(operation_type);

-- 创建触发器函数更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER audit_logs_updated_at
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 用户管理表
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  full_name VARCHAR(200),
  phone VARCHAR(50),
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 创建触发器
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 节点状态表
-- ============================================================

CREATE TABLE IF NOT EXISTS node_status (
  id SERIAL PRIMARY KEY,
  node_name VARCHAR(100) UNIQUE NOT NULL,
  node_type VARCHAR(50),
  gpu_utilization DECIMAL(5,2),
  memory_utilization DECIMAL(5,2),
  temperature DECIMAL(5,2),
  queue_depth INTEGER DEFAULT 0,
  model VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  ip_address INET,
  port INTEGER,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_node_status_name ON node_status(node_name);
CREATE INDEX IF NOT EXISTS idx_node_status_status ON node_status(status);
CREATE INDEX IF NOT EXISTS idx_node_status_type ON node_status(node_type);

-- 创建触发器
CREATE TRIGGER node_status_updated_at
  BEFORE UPDATE ON node_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 性能指标表
-- ============================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  qps DECIMAL(10,2),
  latency DECIMAL(10,2),
  throughput DECIMAL(10,2),
  token_throughput DECIMAL(10,2),
  storage_usage DECIMAL(5,2),
  active_nodes INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at DESC);

-- ============================================================
-- 告警记录表
-- ============================================================

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  level VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(100),
  node_id INTEGER REFERENCES node_status(id),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts(level);
CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_node_id ON alerts(node_id);

-- ============================================================
-- 插入初始数据
-- ============================================================

-- 插入默认用户
INSERT INTO users (username, email, role, status, full_name) VALUES
  ('admin', 'admin@yyc3.local', 'admin', 'active', 'YYC³ 管理员'),
  ('operator', 'operator@yyc3.local', 'operator', 'active', 'YYC³ 操作员'),
  ('viewer', 'viewer@yyc3.local', 'viewer', 'active', 'YYC³ 观察员')
ON CONFLICT (username) DO NOTHING;

-- 插入初始节点状态
INSERT INTO node_status (node_name, node_type, gpu_utilization, memory_utilization, temperature, queue_depth, model, status, ip_address, port) VALUES
  ('GPU-A100-01', 'GPU', 87.5, 72.3, 68.2, 128, 'LLaMA-70B', 'active', '192.168.3.100', 3113),
  ('GPU-A100-02', 'GPU', 92.1, 85.6, 74.5, 156, 'Qwen-72B', 'active', '192.168.3.101', 3113),
  ('GPU-A100-03', 'GPU', 98.2, 94.3, 82.1, 89, 'DeepSeek-V3', 'warning', '192.168.3.102', 3113),
  ('GPU-H100-01', 'GPU', 65.4, 58.7, 55.3, 210, 'GLM-4', 'active', '192.168.3.103', 3113),
  ('GPU-H100-02', 'GPU', 78.6, 66.2, 62.4, 178, 'Mixtral', 'active', '192.168.3.104', 3113),
  ('GPU-H100-03', 'GPU', 0.0, 12.5, 32.0, 0, '-', 'inactive', '192.168.3.105', 3113),
  ('TPU-v4-01', 'TPU', 82.3, 70.1, 58.7, 95, 'LLaMA-70B', 'active', '192.168.3.106', 3113),
  ('TPU-v4-02', 'TPU', 55.8, 48.3, 50.2, 134, 'Qwen-72B', 'active', '192.168.3.107', 3113)
ON CONFLICT (node_name) DO NOTHING;

-- 插入一些示例性能指标
INSERT INTO performance_metrics (qps, latency, throughput, token_throughput, storage_usage, active_nodes, recorded_at) VALUES
  (3842, 48, 125.5, 138000, 12.8, 7, NOW() - INTERVAL '1 hour'),
  (3721, 52, 121.3, 134000, 12.8, 7, NOW() - INTERVAL '2 hours'),
  (3589, 55, 118.7, 131000, 12.8, 7, NOW() - INTERVAL '3 hours'),
  (3456, 50, 115.2, 128000, 12.7, 7, NOW() - INTERVAL '4 hours'),
  (3321, 48, 112.8, 125000, 12.7, 7, NOW() - INTERVAL '5 hours');

-- 插入一些示例告警
INSERT INTO alerts (level, message, source, node_id, is_resolved) VALUES
  ('warning', 'GPU 温度超过 80°C', 'monitoring', 3, FALSE),
  ('info', '系统性能监控正常', 'monitoring', NULL, TRUE),
  ('error', '节点 GPU-H100-03 离线', 'monitoring', 6, FALSE);

-- ============================================================
-- 创建视图
-- ============================================================

-- 节点状态汇总视图
CREATE OR REPLACE VIEW node_summary AS
SELECT
  ns.id,
  ns.node_name,
  ns.node_type,
  ns.gpu_utilization,
  ns.memory_utilization,
  ns.temperature,
  ns.queue_depth,
  ns.model,
  ns.status,
  ns.ip_address,
  ns.port,
  ns.last_heartbeat,
  COUNT(a.id) AS alert_count
FROM node_status ns
LEFT JOIN alerts a ON a.node_id = ns.id AND a.is_resolved = FALSE
GROUP BY ns.id;

-- ============================================================
-- 创建函数
-- ============================================================

-- 更新节点状态函数
CREATE OR REPLACE FUNCTION update_node_status(
  p_node_name VARCHAR,
  p_gpu_util DECIMAL,
  p_memory_util DECIMAL,
  p_temperature DECIMAL,
  p_queue_depth INTEGER
) RETURNS void AS $$
BEGIN
  INSERT INTO node_status (node_name, gpu_utilization, memory_utilization, temperature, queue_depth, last_heartbeat)
  VALUES (p_node_name, p_gpu_util, p_memory_util, p_temperature, p_queue_depth, NOW())
  ON CONFLICT (node_name) DO UPDATE SET
    gpu_utilization = EXCLUDED.gpu_utilization,
    memory_utilization = EXCLUDED.memory_utilization,
    temperature = EXCLUDED.temperature,
    queue_depth = EXCLUDED.queue_depth,
    last_heartbeat = EXCLUDED.last_heartbeat;
END;
$$ LANGUAGE plpgsql;

-- 记录性能指标函数
CREATE OR REPLACE FUNCTION record_performance_metrics(
  p_qps DECIMAL,
  p_latency DECIMAL,
  p_throughput DECIMAL,
  p_token_throughput DECIMAL,
  p_storage_usage DECIMAL,
  p_active_nodes INTEGER
) RETURNS void AS $$
BEGIN
  INSERT INTO performance_metrics (qps, latency, throughput, token_throughput, storage_usage, active_nodes)
  VALUES (p_qps, p_latency, p_throughput, p_token_throughput, p_storage_usage, p_active_nodes);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 数据清理任务
-- ============================================================

-- 清理 30 天前的性能指标（保留最近的性能数据）
CREATE OR REPLACE FUNCTION cleanup_old_metrics() RETURNS void AS $$
BEGIN
  DELETE FROM performance_metrics
  WHERE recorded_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 验证脚本执行
-- ============================================================

-- 显示所有创建的表
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '数据库迁移完成！';
  RAISE NOTICE '========================================';

  FOR tbl_name IN
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_name IN ('audit_logs', 'users', 'node_status', 'performance_metrics', 'alerts')
    ORDER BY t.table_name
  LOOP
    RAISE NOTICE '✅ 表已创建: %', tbl_name;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '初始数据统计：';

  RAISE NOTICE '  用户数量: %', (SELECT COUNT(*) FROM users);
  RAISE NOTICE '  节点数量: %', (SELECT COUNT(*) FROM node_status);
  RAISE NOTICE '  性能指标记录: %', (SELECT COUNT(*) FROM performance_metrics);
  RAISE NOTICE '  告警记录: %', (SELECT COUNT(*) FROM alerts);

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '数据库初始化完成！';
  RAISE NOTICE '========================================';
END $$;
