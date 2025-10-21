# 图片生成功能问题排查记录

## 问题描述

前端访问图片生成页面时报404错误。

## 问题分析

### 1. 端口冲突问题

**问题**：前端服务无法启动在默认端口3000上

**原因**：
- 端口3000被Xmind应用占用（PID 539）
- Nuxt服务自动切换到备用端口4091
- 导致访问 `http://localhost:3000` 无法正常工作

**解决方案**：
1. 关闭占用端口3000的进程：`kill 539`
2. 重启前端服务：`pnpm --filter web run dev`
3. 验证服务运行在正确端口：`lsof -iTCP:3000 -sTCP:LISTEN`

### 2. Docker配置说明

**当前状态**：
- ✅ PostgreSQL运行在Docker（端口53406→5432）
- ✅ Redis运行在Docker（端口53407→6379）
- ❌ 前端/后端服务未在Docker中运行（本地开发模式）

**Docker compose配置**：
- 文件位置：`docker/docker-compose.yml`
- 包含nodejs服务配置，但仅在生产环境使用
- 开发环境使用本地运行的服务

### 3. 服务运行状态

**后端（NestJS）**：
- ✅ 运行在端口：4090
- ✅ 进程正常运行
- ✅ API端点可访问

**前端（Nuxt）**：
- ✅ 运行在端口：3000
- ✅ 进程正常运行
- ✅ 页面可访问

## 验证步骤

### 1. 检查端口占用

```bash
# 检查3000端口
lsof -iTCP:3000 -sTCP:LISTEN

# 检查4090端口（后端）
lsof -iTCP:4090 -sTCP:LISTEN
```

### 2. 检查进程状态

```bash
# 检查前端进程
ps aux | grep "nuxt dev"

# 检查后端进程
ps aux | grep "nest"
```

### 3. 验证服务响应

```bash
# 测试前端
curl -I http://localhost:3000

# 测试后端
curl -I http://localhost:4090/health

# 测试图片生成页面
curl -I http://localhost:3000/console/image-generation
```

### 4. 验证Docker容器

```bash
# 查看运行中的容器
docker ps

# 检查容器健康状态
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 解决方案总结

### 快速修复步骤

1. **停止占用端口的进程**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **重启前端服务**
   ```bash
   cd /path/to/BuildingAI
   pnpm --filter web run dev
   ```

3. **验证服务启动**
   ```bash
   # 等待几秒后检查
   curl http://localhost:3000
   ```

4. **访问图片生成页面**
   - 直接访问：`http://localhost:3000/console/image-generation`
   - 需要先登录系统

### 常见问题FAQ

**Q: 为什么前端不在Docker中运行？**
A: 开发环境默认使用本地运行以提高开发效率和热重载速度。Docker配置主要用于生产部署。

**Q: 如何切换到Docker运行模式？**
A: 
```bash
cd docker
docker compose up -d
```

**Q: 端口3000被占用怎么办？**
A: 
- 方案1：关闭占用进程（推荐）
- 方案2：修改Nuxt配置使用其他端口

**Q: 图片生成页面404？**
A: 检查：
1. 前端服务是否运行
2. 访问的端口是否正确（应该是3000）
3. 路由文件是否存在：`apps/web/app/console/image-generation/index.vue`

**Q: 需要登录才能访问吗？**
A: 是的，需要先登录管理后台才能访问 `/console/*` 路由下的页面。

## 当前服务配置

| 服务 | 端口 | 运行方式 | 状态 |
|------|------|---------|------|
| 前端 (Nuxt) | 3000 | 本地进程 | ✅ 运行中 |
| 后端 (NestJS) | 4090 | 本地进程 | ✅ 运行中 |
| PostgreSQL | 53406 | Docker | ✅ 运行中 |
| Redis | 53407 | Docker | ✅ 运行中 |

## 访问地址

- **前端首页**：http://localhost:3000
- **管理后台**：http://localhost:3000/console
- **图片生成**：http://localhost:3000/console/image-generation
- **后端API**：http://localhost:4090
- **后端健康检查**：http://localhost:4090/health

## 下次启动

如果下次遇到端口冲突，执行以下命令：

```bash
# 1. 进入项目目录
cd /Users/firefly/develop/ailiaobar_projects/BuildingAI

# 2. 检查并清理端口
lsof -ti:3000,4090 | xargs kill -9 2>/dev/null

# 3. 启动服务
pnpm run dev

# 4. 等待服务启动完成（约10-20秒）
# 5. 访问 http://localhost:3000
```

## 相关文件

- 前端配置：`apps/web/nuxt.config.ts`
- 后端配置：`apps/server/src/main.ts`
- Docker配置：`docker/docker-compose.yml`
- 环境变量：`.env.development.local`

## 日志位置

- 前端日志：`/tmp/web-dev.log`
- 后端日志：控制台输出
- Docker日志：`docker logs buildingai-nodejs`
