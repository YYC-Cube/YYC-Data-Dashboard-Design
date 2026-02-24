/**
 * Supabase Client 封装（Mock 模式）
 * ==================================
 * YYC³ 本地多端推理矩阵数据库
 *
 * 当前状态：纯前端 Mock 模式
 * 接入方式：配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量
 *
 * .env.development 配置示例：
 *   VITE_SUPABASE_URL=https://your-project.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 *
 * 本地直连 PostgreSQL 备选方案：
 *   VITE_DB_HOST=localhost
 *   VITE_DB_PORT=5433
 *   VITE_DB_NAME=yyc3_matrix
 */

// Mock 认证状态管理
interface MockUser {
  id: string;
  email: string;
  role: "admin" | "developer";
  name: string;
}

interface MockSession {
  user: MockUser;
  token: string;
  expiresAt: number;
}

// 预设用户（本地闭环系统：admin + developer 两种角色）
const MOCK_USERS: Record<string, { password: string; user: MockUser }> = {
  "admin@yyc-matrix.local": {
    password: "admin123",
    user: { id: "usr-001", email: "admin@yyc-matrix.local", role: "admin", name: "YYC Admin" },
  },
  "dev@yyc-matrix.local": {
    password: "dev123",
    user: { id: "usr-002", email: "dev@yyc-matrix.local", role: "developer", name: "YYC Developer" },
  },
};

const SESSION_KEY = "yyc3_session";

class MockSupabaseClient {
  auth = {
    /** 邮箱密码登录 */
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const entry = MOCK_USERS[email];
      if (!entry || entry.password !== password) {
        return { data: null, error: { message: "邮箱或密码不正确" } };
      }
      const session: MockSession = {
        user: entry.user,
        token: `mock_token_${Date.now()}`,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { data: { user: entry.user, session }, error: null };
    },

    /** 获取当前会话 */
    getSession: async () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return { data: { session: null }, error: null };
        const session: MockSession = JSON.parse(raw);
        if (Date.now() > session.expiresAt) {
          localStorage.removeItem(SESSION_KEY);
          return { data: { session: null }, error: null };
        }
        return { data: { session }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    },

    /** 获取当前用户 */
    getUser: async () => {
      const { data } = await this.auth.getSession();
      if (data.session) {
        return { data: { user: data.session.user }, error: null };
      }
      return { data: { user: null }, error: null };
    },

    /** 登出 */
    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      return { error: null };
    },

    /** 监听认证状态变化（简化实现） */
    onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
      // 初始化时检查一次
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        try {
          const session = JSON.parse(raw);
          callback("SIGNED_IN", session);
        } catch {
          callback("SIGNED_OUT", null);
        }
      } else {
        callback("SIGNED_OUT", null);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  };

  /** Mock 数据查询（模拟 Supabase .from().select() 链） */
  from(table: string) {
    return {
      select: (columns?: string) => ({
        eq: (col: string, val: any) => this._mockQuery(table, { [col]: val }),
        order: (col: string, opts?: { ascending?: boolean }) => this._mockQuery(table),
        limit: (n: number) => this._mockQuery(table),
        then: (resolve: (val: any) => void) => resolve(this._mockQuery(table)),
      }),
    };
  }

  private _mockQuery(table: string, filters?: Record<string, any>) {
    return { data: [], error: null, count: 0 };
  }
}

export const supabase = new MockSupabaseClient();
export type { MockUser, MockSession };
