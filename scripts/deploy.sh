#!/bin/bash

# YYC³ 数据看盘 - 部署脚本
# 使用方法: ./scripts/deploy.sh [dev|prod]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 检查端口
check_ports() {
    log_info "检查端口..."
    
    local ports=(3118 3113 5433)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warn "端口 $port 已被占用"
            read -p "是否继续? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    done
    
    log_success "端口检查通过"
}

# 安装依赖
install_deps() {
    log_info "安装依赖..."
    pnpm install
    log_success "依赖安装完成"
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    
    if psql -h localhost -p 5433 -U postgres -lqt | cut -d \| -f 1 | grep -qw yyc3_aify; then
        log_warn "数据库 yyc3_aify 已存在"
        read -p "是否重新初始化? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            psql -h localhost -p 5433 -U postgres -c "DROP DATABASE IF EXISTS yyc3_aify;"
            psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE yyc3_aify;"
            psql -h localhost -p 5433 -U postgres -d yyc3_aify -f database/migrate.sql
            log_success "数据库重新初始化完成"
        fi
    else
        psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE yyc3_aify;"
        psql -h localhost -p 5433 -U postgres -d yyc3_aify -f database/migrate.sql
        log_success "数据库初始化完成"
    fi
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    pnpm test --run
    
    if [ $? -eq 0 ]; then
        log_success "测试通过"
    else
        log_error "测试失败"
        exit 1
    fi
}

# 开发模式
dev_mode() {
    log_info "启动开发模式..."
    
    check_dependencies
    check_ports
    install_deps
    
    # 启动 WebSocket 服务器
    log_info "启动 WebSocket 服务器 (端口 3113)..."
    pnpm exec tsx server/websocket-server.ts &
    WS_PID=$!
    
    # 等待 WebSocket 服务器启动
    sleep 2
    
    # 启动前端应用
    log_info "启动前端应用 (端口 3118)..."
    pnpm dev &
    FRONTEND_PID=$!
    
    log_success "开发环境启动完成"
    log_info "WebSocket 服务器 PID: $WS_PID"
    log_info "前端应用 PID: $FRONTEND_PID"
    log_info "访问地址: http://localhost:3118"
    log_info "按 Ctrl+C 停止服务"
    
    # 等待进程
    wait $FRONTEND_PID $WS_PID
}

# 生产模式
prod_mode() {
    log_info "启动生产模式..."
    
    check_dependencies
    install_deps
    init_database
    run_tests
    
    # 构建
    log_info "构建生产版本..."
    pnpm build
    log_success "构建完成"
    
    log_info "部署完成"
    log_info "输出目录: dist/"
    log_info "使用 'pnpm preview' 预览"
}

# 清理
cleanup() {
    log_info "停止服务..."
    if [ ! -z "$WS_PID" ]; then
        kill $WS_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    log_success "服务已停止"
    exit 0
}

# 捕获中断信号
trap cleanup SIGINT SIGTERM

# 主函数
main() {
    case "${1:-dev}" in
        dev)
            dev_mode
            ;;
        prod)
            prod_mode
            ;;
        test)
            check_dependencies
            install_deps
            run_tests
            ;;
        clean)
            log_info "清理..."
            rm -rf dist/ node_modules/ coverage/
            log_success "清理完成"
            ;;
        *)
            echo "使用方法: $0 [dev|prod|test|clean]"
            echo "  dev   - 开发模式 (默认)"
            echo "  prod  - 生产模式"
            echo "  test  - 运行测试"
            echo "  clean - 清理构建文件"
            exit 1
            ;;
    esac
}

main "$@"
