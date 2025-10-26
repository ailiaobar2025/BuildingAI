# 项目架构总览

BuildingAI 是一个面向 AI 应用场景的全栈单仓（monorepo）项目，采用 **pnpm + Turbo** 管理 TypeScript 技术栈，统一交付服务端、Web 控制台、移动端和多套共享能力。本章节概述仓库中各个子系统、共享包与基础设施之间的协同关系，帮助你快速理解整体架构。

## 架构概述

- 🧱 **单仓管理**：通过 `pnpm-workspace` 和 Turbo Pipeline 在单一仓库中管理所有应用与包，统一依赖、脚本与规范。
- ⚙️ **全栈 TypeScript**：服务端基于 NestJS 11，Web 控制台使用 Nuxt 3 + Vue 3，移动端采用 Uni-App，核心工具库统一使用 TypeScript 开发。
- ☁️ **云原生友好**：内置 Docker Compose 编排 PostgreSQL（含 pgvector）、Redis 与 Node 运行时，可一键在本地或云端拉起完整环境。
- 🔌 **可扩展能力**：后端内置插件体系、任务队列、定时调度与 MCP（Model Context Protocol）适配器，满足 AI 场景中多任务编排与模型集成需求。

## 应用层（`apps/*`）

### `apps/server` — 后端服务（NestJS）

- 提供管理端与业务端统一的 REST / SSE / Webhook 接口，负责鉴权、对话推理、模型资源、知识库、计费等核心能力。
- 业务模块划分：
  - `src/modules/console`：后台管理域（菜单、角色、权限、插件、系统配置等）。
  - `src/modules/web`：面向终端用户的公开接口（认证、用户资产、上传、AI 能力等）。
- 核心基础模块：
  - `src/core/database`：基于 TypeORM 连接 PostgreSQL + pgvector，统一管理实体、迁移与数据访问。
  - `src/core/cache` / `src/core/redis`：封装 Redis 缓存与分布式锁能力。
  - `src/core/queue`：通过 Bull + Redis 提供异步任务与流程编排。
  - `src/core/plugins`：插件加载与沙箱机制，支撑扩展包的按需启停。
  - `src/core/schedule`：定时任务调度，处理周期性同步与清理。
  - `src/common`：收敛配置、DTO、守卫、过滤器、拦截器与通用服务基类。
- 额外能力：事件总线、文件存储（本地磁盘/对象存储适配）、MCP 集成、日志与健康检查。

### `apps/web` — Web 控制台（Nuxt 3 + Vue 3）

- 面向运营与开发者的管理界面，内置多语言（`@nuxtjs/i18n`）、深色模式、PWA 支持与可视化大屏组件。
- 使用 `@fastbuildai/http` 作为统一的 HTTP/SSE 客户端，搭配 Pinia 状态管理、Nuxt UI 组件和 Tailwind 4 构建页面体验。
- 在构建阶段通过 Turbo/`nuxi generate` 生成静态资源，可托管于任意静态站点或通过 Node SSR 按需渲染。

### `apps/mobile` — 移动端（Uni-App）

- 采用 Uni-App + Vue 3 封装一套多端运行能力，支持 H5、小程序、快应用等多种目标平台。
- 共享 `@fastbuildai/http` 与 `@fastbuildai/assets`，复用服务端接口规范，保持 Web 与移动端的一致性体验。
- 提供统一的脚本快速打包至不同运行环境。

## 共享能力层（`packages/*`）

| 包名 | 作用 | 主要使用方 |
| --- | --- | --- |
| `@fastbuildai/constants` | 平台通用常量、枚举与业务配置 | Server / Web / Mobile |
| `@fastbuildai/utils` | 跨端工具方法（格式化、校验、数据结构等） | Server / Web / Mobile |
| `@fastbuildai/http` | 基于 ofetch 的 HTTP 客户端，内置拦截器、SSE 流处理、文件上传与请求去重 | Web / Mobile |
| `@fastbuildai/ui` | Tailwind + Nuxt UI 的共享组件与样式，沉淀表单、富文本、对话等复合组件 | Web |
| `@fastbuildai/designer` | 可视化工作流/页面设计器核心，提供画布、拖拽、预览等能力 | Web |
| `@fastbuildai/config` | 统一的 ESLint、TSConfig、PostCSS 等工程化配置 | 全局 |
| `@fastbuildai/assets` | 图标、字体、插图等静态资源 | Web / Mobile |

共享包由 pnpm workspace 链接，发布时可按需构建到各自的 `lib` 目录或直接作为源码依赖（如 UI/Designer）。

## 基础设施与部署

- **开发体验**：`turbo.json` 定义跨项目的 `build` / `dev` / `lint` 管道；每个应用的脚本对齐至仓库根脚本（如 `pnpm dev` 会触发多应用并行调试）。
- **环境配置**：根目录提供 `.env.*.example`，通过变量控制数据库、缓存、第三方模型等配置；`apps/server` 与前端应用在启动时读取对应环境变量。
- **容器编排**：`docker/docker-compose.yml` 拉起 PostgreSQL（带 pgvector 扩展）、Redis 以及 Node 运行容器，自动安装依赖、构建 Web 与 Server，并运行生产版服务。
- **静态资源**：公共资源存放于 `public/` 目录，可由 Nginx/OSS/CDN 直接托管；服务端的上传与插件文件位于 `apps/server/storage/*`。

## 典型调用链

1. 用户在浏览器或移动端发起操作，由前端应用（Nuxt/Uni-App）通过 `@fastbuildai/http` 调用后端接口或监听流式响应。
2. `apps/server` 负责请求鉴权、参数校验，进入对应业务模块：
   - 管理端请求会路由至 `modules/console`，执行权限校验、角色/菜单配置等逻辑；
   - 业务端请求路由至 `modules/web`，处理对话、模型、知识库等业务流程。
3. 服务端借助核心模块访问 PostgreSQL/pgvector、Redis，必要时将长任务投递至 Bull 队列或触发定时任务。
4. 结果以同步响应、Server-Sent Events 流或 Webhooks 的形式返回给前端；前端根据响应更新状态、刷新页面或追加对话消息。

```
          ┌──────────────────────┐
          │  apps/web (Nuxt 3)   │
          │  apps/mobile (Uni)   │
          └──────────┬──────────┘
                     │ HTTP / SSE
                     ▼
        ┌──────────────────────────────┐
        │  apps/server (NestJS 11)      │
        │  - Console / Web Modules      │
        │  - Core: DB / Cache / Queue   │
        │  - Plugins / Schedule / MCP   │
        └──────┬──────────────┬────────┘
               │              │
        ┌──────▼──────┐ ┌─────▼─────┐
        │ PostgreSQL  │ │  Redis    │
        │ + pgvector  │ │  (Cache & │
        │              │ │  Bull MQ)│
        └─────────────┘ └──────────┘
```

## 扩展与定制

- **插件体系**：`apps/server/src/plugins` 允许通过配置启用/禁用插件包，并通过 `storage/plugins` 管理动态资源。
- **模型接入**：凭借 MCP SDK 与 OpenAI SDK，可接入多家大模型或自建推理引擎，并通过知识库与向量检索增强语义效果。
- **工作流/可视化**：`@fastbuildai/designer` 与后台插件能力预留了可视化工作流、页面搭建的扩展空间。
- **DevOps**：通过 Turbo + pnpm 的依赖缓存、Docker 的环境一致性，使得 CI/CD 可以快速构建并复用缓存。

以上内容覆盖了 BuildingAI 的核心架构与关键目录，更多细节可参考各子项目下的 `README` 或源代码注释。