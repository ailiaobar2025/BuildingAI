# 图片生成功能完整指南

## 🎉 功能状态

✅ **所有功能已完成并修复**
- 后端API实现完成
- 前端页面实现完成
- 网络配置问题已修复
- 服务正常运行中

## 📍 快速访问

| 项目 | 地址 | 状态 |
|------|------|------|
| **前端首页** | http://localhost:3000 | ✅ 运行中 |
| **管理后台** | http://localhost:3000/console | ✅ 运行中 |
| **图片生成页面** | http://localhost:3000/console/image-generation | ✅ 可用 |
| **后端API** | http://localhost:4090 | ✅ 运行中 |
| **提交任务API** | http://localhost:4090/api/image-generation/submit | ✅ 可用 |
| **查询结果API** | http://localhost:4090/api/image-generation/query | ✅ 可用 |

## 🚀 使用步骤

### 1. 访问页面

有两种方式访问图片生成功能：

#### 方式一：直接URL访问（推荐）

```
http://localhost:3000/console/image-generation
```

#### 方式二：通过系统菜单

1. 登录管理后台
2. 进入 **系统设置 → 菜单管理**
3. 添加新菜单：
   - 菜单名称：`图片生成` 或 `AI图片生成`
   - 菜单类型：`菜单`
   - 路由地址：`/console/image-generation`
   - 图标：`i-lucide-image` 或 `i-lucide-images`
   - 排序：自定义
   - 父级菜单：可以放在 `AI` 相关菜单下

### 2. 生成图片

#### 文生图（Text to Image）

1. 在"描述提示词"输入框输入描述
   ```
   示例：一只可爱的橘色小猫坐在窗台上晒太阳，阳光透过窗户洒在它身上，温馨的室内场景
   ```

2. 设置图片尺寸（可选）
   - 宽度：1024
   - 高度：1024
   
3. 点击"开始生成"

4. 等待10-30秒

5. 查看生成结果

#### 图生图（Image to Image）

1. 点击"添加参考图片"
2. 输入参考图片URL
3. 输入修改描述
   ```
   示例：改成卡通风格，增加更多细节
   ```
4. 设置尺寸并生成

### 3. 保存结果

生成成功后可以：
- 点击"下载"按钮保存图片
- 点击"复制链接"获取图片URL

## 🔧 配置说明

### 环境变量

确保 `.env.development.local` 文件中配置正确：

```bash
# Volcengine Image Generation
VOLCENGINE_IMAGE_ENDPOINT=https://visual.volcengineapi.com  # ✅ 正确域名
VOLCENGINE_IMAGE_REGION=cn-north-1
VOLCENGINE_IMAGE_SERVICE=cv
VOLCENGINE_IMAGE_ACCESS_KEY_ID=your_access_key_id
VOLCENGINE_IMAGE_SECRET_ACCESS_KEY=your_secret_access_key
VOLCENGINE_IMAGE_DEFAULT_REQ_KEY=jimeng_t2i_v40
```

⚠️ **重要提示**：
- ❌ 不要使用 `cv.volcengineapi.com`（域名不存在）
- ✅ 必须使用 `visual.volcengineapi.com`（正确域名）

### 服务端口

| 服务 | 端口 | 检查命令 |
|------|------|---------|
| 前端 | 3000 | `lsof -iTCP:3000 -sTCP:LISTEN` |
| 后端 | 4090 | `lsof -iTCP:4090 -sTCP:LISTEN` |

## ❗ 常见问题

### 1. 页面显示"页面未找到"

**原因**：需要登录后才能访问 `/console/*` 路径

**解决**：
1. 先登录：http://localhost:3000/console
2. 再访问图片生成页面

或者通过系统菜单添加入口。

### 2. 生成时报错：ENOTFOUND cv.volcengineapi.com

**原因**：域名配置错误

**解决**：
1. 修改 `.env.development.local`
2. 将 `VOLCENGINE_IMAGE_ENDPOINT` 改为 `https://visual.volcengineapi.com`
3. 重启后端服务：
   ```bash
   lsof -ti:4090 | xargs kill
   pnpm --filter server run dev
   ```

**详细修复说明**：参见 `docs/IMAGE_GENERATION_NETWORK_FIX.md`

### 3. 提示"火山引擎图片生成服务未配置密钥"

**原因**：API密钥未配置或配置错误

**解决**：
1. 获取火山引擎API密钥
2. 配置环境变量
3. 重启服务

### 4. 生成速度慢或超时

**原因**：
- 网络连接慢
- 图片尺寸太大
- API服务繁忙

**解决**：
- 使用较小的图片尺寸（如512x512）
- 检查网络连接
- 稍后重试

### 5. 生成失败：内容审核未通过

**原因**：提示词包含敏感内容

**解决**：
- 修改提示词，避免敏感内容
- 使用更中性的描述

## 📊 技术架构

```
用户浏览器
    ↓
前端页面 (Vue + Nuxt)
    ↓ HTTP
后端API (NestJS)
    ↓
ImageGenerationService
    ↓
VolcengineImageGenerationSDK
    ↓ HTTPS
火山引擎即梦4.0 API
```

### 文件结构

**后端**：
```
apps/server/src/
├── sdk/ai/volcengine/
│   └── image-generation.sdk.ts        # SDK封装
├── modules/web/ai/
│   ├── controllers/
│   │   └── image-generation.controller.ts  # API控制器
│   ├── services/
│   │   └── image-generation.service.ts     # 业务服务
│   ├── dto/
│   │   └── image-generation.dto.ts         # 数据验证
│   ├── ai.module.ts                        # 模块注册
│   └── README_IMAGE_GENERATION.md          # 技术文档
```

