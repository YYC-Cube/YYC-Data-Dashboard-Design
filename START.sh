#!/bin/bash

# YYC³ 本地多端推理矩阵数据库数据看盘 - 快速启动脚本

echo "======================================"
echo "YYC³ Dashboard - 快速启动"
echo "======================================"
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    pnpm install
    echo ""
fi

# 检查 Vite PWA 插件是否安装
if ! grep -q "vite-plugin-pwa" package.json; then
    echo "🔧 正在安装 PWA 插件..."
    pnpm add -D vite-plugin-pwa workbox-window
    echo ""
fi

# 启动开发服务器
echo "🚀 正在启动开发服务器..."
echo "访问地址: http://localhost:3118"
echo "按 Ctrl+C 停止服务器"
echo ""

pnpm dev
