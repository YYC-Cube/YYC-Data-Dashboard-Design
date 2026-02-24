#!/bin/bash

# YYC³ 本地多端推理矩阵数据库数据看盘 - 快速启动脚本
# 使用方法: ./START.sh [dev|prod|ws|all]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印标题
print_header() {
    echo -e "${CYAN}======================================${NC}"
    echo -e "${CYAN}YYC³ Dashboard - 快速启动${NC}"
    echo -e "${CYAN}======================================${NC}"
    echo ""
}

# 进入项目目录
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        log_info "请访问 https://nodejs.org/ 下载安装"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装"
        log_info "请运行: npm install -g pnpm"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 安装依赖
install_deps() {
    if [ ! -d "node_modules" ]; then
        log_info "正在安装依赖..."
        pnpm install
        log_success "依赖安装完成"
    else
        log_info "依赖已安装，跳过安装"
    fi
}

# 检查数据库
check_database() {
    log_info "检查数据库连接..."
    
    if psql -h localhost -p 5433 -U postgres -c "SELECT version();" &> /dev/null; then
        log_success "数据库连接正常"
    else
        log_warn "数据库连接失败"
        log_info "请确保 PostgreSQL 正在运行"
        log_info "启动命令: brew services start postgresql@15"
        return 1
    fi
}

# 检查 Ollama
check_ollama() {
    log_info "检查 Ollama 服务..."
    
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        log_success "Ollama 服务正常"
    else
        log_warn "Ollama 服务未启动"
        log_info "启动命令: ollama serve"
        return 1
    fi
}

# 检查端口
check_ports() {
    log_info "检查端口占用..."
    
    local ports=(3118 3113 5433 11434)
    local port_names=("前端应用" "WebSocket" "PostgreSQL" "Ollama")
    
    for i in "${!ports[@]}"; do
        port=${ports[$i]}
        name=${port_names[$i]}
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warn "$name 端口 $port 已被占用"
        else
            log_success "$name 端口 $port 可用"
        fi
    done
}

# 启动 WebSocket 服务器
start_websocket() {
    log_info "启动 WebSocket 服务器 (端口 3113)..."
    
    pnpm exec tsx server/websocket-server.ts &
    WS_PID=$!
    
    # 等待 WebSocket 服务器启动
    sleep 2
    
    # 检查是否启动成功
    if ps -p $WS_PID > /dev/null; then
        log_success "WebSocket 服务器启动成功 (PID: $WS_PID)"
    else
        log_error "WebSocket 服务器启动失败"
        return 1
    fi
}

# 启动前端应用
start_frontend() {
    log_info "启动前端应用 (端口 3118)..."
    
    pnpm dev &
    FRONTEND_PID=$!
    
    # 等待前端应用启动
    sleep 2
    
    # 检查是否启动成功
    if ps -p $FRONTEND_PID > /dev/null; then
        log_success "前端应用启动成功 (PID: $FRONTEND_PID)"
    else
        log_error "前端应用启动失败"
        return 1
    fi
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    
    if [ ! -z "$WS_PID" ]; then
        kill $WS_PID 2>/dev/null || true
        log_success "WebSocket 服务器已停止"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        log_success "前端应用已停止"
    fi
    
    exit 0
}

# 捕获中断信号
trap stop_services SIGINT SIGTERM

# 显示访问信息
show_access_info() {
    echo ""
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}服务已启动${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""
    echo -e "${CYAN}前端应用:${NC}     http://localhost:3118"
    echo -e "${CYAN}WebSocket:${NC}     ws://localhost:3113/ws"
    echo -e "${CYAN}数据库:${NC}        PostgreSQL 5433"
    echo -e "${CYAN}Ollama:${NC}        http://localhost:11434"
    echo ""
    echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
    echo ""
}

# 开发模式 (完整启动)
dev_mode_all() {
    print_header
    
    check_dependencies
    install_deps
    check_database
    check_ollama
    check_ports
    
    start_websocket
    start_frontend
    
    show_access_info
    
    log_info "WebSocket 服务器 PID: $WS_PID"
    log_info "前端应用 PID: $FRONTEND_PID"
    
    # 等待进程
    wait $FRONTEND_PID $WS_PID
}

# 仅启动前端
dev_mode_frontend() {
    print_header
    
    check_dependencies
    install_deps
    check_ports
    
    start_frontend
    
    echo ""
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}前端应用已启动${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""
    echo -e "${CYAN}访问地址:${NC} http://localhost:3118"
    echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
    echo ""
    
    log_info "前端应用 PID: $FRONTEND_PID"
    
    # 等待进程
    wait $FRONTEND_PID
}

# 仅启动 WebSocket
dev_mode_ws() {
    print_header
    
    check_dependencies
    install_deps
    check_ports
    
    start_websocket
    
    echo ""
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}WebSocket 服务器已启动${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""
    echo -e "${CYAN}WebSocket 地址:${NC} ws://localhost:3113/ws"
    echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
    echo ""
    
    log_info "WebSocket 服务器 PID: $WS_PID"
    
    # 等待进程
    wait $WS_PID
}

# 生产模式
prod_mode() {
    print_header
    
    check_dependencies
    install_deps
    
    log_info "构建生产版本..."
    pnpm build
    
    log_success "构建完成"
    log_info "输出目录: dist/"
    
    echo ""
    log_info "预览生产版本:"
    echo "  pnpm preview"
    echo ""
}

# 主函数
main() {
    case "${1:-all}" in
        all)
            dev_mode_all
            ;;
        frontend)
            dev_mode_frontend
            ;;
        ws)
            dev_mode_ws
            ;;
        prod)
            prod_mode
            ;;
        check)
            print_header
            check_dependencies
            check_database
            check_ollama
            check_ports
            ;;
        *)
            echo "使用方法: $0 [all|frontend|ws|prod|check]"
            echo "  all       - 启动所有服务 (默认)"
            echo "  frontend  - 仅启动前端应用"
            echo "  ws        - 仅启动 WebSocket 服务器"
            echo "  prod      - 构建生产版本"
            echo "  check     - 检查依赖和服务状态"
            echo ""
            echo "示例:"
            echo "  $0           # 启动所有服务"
            echo "  $0 frontend  # 仅启动前端"
            echo "  $0 ws        # 仅启动 WebSocket"
            echo "  $0 check     # 检查状态"
            exit 1
            ;;
    esac
}

main "$@"