**前端**：
```
apps/web/
├── app/console/image-generation/
│   └── index.vue                      # 页面组件
├── services/web/
│   └── image-generation.ts            # API服务
```

**文档**：
```
docs/
├── IMAGE_GENERATION_USAGE.md          # 使用说明
├── IMAGE_GENERATION_NETWORK_FIX.md    # 网络问题修复
├── IMAGE_GENERATION_TROUBLESHOOTING.md # 问题排查
└── IMAGE_GENERATION_COMPLETE_GUIDE.md  # 本文档
```

## 🎯 功能特性

### 支持的功能

- ✅ 文生图：根据文本描述生成图片
- ✅ 图生图：基于参考图和文本生成图片
- ✅ 自定义尺寸：512-2048像素
- ✅ 异步任务：提交后轮询查询结果
- ✅ 多张参考图：最多10张
- ✅ 下载保存：一键下载生成图片
- ✅ 链接复制：快速复制图片URL
- ✅ 实时状态：显示生成进度

### 参数说明

| 参数 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| prompt | string | 是 | 描述提示词 | 1-800字符 |
| imageUrls | string[] | 否 | 参考图URL | 最多10张 |
| width | number | 否 | 宽度 | 512-2048 |
| height | number | 否 | 高度 | 512-2048 |
| scale | number | 否 | 缩放比例 | 0-1 |
| forceSingle | boolean | 否 | 强制单张 | true/false |
| minRatio | number | 否 | 最小宽高比 | 1/16-16 |
| maxRatio | number | 否 | 最大宽高比 | 1/16-16 |

## 📝 使用技巧

### 提示词编写

**好的示例** ✅：
- "一只橘色的小猫，坐在木质窗台上，阳光透过窗户洒在它身上，温馨的室内场景"
- "赛博朋克风格的城市街道，霓虹灯广告牌，雨天夜晚，电影感构图"
- "水彩画风格的山水画，远山、近水、小船，中国传统绘画风格"

**不好的示例** ❌：
- "猫"（过于简单）
- "一只猫一只狗还有一朵花和一座山..."（过于复杂）

### 提高成功率

1. **使用详细描述**：包含主体、背景、光线、风格等
2. **指定画面风格**：写实、卡通、油画、水彩等
3. **描述具体场景**：室内/户外、白天/夜晚等
4. **合理尺寸**：建议1024x1024，过大可能超时

### 优化生成质量

1. **增加细节**：描述越详细，效果越好
2. **使用参考图**：提供风格参考
3. **多次尝试**：调整提示词重新生成
4. **分步描述**：先主体，再环境，再细节

## 🔄 服务管理

### 启动服务

```bash
# 启动所有服务
cd /path/to/BuildingAI
pnpm run dev

# 仅启动前端
pnpm --filter web run dev

# 仅启动后端
pnpm --filter server run dev
```

### 停止服务

```bash
# 停止所有Node进程
pkill -f "nuxt dev"
pkill -f "nest start"

# 或者按端口停止
lsof -ti:3000 | xargs kill
lsof -ti:4090 | xargs kill
```

### 重启服务

```bash
# 重启后端（应用新配置）
lsof -ti:4090 | xargs kill
pnpm --filter server run dev

# 重启前端
lsof -ti:3000 | xargs kill
pnpm --filter web run dev
```

### 查看日志

```bash
# 后端日志
cat /tmp/server-dev.log

# 前端日志
cat /tmp/web-dev.log

# 实时查看
tail -f /tmp/server-dev.log
```

## 📦 部署说明

### 生产环境配置

1. 修改 `.env.production.local`：
   ```bash
   VOLCENGINE_IMAGE_ENDPOINT=https://visual.volcengineapi.com
   VOLCENGINE_IMAGE_ACCESS_KEY_ID=生产环境密钥
   VOLCENGINE_IMAGE_SECRET_ACCESS_KEY=生产环境密钥
   ```

2. 构建项目：
   ```bash
   pnpm run build
   ```

3. 启动服务：
   ```bash
   # 使用PM2
   pm2 start ecosystem.config.js
   
   # 或使用Docker
   cd docker
   docker compose up -d
   ```

## 🔒 安全注意事项

1. ⚠️ **密钥保护**：不要将密钥提交到Git
2. ⚠️ **内容审核**：所有内容会经过审核
3. ⚠️ **调用限制**：注意API配额和频率限制
4. ⚠️ **数据安全**：生成的图片链接可能有有效期

## 📚 相关文档

- [使用说明](./IMAGE_GENERATION_USAGE.md)
- [网络问题修复](./IMAGE_GENERATION_NETWORK_FIX.md)
- [问题排查指南](./IMAGE_GENERATION_TROUBLESHOOTING.md)
- [技术文档](../apps/server/src/modules/web/ai/README_IMAGE_GENERATION.md)

## 🆘 获取帮助

如遇问题，请按以下步骤排查：

1. 查看本文档的"常见问题"部分
2. 查看 `docs/IMAGE_GENERATION_NETWORK_FIX.md`
3. 查看服务日志：`/tmp/server-dev.log` 和 `/tmp/web-dev.log`
4. 检查网络连接：`ping visual.volcengineapi.com`
5. 验证配置：`cat .env.development.local`

## ✨ 更新记录

- **2025-10-20**：
  - ✅ 完成后端API实现
  - ✅ 完成前端页面实现
  - ✅ 修复域名配置错误（cv → visual）
  - ✅ 修复端口冲突问题
  - ✅ 完成文档编写
  - ✅ 验证功能正常工作

---

**最后更新**：2025-10-20  
**版本**：v1.0.0  
**状态**：✅ 生产就绪
