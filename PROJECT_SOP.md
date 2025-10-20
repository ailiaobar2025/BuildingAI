# BuildingAI 项目运行 SOP (Standard Operating Procedure)

## 📋 目录

- [项目概述](#项目概述)
- [系统要求](#系统要求)
- [本地开发环境](#本地开发环境)
- [Docker 容器化部署](#docker-容器化部署)
- [硅基流动API配置](#硅基流动api配置)
- [常见问题排查](#常见问题排查)
- [维护与监控](#维护与监控)

## 项目概述

**BuildingAI** 是一个新一代快速构建AI应用的开发平台，基于以下技术栈：

- **后端**: NestJS + TypeORM + PostgreSQL
- **前端**: Vue.js 3 + Nuxt 3 + NuxtUI
- **工具链**: Turbo (Monorepo) + TypeScript + Vite
- **数据库**: PostgreSQL 17.x (with pgvector)
- **缓存**: Redis 8.x
- **包管理**: pnpm 10.x

---

## 系统要求

### 基础环境
- **Node.js**: >=22.x
- **pnpm**: >=10.x
- **Docker**: >=20.x (仅Docker部署需要)
- **Docker Compose**: >=2.x (仅Docker部署需要)

### 硬件要求
- **内存**: 最小 4GB，推荐 8GB+
- **存储**: 最小 10GB 可用空间
- **CPU**: 2核心+

---

## 本地开发环境

### 1. 环境准备

#### 1.1 安装依赖软件
```bash
# macOS (使用 Homebrew)
brew install node@22 pnpm postgresql@17 redis

# 启动本地服务
brew services start postgresql@17
brew services start redis
```

#### 1.2 克隆项目
```bash
git clone https://github.com/BidingCC/BuildingAI.git
cd BuildingAI
```

### 2. 配置环境变量

#### 2.1 复制配置文件
```bash
cp .env.development.local.example .env.development.local
```

#### 2.2 修改配置文件 `.env.development.local`
```bash
# 数据库配置（本地PostgreSQL）
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=buildingai

# Redis配置（本地Redis）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Web服务配置
VITE_APP_BASE_URL=http://localhost:4090
SERVER_PORT=4090
```

### 3. 数据库初始化

#### 3.1 创建数据库
```bash
# 连接PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE buildingai;

# 安装pgvector扩展
\c buildingai
CREATE EXTENSION IF NOT EXISTS vector;

# 退出
\q
```

### 4. 安装和启动项目

#### 4.1 安装依赖
```bash
# 设置pnpm镜像源（可选，提升下载速度）
pnpm config set registry https://registry.npmmirror.com

# 安装项目依赖
pnpm install
```

#### 4.2 启动开发服务器
```bash
# 启动所有服务（前端+后端）
pnpm dev

# 或者分别启动
pnpm --filter ./apps/server run dev    # 仅启动后端
pnpm --filter ./apps/web run dev        # 仅启动前端
```

### 5. 访问应用

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:4090
- **API文档**: http://localhost:4090/docs

**默认管理员账号**:
- 用户名: `admin`
- 密码: `BuildingAI&123456`

---

## Docker 容器化部署

### 1. 快速部署（推荐）

#### 1.1 配置环境文件
```bash
# 复制生产环境配置
cp .env.production.local.example .env.production.local

# 编辑配置文件
vim .env.production.local
```

#### 1.2 关键配置项
```bash
# 应用配置
NODE_ENV=production
SERVER_PORT=4090
VITE_APP_BASE_URL=http://localhost:4090

# 数据库配置
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=buildingai

# Redis配置
REDIS_PASSWORD=your_redis_password

# Docker资源限制
DOCKER_MEMORY_LIMIT=4096M
DOCKER_CPU_LIMIT=2.0
DOCKER_MEMORY_RESERVATION=1024M

# 端口映射（可选）
REDIS_EXTERNAL_PORT=6379
POSTGRES_EXTERNAL_PORT=5432
```

#### 1.3 启动服务
```bash
# 启动所有服务
pnpm docker:up

# 或者直接使用docker-compose
docker compose -p buildingai --env-file ./.env.production.local -f ./docker/docker-compose.yml up -d
```

### 2. 服务管理

#### 2.1 查看服务状态
```bash
# 查看容器状态
docker compose -p buildingai ps

# 查看日志
docker compose -p buildingai logs -f
docker compose -p buildingai logs -f nodejs  # 仅查看应用日志
```

#### 2.2 停止服务
```bash
# 停止所有服务
pnpm docker:down

# 或者直接使用docker-compose
docker compose -p buildingai down
```

#### 2.3 重启服务
```bash
# 重启应用容器
docker compose -p buildingai restart nodejs

# 重启所有服务
docker compose -p buildingai restart
```

### 3. 数据持久化

Docker部署会自动创建以下数据卷：
- `./docker/data/postgres/`: PostgreSQL数据
- `./docker/data/redis/`: Redis数据

### 4. 访问应用

等待2-3分钟服务完全启动后：
- **应用地址**: http://localhost:4090
- **默认账号**: admin / BuildingAI&123456

---

## 硅基流动API配置

### 1. 获取API密钥

1. 访问 [硅基流动官网](https://siliconflow.cn)
2. 注册账号并完成认证
3. 在控制台获取API密钥（格式：`sk-xxxxxx`）

### 2. 配置API

#### 2.1 登录管理后台
- 地址: http://localhost:4090
- 账号: admin / BuildingAI&123456

#### 2.2 添加API密钥
1. 进入 **API密钥管理** 页面
2. 点击 **添加密钥**
3. 选择 **硅基流动** 类型
4. 配置参数：
   - **API密钥**: `sk-xxxxxxxxxxxxxx`
   - **Base URL**: `https://api.siliconflow.cn/v1` （或留空使用默认值）

### 3. 常见配置错误

❌ **错误的Base URL配置**:
```
https://api.siliconflow.cn/v1/chat/completions  # 错误：这是完整端点
https://api.siliconflow.cn/                     # 错误：缺少v1路径
```

✅ **正确的Base URL配置**:
```
https://api.siliconflow.cn/v1                   # 正确
# 或者留空，代码会自动使用默认值
```

### 4. 测试API连接

```bash
# 测试硅基流动API连接
curl -X POST "https://api.siliconflow.cn/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-ai/DeepSeek-V3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 常见问题排查

### 1. 本地开发问题

#### 1.1 端口占用
```bash
# 查看端口占用
lsof -i :4090
lsof -i :3000

# 杀死占用进程
kill -9 <PID>
```

#### 1.2 数据库连接失败
```bash
# 检查PostgreSQL状态
brew services list | grep postgresql

# 重启PostgreSQL
brew services restart postgresql@17

# 检查数据库连接
psql -U postgres -h localhost -p 5432 -d buildingai
```

#### 1.3 Redis连接失败
```bash
# 检查Redis状态
brew services list | grep redis

# 重启Redis
brew services restart redis

# 测试连接
redis-cli ping
```

### 2. Docker部署问题

#### 2.1 容器启动失败
```bash
# 查看详细日志
docker compose -p buildingai logs nodejs

# 检查容器资源
docker stats

# 重新构建和启动
docker compose -p buildingai down
docker compose -p buildingai up -d --force-recreate
```

#### 2.2 内存不足
```bash
# 调整Docker内存限制（在.env文件中）
DOCKER_MEMORY_LIMIT=6144M
DOCKER_CPU_LIMIT=3.0
DOCKER_MEMORY_RESERVATION=2048M
```

#### 2.3 数据持久化问题
```bash
# 检查数据卷
docker volume ls
docker volume inspect buildingai_postgres_data

# 备份数据
docker exec buildingai-postgres pg_dump -U postgres buildingai > backup.sql
```

### 3. API配置问题

#### 3.1 硅基流动403错误
- 检查API密钥是否正确
- 确认Base URL配置：`https://api.siliconflow.cn/v1`
- 验证API密钥余额和权限

#### 3.2 模型调用失败
- 确认模型名称格式：如 `deepseek-ai/DeepSeek-V3`
- 检查API密钥对应的模型权限
- 查看后端日志排查具体错误

---

## 维护与监控

### 1. 日志管理

#### 1.1 本地开发日志
```bash
# 应用日志位置
tail -f logs/app.log
tail -f logs/error.log
```

#### 1.2 Docker日志
```bash
# 实时查看日志
docker compose -p buildingai logs -f

# 导出日志
docker compose -p buildingai logs > buildingai.log
```

### 2. 数据备份

#### 2.1 PostgreSQL备份
```bash
# 本地备份
pg_dump -U postgres -h localhost buildingai > backup_$(date +%Y%m%d_%H%M%S).sql

# Docker备份
docker exec buildingai-postgres pg_dump -U postgres buildingai > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 2.2 Redis备份
```bash
# 本地备份
redis-cli --rdb backup_$(date +%Y%m%d_%H%M%S).rdb

# Docker备份
docker exec buildingai-redis redis-cli --rdb /data/backup_$(date +%Y%m%d_%H%M%S).rdb
```

### 3. 性能监控

#### 3.1 系统资源监控
```bash
# 查看容器资源使用
docker stats buildingai-nodejs buildingai-postgres buildingai-redis

# 系统资源监控
htop
iostat -x 1
```

#### 3.2 应用健康检查
```bash
# 健康检查接口
curl http://localhost:4090/health

# 数据库连接检查
curl http://localhost:4090/health/db

# Redis连接检查
curl http://localhost:4090/health/redis
```

### 4. 更新部署

#### 4.1 代码更新
```bash
# 本地开发
git pull origin main
pnpm install
pnpm dev

# Docker部署
git pull origin main
docker compose -p buildingai down
docker compose -p buildingai up -d --build
```

#### 4.2 依赖更新
```bash
# 更新依赖
pnpm update

# 重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 🚀 快速启动清单

### 本地开发
- [ ] 安装Node.js 22+, pnpm 10+
- [ ] 启动PostgreSQL和Redis服务
- [ ] 复制并配置`.env.development.local`
- [ ] 运行`pnpm install`
- [ ] 运行`pnpm dev`
- [ ] 访问http://localhost:3000

### Docker部署
- [ ] 安装Docker和Docker Compose
- [ ] 复制并配置`.env.production.local`
- [ ] 运行`pnpm docker:up`
- [ ] 等待2-3分钟服务启动
- [ ] 访问http://localhost:4090

### 硅基流动配置
- [ ] 获取硅基流动API密钥
- [ ] 登录管理后台配置API
- [ ] Base URL设为：`https://api.siliconflow.cn/v1`
- [ ] 测试API连接

---

**📝 文档版本**: v1.0.0  
**📅 更新日期**: 2025-10-20  
**👥 维护团队**: BuildingAI Team

如有问题，请提交Issue到GitHub仓库或联系技术支持。