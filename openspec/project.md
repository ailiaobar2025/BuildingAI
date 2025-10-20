# Project Context

## Purpose
本文件旨在为 AI 助手提供项目上下文，确保其行为与项目技术栈、约定和目标保持一致。

## Tech Stack
- **Monorepo:** pnpm workspaces + Turbo
- **Backend:** NestJS (Node.js >= 22)
- **Frontend (Web):** Nuxt.js (Vue 3)
- **Frontend (Mobile):** uni-app (Vue 3)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Cache:** Redis
- **UI Framework:** Tailwind CSS

## Project Conventions

### Code Style
- **Formatter:** Prettier
- **Linter:** ESLint
- **Key Rules (from `prettier.config.mjs`):**
  - `printWidth`: 100
  - `tabWidth`: 4
  - `singleQuote`: false (use double quotes)
  - `semi`: true (use semicolons)
  - `trailingComma`: 'all'

### Architecture Patterns
- **Backend:** 模块化架构，遵循 NestJS 最佳实践。
- **Frontend:** 基于组件的架构，遵循 Nuxt.js 和 Vue 3 最佳实践。
- **State Management:** Pinia 用于 Web 和移动端的状态管理。

### Testing Strategy
- **Unit Tests:** 针对独立的业务逻辑、工具函数和组件编写单元测试。
- **Integration Tests:** 针对模块间的交互和 API 端点进行集成测试。
- **E2E Tests:** 覆盖关键用户流程的端到端测试。

### Git Workflow
- **Branching Strategy:** 推荐使用 GitHub Flow。
  1. 从 `develop` 分支创建新的特性分支 (e.g., `feature/xxx`)。
  2. 完成开发和测试后，提交 Pull Request 到 `develop` 分支。
  3. Code Review 通过后，合并到 `develop` 分支。
  4. `main` 分支用于发布稳定版本。
- **Commit Conventions:** 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，便于生成 Changelog 和版本管理。
  - e.g., `feat: add user login feature`
  - e.g., `fix: resolve issue with api response`

## Domain Context
本项目是一个 AI 应用的快速开发平台，旨在帮助开发者快速构建、部署和管理 AI 应用。

## Important Constraints
- 必须遵循 Monorepo 的包管理和脚本执行方式。
- 新增依赖需要经过评估，优先使用项目内已有的技术栈。
- 所有代码提交前必须通过 Lint 和 Format 检查。

## External Dependencies
- **Docker:** 用于本地开发环境的容器化部署。
- **GitHub:** 用于代码托管和协作。
