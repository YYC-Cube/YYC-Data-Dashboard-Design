const { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

class YYC3TestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.reportDir = join(process.cwd(), 'test-reports');
    
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async runAllTests() {
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
    await this.testProjectStructure();
    await this.testDocumentation();

    this.generateReport();
  }

  async testEnvironment() {
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
          return requiredFiles.some(file => existsSync(join(process.cwd(), file)));
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testDependencies() {
    this.logTestStart('依赖检查');

    const pkg = this.readPackageJson();
    if (!pkg) {
      await this.runTest('package.json 读取', () => false);
      return;
    }

    const tests = [
      {
        name: 'React 依赖',
        test: () => {
          return pkg.dependencies?.react || pkg.peerDependencies?.react;
        }
      },
      {
        name: 'TypeScript 依赖',
        test: () => {
          return pkg.devDependencies?.typescript || pkg.peerDependencies?.typescript;
        }
      },
      {
        name: 'Tailwind CSS 依赖',
        test: () => {
          return pkg.devDependencies?.tailwindcss;
        }
      },
      {
        name: 'Recharts 依赖',
        test: () => {
          return pkg.dependencies?.recharts;
        }
      },
      {
        name: 'Radix UI 依赖',
        test: () => {
          const radixPackages = Object.keys(pkg.dependencies || {})
            .filter(dep => dep.startsWith('@radix-ui/'));
          return radixPackages.length >= 10;
        }
      },
      {
        name: 'PWA 插件依赖',
        test: () => {
          return pkg.devDependencies?.['vite-plugin-pwa'];
        }
      },
      {
        name: 'react-swipeable 依赖',
        test: () => {
          return pkg.dependencies?.['react-swipeable'];
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testPWAConfiguration() {
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
          const manifest = this.readJsonFile('public/manifest.json');
          if (!manifest) return false;
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
          const manifest = this.readJsonFile('public/manifest.json');
          if (!manifest) return false;
          const requiredSizes = ['72x72', '96x96', '192x192', '512x512'];
          const iconSizes = manifest.icons.map(icon => icon.sizes);
          return requiredSizes.some(size => iconSizes.includes(size));
        }
      },
      {
        name: 'manifest.json 快捷方式配置',
        test: () => {
          const manifest = this.readJsonFile('public/manifest.json');
          if (!manifest) return false;
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
          if (!existsSync(pwaIconsPath)) return false;
          const icons = readdirSync(pwaIconsPath);
          return icons.length >= 5;
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
          const viteConfig = this.readFile('vite.config.ts');
          return viteConfig && viteConfig.includes('VitePWA');
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testComponents() {
    this.logTestStart('组件检查');

    const componentFiles = [
      'Dashboard.tsx',
      'DataMonitoring.tsx',
      'OperationAudit.tsx',
      'UserManagement.tsx',
      'SystemSettings.tsx',
      'AIAssistant.tsx',
      'TopBar.tsx',
      'BottomNav.tsx',
      'Layout.tsx',
      'Login.tsx',
      'GlassCard.tsx',
      'NetworkConfig.tsx',
      'ConnectionStatus.tsx',
      'OfflineIndicator.tsx',
      'PWAInstallPrompt.tsx'
    ];

    for (const file of componentFiles) {
      await this.runTest(`${file} 组件`, () => {
        return existsSync(join(process.cwd(), 'src/app/components', file));
      });
    }

    await this.runTest('UI 基础组件', () => {
      const uiDir = join(process.cwd(), 'src/app/components/ui');
      if (!existsSync(uiDir)) return false;
      const uiFiles = readdirSync(uiDir);
      return uiFiles.length >= 30;
    });
  }

  async testHooks() {
    this.logTestStart('Hooks 检查');

    const hookFiles = [
      'useWebSocketData.ts',
      'useMobileView.ts',
      'useNetworkConfig.ts',
      'useOfflineMode.ts',
      'useInstallPrompt.ts',
      'usePushNotifications.ts'
    ];

    for (const file of hookFiles) {
      await this.runTest(`${file} Hook`, () => {
        return existsSync(join(process.cwd(), 'src/app/hooks', file));
      });
    }
  }

  async testResponsiveLayout() {
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
          const themeContent = this.readFile('src/styles/theme.css');
          return themeContent && 
                 themeContent.includes('--primary') &&
                 themeContent.includes('#00d4ff') &&
                 themeContent.includes('--background') &&
                 themeContent.includes('#060e1f');
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testWebSocket() {
    this.logTestStart('WebSocket 功能检查');

    const tests = [
      {
        name: 'WebSocket Hook 文件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/hooks/useWebSocketData.ts'));
        }
      },
      {
        name: 'WebSocket URL 配置',
        test: () => {
          const wsContent = this.readFile('src/app/hooks/useWebSocketData.ts');
          return wsContent && wsContent.includes('3113');
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testAIAssistant() {
    this.logTestStart('AI 助理功能检查');

    const tests = [
      {
        name: 'AIAssistant 组件',
        test: () => {
          return existsSync(join(process.cwd(), 'src/app/components/AIAssistant.tsx'));
        }
      },
      {
        name: 'OpenAI 配置',
        test: () => {
          const aiContent = this.readFile('src/app/components/AIAssistant.tsx');
          return aiContent && 
                 (aiContent.includes('OpenAI') || 
                  aiContent.includes('api_key') || 
                  aiContent.includes('API Key'));
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testNetworkConfig() {
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
        name: 'WebRTC 检测',
        test: () => {
          const utilsContent = this.readFile('src/app/lib/network-utils.ts');
          return utilsContent && 
                 (utilsContent.includes('RTCPeerConnection') || 
                  utilsContent.includes('getLocalIP'));
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testOfflineMode() {
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
          const swContent = this.readFile('public/sw.js');
          return swContent && 
                 (swContent.includes('Offline') || 
                  swContent.includes('networkFirst'));
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testBuild() {
    this.logTestStart('构建检查');

    const pkg = this.readPackageJson();
    if (!pkg) {
      await this.runTest('package.json 读取', () => false);
      return;
    }

    const tests = [
      {
        name: '构建脚本配置',
        test: () => {
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

  async testProjectStructure() {
    this.logTestStart('项目结构检查');

    const tests = [
      {
        name: 'src 目录结构',
        test: () => {
          const srcPath = join(process.cwd(), 'src');
          if (!existsSync(srcPath)) return false;
          const items = readdirSync(srcPath);
          return items.includes('app') && items.includes('styles');
        }
      },
      {
        name: 'public 目录结构',
        test: () => {
          const publicPath = join(process.cwd(), 'public');
          if (!existsSync(publicPath)) return false;
          const items = readdirSync(publicPath);
          return items.includes('yyc3-icons') && items.includes('manifest.json');
        }
      },
      {
        name: 'guidelines 目录',
        test: () => {
          return existsSync(join(process.cwd(), 'guidelines'));
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async testDocumentation() {
    this.logTestStart('文档检查');

    const tests = [
      {
        name: 'README.md 存在',
        test: () => {
          return existsSync(join(process.cwd(), 'README.md'));
        }
      },
      {
        name: 'LOCAL-TEST-GUIDE.md 存在',
        test: () => {
          return existsSync(join(process.cwd(), 'LOCAL-TEST-GUIDE.md'));
        }
      },
      {
        name: 'SETUP-SUMMARY.md 存在',
        test: () => {
          return existsSync(join(process.cwd(), 'SETUP-SUMMARY.md'));
        }
      },
      {
        name: 'START.sh 启动脚本',
        test: () => {
          return existsSync(join(process.cwd(), 'START.sh'));
        }
      },
      {
        name: 'Figma 沟通记录',
        test: () => {
          return existsSync(join(process.cwd(), 'YYC3-Data-1.md')) &&
                 existsSync(join(process.cwd(), 'YYC3-Data-2.md')) &&
                 existsSync(join(process.cwd(), 'YYC3-Data-3.md'));
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  async runTest(name, testFn) {
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
        details: error.message || String(error)
      });

      console.log(`  ❌ ${name} (${duration}ms) - ${error.message}`);
    }
  }

  logTestStart(category) {
    console.log(`\n📋 ${category}`);
    console.log('─'.repeat(50));
  }

  readPackageJson() {
    try {
      const pkgPath = join(process.cwd(), 'package.json');
      const pkgContent = readFileSync(pkgPath, 'utf-8');
      return JSON.parse(pkgContent);
    } catch (error) {
      console.error('无法读取 package.json:', error.message);
      return null;
    }
  }

  readJsonFile(relativePath) {
    try {
      const filePath = join(process.cwd(), relativePath);
      const content = readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  readFile(relativePath) {
    try {
      const filePath = join(process.cwd(), relativePath);
      return readFileSync(filePath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    const total = this.results.length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0';

    const pkg = this.readPackageJson();

    const report = {
      project: 'YYC³ 本地多端推理矩阵数据库数据看盘',
      version: pkg?.version || '0.0.1',
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
    console.log(`\nJSON 报告路径: ${reportPath}`);
    console.log('======================================\n');

    this.generateMarkdownReport(report);
  }

  generateMarkdownReport(report) {
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
  r.name.includes('PWA') || r.name.includes('manifest') || r.name.includes('sw.js') || r.name.includes('图标')
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
  r.name.includes('Tailwind') || r.name.includes('主题') || r.name.includes('颜色')
))}

### WebSocket 功能检查

${this.generateCategoryMarkdown('WebSocket 功能检查', report.results.filter(r => 
  r.name.includes('WebSocket')
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
  r.name.includes('离线') || r.name.includes('background') || r.name.includes('Service Worker')
))}

### 构建检查

${this.generateCategoryMarkdown('构建检查', report.results.filter(r => 
  r.name.includes('脚本') || r.name.includes('TypeScript') || r.name.includes('Vite')
))}

### 项目结构检查

${this.generateCategoryMarkdown('项目结构检查', report.results.filter(r => 
  r.name.includes('目录') || r.name.includes('guidelines')
))}

### 文档检查

${this.generateCategoryMarkdown('文档检查', report.results.filter(r => 
  r.name.includes('README') || r.name.includes('GUIDE') || r.name.includes('SUMMARY') || r.name.includes('Figma') || r.name.includes('START')
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

  generateCategoryMarkdown(category, results) {
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

  generateFixSuggestions(failedResults) {
    if (failedResults.length === 0) return '### 修复建议\n\n无需修复建议。所有测试均通过！🎉\n';

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
