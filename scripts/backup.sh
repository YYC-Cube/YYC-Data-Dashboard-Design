#!/bin/bash

# YYC³ 数据看盘 - 备份脚本
# 使用方法: ./scripts/backup.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 备份目录
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# 时间戳
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 数据库备份
backup_database() {
    log_info "备份数据库..."
    
    local backup_file="$BACKUP_DIR/db_$TIMESTAMP.sql"
    
    if pg_dump -h localhost -p 5433 -U postgres -d yyc3_aify > "$backup_file" 2>/dev/null; then
        log_success "数据库备份完成: $backup_file"
        
        # 压缩备份文件
        gzip "$backup_file"
        log_success "备份已压缩: ${backup_file}.gz"
    else
        log_error "数据库备份失败"
        return 1
    fi
}

# 配置备份
backup_config() {
    log_info "备份配置文件..."
    
    local backup_file="$BACKUP_DIR/config_$TIMESTAMP.tar.gz"
    
    tar -czf "$backup_file" \
        vite.config.ts \
        vitest.config.ts \
        tsconfig.json \
        tsconfig.node.json \
        .env \
        2>/dev/null || true
    
    log_success "配置备份完成: $backup_file"
}

# 代码备份
backup_code() {
    log_info "备份源代码..."
    
    local backup_file="$BACKUP_DIR/code_$TIMESTAMP.tar.gz"
    
    tar -czf "$backup_file" \
        src/ \
        server/ \
        database/ \
        scripts/ \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='coverage' \
        --exclude='.git' \
        2>/dev/null || true
    
    log_success "代码备份完成: $backup_file"
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理旧备份 (保留 7 天)..."
    
    # 删除 7 天前的备份文件
    find $BACKUP_DIR -type f -mtime +7 -delete
    
    log_success "旧备份清理完成"
}

# 显示备份列表
list_backups() {
    log_info "备份文件列表:"
    echo ""
    
    ls -lh $BACKUP_DIR/*.tar.gz $BACKUP_DIR/*.sql* 2>/dev/null || {
        log_warn "没有找到备份文件"
        return 1
    }
    
    echo ""
    
    # 显示总大小
    local total_size=$(du -sh $BACKUP_DIR 2>/dev/null | cut -f1)
    log_info "备份目录总大小: $total_size"
}

# 恢复数据库
restore_database() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log_error "请指定备份文件"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        return 1
    fi
    
    log_info "恢复数据库从: $backup_file"
    
    # 检查是否是压缩文件
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | psql -h localhost -p 5433 -U postgres -d yyc3_aify
    else
        psql -h localhost -p 5433 -U postgres -d yyc3_aify < "$backup_file"
    fi
    
    log_success "数据库恢复完成"
}

# 主函数
main() {
    case "${1:-all}" in
        all)
            log_info "开始完整备份..."
            backup_database
            backup_config
            backup_code
            cleanup_old_backups
            list_backups
            log_success "备份完成!"
            ;;
        db)
            backup_database
            cleanup_old_backups
            ;;
        config)
            backup_config
            ;;
        code)
            backup_code
            ;;
        list)
            list_backups
            ;;
        restore)
            restore_database "$2"
            ;;
        clean)
            log_info "清理所有备份..."
            rm -rf $BACKUP_DIR/*
            log_success "备份清理完成"
            ;;
        *)
            echo "使用方法: $0 [all|db|config|code|list|restore|clean]"
            echo "  all     - 完整备份 (默认)"
            echo "  db      - 仅备份数据库"
            echo "  config  - 仅备份配置"
            echo "  code    - 仅备份源代码"
            echo "  list    - 列出所有备份"
            echo "  restore - 恢复数据库 (需指定文件)"
            echo "  clean   - 清理所有备份"
            echo ""
            echo "示例:"
            echo "  $0                      # 完整备份"
            echo "  $0 db                   # 仅备份数据库"
            echo "  $0 list                 # 列出所有备份"
            echo "  $0 restore backups/db_20260224.sql.gz  # 恢复数据库"
            exit 1
            ;;
    esac
}

main "$@"
