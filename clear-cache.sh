#!/bin/bash

# YYC³ Dashboard - 清除缓存脚本

echo "======================================"
echo "YYC³ Dashboard - 清除缓存"
echo "======================================"
echo ""

# 清除 node_modules 缓存
echo "🧹 清除 node_modules 缓存..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache
echo "✅ node_modules 缓存已清除"
echo ""

# 清除 Vite 构建缓存
echo "🧹 清除 Vite 构建缓存..."
rm -rf dist
rm -rf .vite
echo "✅ Vite 构建缓存已清除"
echo ""

# 清除浏览器缓存指南
echo "🌐 浏览器缓存清除指南："
echo ""
echo "Chrome / Edge:"
echo "  1. 打开 DevTools (F12)"
echo "  2. 右键点击刷新按钮"
echo "  3. 选择 '清空缓存并硬性重新加载'"
echo "  4. 或使用快捷键: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows/Linux)"
echo ""
echo "Firefox:"
echo "  1. 打开 DevTools (F12)"
echo "  2. 右键点击刷新按钮"
echo "  3. 选择 '清空缓存并硬性重新加载'"
echo "  4. 或使用快捷键: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows/Linux)"
echo ""
echo "Safari:"
echo "  1. 菜单栏 > Safari > 设置"
echo "  2. 隐私 > 管理网站数据"
echo "  3. 搜索 localhost:3118"
echo "  4. 点击 '移除'"
echo ""
echo "或使用无痕模式测试:"
echo "  Chrome/Edge: Cmd+Shift+N (Mac) / Ctrl+Shift+N (Windows/Linux)"
echo "  Firefox: Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows/Linux)"
echo "  Safari: Cmd+Shift+N (Mac)"
echo ""

# 清除 Service Worker 缓存
echo "🧹 清除 Service Worker 缓存指南："
echo ""
echo "在浏览器控制台 (Console) 中运行以下代码："
echo ""
echo "  if ('serviceWorker' in navigator) {"
echo "    navigator.serviceWorker.getRegistrations().then(function(registrations) {"
echo "      registrations.forEach(function(registration) {"
echo "        registration.unregister();"
echo "        console.log('Service Worker 已注销');"
echo "      });"
echo "    });"
echo "  }"
echo ""

# 清除 localStorage
echo "🧹 清除 localStorage 指南："
echo ""
echo "在浏览器控制台 (Console) 中运行以下代码："
echo ""
echo "  localStorage.clear();"
echo "  console.log('localStorage 已清除');"
echo ""

# 清除 sessionStorage
echo "🧹 清除 sessionStorage 指南："
echo ""
echo "在浏览器控制台 (Console) 中运行以下代码："
echo ""
echo "  sessionStorage.clear();"
echo "  console.log('sessionStorage 已清除');"
echo ""

echo "======================================"
echo "缓存清除完成"
echo "======================================"
echo ""
echo "现在可以重新启动开发服务器："
echo "  ./START.sh"
echo ""
echo "然后访问: http://localhost:3118"
echo ""
