import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  timestamp: string;
  details?: string;
  screenshot?: string;
}

interface TestReport {
  project: string;
  version: string;
  testDate: string;
  environment: {
    os: string;
    nodeVersion: string;
    browser?: string;
    viewport?: string;
  };
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
  };
  results: TestResult[];
  performance: {
    loadTime?: number;
    renderTime?: number;
    memoryUsage?: number;
  };
}

class YYC3TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;
  private reportDir: string;

  constructor() {
    this.reportDir = join(process.cwd(), 'test-reports');
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async runAllTests(): Promise<void> {
    console.log('======================================');
    console.log('YYC³ Dashboard - 智能测试系统');
    console.log('======================================\n');

    this.startTime = Date.now();

    await this.testEnvironment();
    await this.testDependencies();
    await this.testPWAConfiguration();
    await this.testComponents();
    await this.testHooks();
    await this.testResponsiveLayout();
    await this.testWebSocket();
    await this.testAIAssistant();
    await this.testNetworkConfig();
    await this.testOfflineMode();
    await this.testBuild();

    this.generateReport();
  }

  async testEnvironment(): Promise<void> {
    this.logTestStart('环境检测');
    
    const tests = [
      {
        name: 'Node.js 版本检查',
        test: () => {
          const version = process.version;
          const major = parseInt(version.slice(1).split('.')[0]);
          return major >= 18;
        }
      },
      {
        name: '操作系统检测',
        test: () => {
          const platform = process.platform;
          return ['darwin', 'win32', 'linux'].includes(platform);
        }
      },
      {
        name: '项目目录检查',
        test: () => {
          const requiredDirs = ['src', 'public', 'node_modules'];
          return requiredDirs.every(dir => existsSync(join(process.cwd(), dir)));
        }
      },
      {
        name: '配置文件检查',
        test: () => {
          const requiredFiles = ['package.json', 'vite.config.ts', 'tsconfig.json'];
          return requiredFiles.every(file => existsSync(join(process.cwd(), file)));
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testDependencies(): Promise<void> {
    this.logTestStart('依赖检查');

    const tests = [
      {
        name: 'React 依赖',
        test: () => {
          const pkg = require('../package.json');
          return pkg.dependencies?.react && pkg.dependencies['react-dom'];
        }
      },
      {
        name: 'TypeScript 依赖',
        test: () => {
          const pkg = require('../package.json');
          return pkg.devDependencies?.typescript;
        }
      },
      {
        name: 'Tailwind CSS 依赖',
        test: () => {
          const pkg = require('../package.json');
          return pkg.devDependencies?.tailwindcss;
        }
      },
      {
        name: 'Recharts 依赖',
        test: () => {
          const pkg = require('../package.json');
          return pkg.dependencies?.recharts;
        }
      },
      {
        name: 'Radix UI 依赖',
        test: () => {
          const pkg = require('../package.json');
          const radixPackages = Object.keys(pkg.dependencies || {})
            .filter(dep => dep.startsWith('@radix-ui/'));
          return radixPackages.length >= 10;
        }
      },
      {
        name: 'PWA 插件依赖',
        test: () => {
          const pkg = require('../package.json');
          return pkg.devDependencies?.['vite-plugin-pwa'];
        }
      },
      {
        name: 'react-swipeable 依赖',
        test: () => {
          const pkg = require('../package.json');
          return pkg.dependencies?.['react-swipeable'];
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testPWAConfiguration(): Promise<void> {
    this.logTestStart('PWA 配置检查');

    const tests = [
      {
        name: 'manifest.json 存在',
        test: () => {
          return existsSync(join(process.cwd(), 'public/manifest.json'));
        }
      },
      {
        name: 'manifest.json 格式验证',
        test: () => {
          const manifest = require('../public/manifest.json');
          return manifest.name && 
                 manifest.short_name && 
                 manifest.theme_color && 
                 manifest.background_color && 
                 Array.isArray(manifest.icons) && 
                 manifest.icons.length > 0;
        }
      },
      {
        name: 'manifest.json 图标配置',
        test: () => {
          const manifest = require('../public/manifest.json');
          const requiredSizes = ['72x72', '96x96', '192x192', '512x512'];
          const iconSizes = manifest.icons.map((icon: any) => icon.sizes);
          return requiredSizes.every(size => iconSizes.includes(size));
        }
      },
      {
        name: 'manifest.json 快捷方式配置',
        test: () => {
          const manifest = require('../public/manifest.json');
          return Array.isArray(manifest.shortcuts) && manifest.shortcuts.length === 4;
        }
      },
      {
        name: 'sw.js 存在',
        test: () => {
          return existsSync(join(process.cwd(), 'public/sw.js'));
        }
      },
      {
        name: 'PWA 图标资源',
        test: () => {
          const pwaIconsPath = join(process.cwd(), 'public/yyc3-icons/pwa');
          const requiredIcons = ['icon-72x72.png', 'icon-96x96.png', 'icon-192x192.png', 'icon-512x512.png'];
          return requiredIcons.every(icon => existsSync(join(pwaIconsPath, icon)));
        }
      },
      {
        name: 'iOS 图标资源',
        test: () => {
          const iosIconsPath = join(process.cwd(), 'public/yyc3-icons/ios');
          return existsSync(iosIconsPath);
        }
      },
      {
        name: 'Android 图标资源',
        test: () => {
          const androidIconsPath = join(process.cwd(), 'public/yyc3-icons/android');
          return existsSync(androidIconsPath);
        }
      },
      {
        name: 'Vite PWA 插件配置',
        test: () => {
          const viteConfig = require('../vite.config.ts');
          const configStr = JSON.stringify(viteConfig);
          return configStr.includes('VitePWA');
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testComponents(): Promise<void> {
    this.logTestStart('组件检查');

    const tests = [
      {
        name: 'Dashboard 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/Dashboard.tsx'));
        }
      },
      {
        name: 'DataMonitoring 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/DataMonitoring.tsx'));
        }
      },
      {
        name: 'OperationAudit 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/OperationAudit.tsx'));
        }
      },
      {
        name: 'UserManagement 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/UserManagement.tsx'));
        }
      },
      {
        name: 'SystemSettings 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/SystemSettings.tsx'));
        }
      },
      {
        name: 'AIAssistant 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/AIAssistant.tsx'));
        }
      },
      {
        name: 'TopBar 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/TopBar.tsx'));
        }
      },
      {
        name: 'BottomNav 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/BottomNav.tsx'));
        }
      },
      {
        name: 'Layout 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/Layout.tsx'));
        }
      },
      {
        name: 'Login 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/Login.tsx'));
        }
      },
      {
        name: 'GlassCard 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/GlassCard.tsx'));
        }
      },
      {
        name: 'NetworkConfig 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/NetworkConfig.tsx'));
        }
      },
      {
        name: 'ConnectionStatus 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/ConnectionStatus.tsx'));
        }
      },
      {
        name: 'OfflineIndicator 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/OfflineIndicator.tsx'));
        }
      },
      {
        name: 'PWAInstallPrompt 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/PWAInstallPrompt.tsx'));
        }
      },
      {
        name: 'UI 基础组件',
        test: () => {
          const uiDir = join(process.cwd(), 'src/app/components/ui');
          const uiFiles = require('fs').readdirSync(uiDir);
          return uiFiles.length >= 40;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testHooks(): Promise<void> {
    this.logTestStart('Hooks 检查');

    const tests = [
      {
        name: 'useWebSocketData Hook',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/hooks/useWebSocketData.ts'));
        }
      },
      {
        name: 'useMobileView Hook',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/hooks/useMobileView.ts'));
        }
      },
      {
        name: 'useNetworkConfig Hook',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/hooks/useNetworkConfig.ts'));
        }
      },
      {
        name: 'useOfflineMode Hook',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/hooks/useOfflineMode.ts'));
        }
      },
      {
        name: 'useInstallPrompt Hook',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/hooks/useInstallPrompt.ts'));
        }
      },
      {
        name: 'usePushNotifications Hook',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/hooks/usePushNotifications.ts'));
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testResponsiveLayout(): Promise<void> {
    this.logTestStart('响应式布局检查');

    const tests = [
      {
        name: 'Tailwind 配置文件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/styles/tailwind.css'));
        }
      },
      {
        name: '主题配置文件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/styles/theme.css'));
        }
      },
      {
        name: '主题颜色定义',
        test: () => {
          const themePath = join(process.cwd(), 'src/styles/theme.css');
          const themeContent = require('fs').readFileSync(themePath, 'utf-8');
          return themeContent.includes('--primary: #00d4ff') &&
                 themeContent.includes('--background: #060e1f');
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testWebSocket(): Promise<void> {
    this.logTestStart('WebSocket 功能检查');

    const tests = [
      {
        name: 'WebSocket URL 配置',
        test: () => {
          const wsHookPath = join(process.cwd(), 'src/app/hooks/useWebSocketData.ts');
          if (!existsSync(wsHookPath)) return false;
          const wsContent = require('fs').readFileSync(wsHookPath, 'utf-8');
          return wsContent.includes('ws://localhost:3113/ws');
        }
      },
      {
        name: '自动重连配置',
        test: () => {
          const wsHookPath = join(process.cwd(), 'src/app/hooks/useWebSocketData.ts');
          if (!existsSync(wsHookPath)) return false;
          const wsContent = require('fs').readFileSync(wsHookPath, 'utf-8');
          return wsContent.includes('reconnectInterval') && 
                 wsContent.includes('maxReconnectAttempts');
        }
      },
      {
        name: '心跳机制配置',
        test: () => {
          const wsHookPath = join(process.cwd(), 'src/app/hooks/useWebSocketData.ts');
          if (!existsSync(wsHookPath)) return false;
          const wsContent = require('fs').readFileSync(wsHookPath, 'utf-8');
          return wsContent.includes('heartbeatInterval');
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testAIAssistant(): Promise<void> {
    this.logTestStart('AI 助理功能检查');

    const tests = [
      {
        name: 'AIAssistant 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/AIAssistant.tsx'));
        }
      },
      {
        name: 'OpenAI API 配置',
        test: () => {
          const aiAssistantPath = join(process.cwd(), 'src/app/components/AIAssistant.tsx');
          if (!existsSync(aiAssistantPath)) return false;
          const aiContent = require('fs').readFileSync(aiAssistantPath, 'utf-8');
          return aiContent.includes('OpenAI') || 
                 aiContent.includes('api_key') || 
                 aiContent.includes('API Key');
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testNetworkConfig(): Promise<void> {
    this.logTestStart('网络配置功能检查');

    const tests = [
      {
        name: 'NetworkConfig 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/NetworkConfig.tsx'));
        }
      },
      {
        name: 'useNetworkConfig Hook',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/hooks/useNetworkConfig.ts'));
        }
      },
      {
        name: 'network-utils 工具',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/lib/network-utils.ts'));
        }
      },
      {
        name: 'WebRTC IP 检测',
        test: () => {
          const networkUtilsPath = join(process.cwd(), 'src/app/lib/network-utils.ts');
          if (!existsSync(networkUtilsPath)) return false;
          const utilsContent = require('fs').readFileSync(networkUtilsPath, 'utf-8');
          return utilsContent.includes('RTCPeerConnection') || 
                 utilsContent.includes('getLocalIP');
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testOfflineMode(): Promise<void> {
    this.logTestStart('离线模式功能检查');

    const tests = [
      {
        name: 'useOfflineMode Hook',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/hooks/useOfflineMode.ts'));
        }
      },
      {
        name: 'backgroundSync 工具',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/lib/backgroundSync.ts'));
        }
      },
      {
        name: 'Service Worker 离线回退',
        test: () => {
          const swPath = join(process.cwd(), 'public/sw.js');
          if (!existsSync(swPath)) return false;
          const swContent = require('fs').readFileSync(swPath, 'utf-8');
          return swContent.includes('networkFirstWithFallback') || 
                 swContent.includes('Offline');
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testBuild(): Promise<void> {
    this.logTestStart('构建检查');

    const tests = [
      {
        name: '构建脚本配置',
        test: () => {
          const pkg = require('../package.json');
          return pkg.scripts?.build && pkg.scripts?.dev && pkg.scripts?.preview;
        }
      },
      {
        name: 'TypeScript 配置',
        test: () => {
          return existsSync(join(process.cwd(), 'tsconfig.json'));
        }
      },
      {
        name: 'Vite 配置',
        test: () => {
          return existsSync(join(process.cwd(), 'vite.config.ts'));
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async runTest(name: string, testFn: () => boolean): Promise<void> {
    const startTime = Date.now();
    try {
      const result = testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        status: result ? 'pass' : 'fail',
        duration,
        timestamp: new Date().toISOString()
      });

      console.log(`  ${result ? '✅' : '❌'} ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        status: 'fail',
        duration,
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : String(error)
      });

      console.log(`  ❌ ${name} (${duration}ms) - ${error}`);
    }
  }

  logTestStart(category: string): void {
    console.log(`\n📋 ${category}`);
    console.log('─'.repeat(50));
  }

  generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    const total = this.results.length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0';

    const pkg = require('../package.json');

    const report: TestReport = {
      project: 'YYC³ 本地多端推理矩阵数据库数据看盘',
      version: pkg.version || '0.0.1',
      testDate: new Date().toISOString(),
      environment: {
        os: process.platform,
        nodeVersion: process.version,
      },
      summary: {
        total,
        passed,
        failed,
        skipped,
        passRate: parseFloat(passRate)
      },
      results: this.results,
      performance: {
        loadTime: totalDuration
      }
    };

    const reportPath = join(this.reportDir, `test-report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n======================================');
    console.log('测试报告生成完成');
    console.log('======================================');
    console.log(`总测试数: ${total}`);
    console.log(`通过: ${passed} ✅`);
    console.log(`失败: ${failed} ❌`);
    console.log(`跳过: ${skipped} ⏭️`);
    console.log(`通过率: ${passRate}%`);
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`\n报告路径: ${reportPath}`);
    console.log('======================================\n');

    this.generateMarkdownReport(report);
  }

  generateMarkdownReport(report: TestReport): void {
    const markdown = `# YYC³ Dashboard 测试报告

> **YanYuCloudCube**  
> 言启象限 | 语枢未来  
> *Words Initiate Quadrants, Language Serves as Core for the Future*

---

## 📊 测试概览

| 项目 | 值 |
|------|------|
| **项目名称** | ${report.project} |
| **版本** | ${report.version} |
| **测试时间** | ${new Date(report.testDate).toLocaleString('zh-CN')} |
| **操作系统** | ${report.environment.os} |
| **Node.js 版本** | ${report.environment.nodeVersion} |

---

## 📈 测试摘要

| 指标 | 数值 |
|------|------|
| **总测试数** | ${report.summary.total} |
| **通过** | ${report.summary.passed} ✅ |
| **失败** | ${report.summary.failed} ❌ |
| **跳过** | ${report.summary.skipped} ⏭️ |
| **通过率** | ${report.summary.passRate}% |
| **总耗时** | ${report.performance.loadTime}ms |

---

## 📋 详细测试结果

### 环境检测

${this.generateCategoryMarkdown('环境检测', report.results.filter(r => 
  ['Node.js 版本检查', '操作系统检测', '项目目录检查', '配置文件检查'].includes(r.name)
))}

### 依赖检查

${this.generateCategoryMarkdown('依赖检查', report.results.filter(r => 
  r.name.includes('依赖')
))}

### PWA 配置检查

${this.generateCategoryMarkdown('PWA 配置检查', report.results.filter(r => 
  ['manifest.json 存在', 'manifest.json 格式验证', 'manifest.json 图标配置', 'manifest.json 快捷方式配置', 'sw.js 存在', 'PWA 图标资源', 'iOS 图标资源', 'Android 图标资源', 'Vite PWA 插件配置'].includes(r.name)
))}

### 组件检查

${this.generateCategoryMarkdown('组件检查', report.results.filter(r => 
  r.name.includes('组件') || r.name === 'UI 基础组件'
))}

### Hooks 检查

${this.generateCategoryMarkdown('Hooks 检查', report.results.filter(r => 
  r.name.includes('Hook')
))}

### 响应式布局检查

${this.generateCategoryMarkdown('响应式布局检查', report.results.filter(r => 
  ['Tailwind 配置文件', '主题配置文件', '主题颜色定义'].includes(r.name)
))}

### WebSocket 功能检查

${this.generateCategoryMarkdown('WebSocket 功能检查', report.results.filter(r => 
  r.name.includes('WebSocket') || r.name.includes('心跳') || r.name.includes('重连')
))}

### AI 助理功能检查

${this.generateCategoryMarkdown('AI 助理功能检查', report.results.filter(r => 
  r.name.includes('AI') || r.name.includes('OpenAI')
))}

### 网络配置功能检查

${this.generateCategoryMarkdown('网络配置功能检查', report.results.filter(r => 
  r.name.includes('网络') || r.name.includes('WebRTC')
))}

### 离线模式功能检查

${this.generateCategoryMarkdown('离线模式功能检查', report.results.filter(r => 
  r.name.includes('离线') || r.name.includes('backgroundSync') || r.name.includes('Service Worker')
))}

### 构建检查

${this.generateCategoryMarkdown('构建检查', report.results.filter(r => 
  r.name.includes('脚本') || r.name.includes('TypeScript') || r.name.includes('Vite')
))}

---

## 🎯 测试结论

${report.summary.passRate >= 80 ? '### ✅ 测试通过' : '### ⚠️ 需要修复'}

${report.summary.passRate >= 80 ? 
  '所有核心功能测试通过，项目可以进入下一阶段开发。' : 
  '部分测试失败，请检查失败项并修复后重新测试。'}

---

## 🔧 修复建议

${this.generateFixSuggestions(report.results.filter(r => r.status === 'fail'))}

---

## 📞 技术支持

- **GitHub Issues**: [https://github.com/YYC-Cube/yyc3-data-dashboard/issues](https://github.com/YYC-Cube/yyc3-data-dashboard/issues)
- **Email**: support@yyc3.com

---

<div align="center">

**YYC³ 本地多端推理矩阵数据库数据看盘**

*言启象限 | 语枢未来*

**万象归元于云枢 | 深栈智启新纪元*

---

*报告生成时间：${new Date().toLocaleString('zh-CN')}*

</div>
`;

    const markdownPath = join(this.reportDir, `test-report-${Date.now()}.md`);
    writeFileSync(markdownPath, markdown);
    console.log(`Markdown 报告路径: ${markdownPath}\n`);
  }

  generateCategoryMarkdown(category: string, results: TestResult[]): string {
    if (results.length === 0) return `### ${category}\n\n无测试项\n`;
    
    const table = results.map(r => 
      `| ${r.name} | ${r.status === 'pass' ? '✅ 通过' : '❌ 失败'} | ${r.duration}ms | ${r.details || '-'} |`
    ).join('\n');

    return `### ${category}

| 测试项 | 状态 | 耗时 | 详情 |
|--------|------|------|------|
${table}

`;
  }

  generateFixSuggestions(failedResults: TestResult[]): string {
    if (failedResults.length === 0) return '无需修复建议。所有测试均通过！🎉';

    const suggestions = failedResults.map(r => {
      if (r.name.includes('依赖')) {
        return `- **${r.name}**: 运行 \`pnpm install\` 安装缺失的依赖`;
      } else if (r.name.includes('manifest.json')) {
        return `- **${r.name}**: 检查 \`public/manifest.json\` 文件格式和配置`;
      } else if (r.name.includes('sw.js')) {
        return `- **${r.name}**: 检查 \`public/sw.js\` Service Worker 实现`;
      } else if (r.name.includes('组件')) {
        return `- **${r.name}**: 确认组件文件存在于 \`src/app/components/\` 目录`;
      } else if (r.name.includes('Hook')) {
        return `- **${r.name}**: 确认 Hook 文件存在于 \`src/app/hooks/\` 目录`;
      } else if (r.name.includes('图标')) {
        return `- **${r.name}**: 检查图标资源是否存在于 \`public/yyc3-icons/\` 目录`;
      } else {
        return `- **${r.name}**: ${r.details || '请检查相关配置和实现'}`;
      }
    }).join('\n');

    return `### 修复建议\n\n${suggestions}\n`;
  }
}

async function main() {
  const runner = new YYC3TestRunner();
  await runner.runAllTests();
}

main().catch(console.error);
