#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yml"
ENV_DEV_FILE="$PROJECT_ROOT/.env.development.local"

REDIS_CONTAINER="buildingai-redis"
POSTGRES_CONTAINER="buildingai-postgres"

log() { printf "[%s] %s\n" "$(date '+%H:%M:%S')" "$*"; }
err() { printf "[ERROR] %s\n" "$*" 1>&2; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { err "需要命令: $1"; exit 127; }
}

wait_healthy() {
  local name="$1"; local timeout="${2:-120}"; local i=0
  while true; do
    local st
    st=$(docker inspect -f '{{.State.Health.Status}}' "$name" 2>/dev/null || echo "")
    if [[ "$st" == "healthy" ]]; then
      log "$name 健康"
      return 0
    fi
    if (( i >= timeout )); then
      err "$name 未在 ${timeout}s 内变为 healthy，当前: ${st:-unknown}"
      return 1
    fi
    ((i++))
    sleep 1
  done
}

get_port() {
  # usage: get_port <container> <container_port>
  docker port "$1" "$2/tcp" 2>/dev/null | head -n1 | awk -F: '{print $2}'
}

ensure_env() {
  if [[ ! -f "$ENV_DEV_FILE" ]]; then
    cp "$PROJECT_ROOT/.env.development.local.example" "$ENV_DEV_FILE"
    log "已创建 $ENV_DEV_FILE"
  fi
}

compose_up_db() {
  need_cmd docker
  log "启动 Docker 中的数据库与缓存..."
  docker compose -f "$COMPOSE_FILE" up -d postgres redis
  wait_healthy "$POSTGRES_CONTAINER" 180
  wait_healthy "$REDIS_CONTAINER" 180
}

compose_down_db() {
  need_cmd docker
  log "停止 Docker 中的数据库与缓存..."
  docker compose -f "$COMPOSE_FILE" down postgres redis || true
}

status() {
  docker ps --format '{{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E '^buildingai-(postgres|redis)' || true
}

start_dev() {
  ensure_env
  compose_up_db

  local PG_PORT REDIS_PORT
  PG_PORT=$(get_port "$POSTGRES_CONTAINER" 5432)
  REDIS_PORT=$(get_port "$REDIS_CONTAINER" 6379)
  if [[ -z "$PG_PORT" || -z "$REDIS_PORT" ]]; then
    err "无法解析映射端口。请检查: docker ps"
    exit 1
  fi

  log "使用本地开发环境启动应用..."
  log "Postgres -> localhost:$PG_PORT, Redis -> localhost:$REDIS_PORT"
  export DB_HOST=localhost DB_PORT="$PG_PORT" \
         REDIS_HOST=localhost REDIS_PORT="$REDIS_PORT" \
         SERVER_PORT=${SERVER_PORT:-4090}
  # 避免 Nuxt Host 警告，不强制覆盖 HOST
  (cd "$PROJECT_ROOT" && exec pnpm dev)
}

usage() {
  cat <<EOF
用法: $(basename "$0") [命令]
命令：
  start     启动 Docker 的 Postgres/Redis 并本地热更新开发(默认)
  up        仅启动 Docker 的 Postgres/Redis
  down      仅停止 Docker 的 Postgres/Redis
  status    查看 Postgres/Redis 状态
  logs      查看容器日志
EOF
}

case "${1:-start}" in
  start) start_dev ;;
  up) ensure_env; compose_up_db ;;
  down) compose_down_db ;;
  status) status ;;
  logs) docker logs -f "$POSTGRES_CONTAINER" & docker logs -f "$REDIS_CONTAINER" ;;
  *) usage; exit 2 ;;
esac
