# 图片生成菜单配置指南

## 🎯 重要提示

**访问端口问题**：
- ❌ 错误：`http://localhost:4090/console/image-generation`（后端端口）
- ✅ 正确：`http://localhost:3000/console/image-generation`（前端端口）

前端运行在 **3000** 端口，后端API运行在 **4090** 端口。

## 📋 菜单配置

### 方式一：数据库菜单配置（推荐）

在 **系统设置 → 菜单管理** 中添加菜单，配置如下：

#### 基本信息

| 字段 | 值 | 说明 |
|------|-----|------|
| **菜单名称** | `图片生成` 或 `AI图片生成` | 显示在菜单中的名称 |
| **菜单类型** | `菜单` | 选择"菜单"类型 |
| **父级菜单** | `顶级菜单` | 可选择放在AI相关菜单下 |
| **菜单图标** | `i-lucide-images` 或 `i-lucide-image` | 图标名称 |
| **菜单路径** | `image-generation` | 路由路径（不带前缀） |
| **组件路径** | `/console/image-generation` | 页面组件路径 |
| **权限编码** | 留空或自定义 | 可选 |
| **排序** | `0` 或自定义 | 菜单显示顺序 |
| **显示状态** | 启用 ✅ | 启用后将显示 |

#### 关键配置说明

**1. 菜单路径**（重要）
- 配置：`image-generation`
- 不要加前缀 `/console/`
- 系统会自动拼接为完整路径

**2. 组件路径**（重要）
- 配置：`/console/image-generation`
- 对应文件：`apps/web/app/console/image-generation/index.vue`
- 必须以 `/` 开头
- 路径必须与实际文件位置对应

**3. 图标选择**
可用的图标：
- `i-lucide-images`（多图标）
- `i-lucide-image`（单图标）
- `i-lucide-file-image`（文件图标）
- `i-lucide-sparkles`（星星图标）

### 配置截图对照

根据你的截图，正确配置应该是：

```
菜单名称: 图片生成
菜单类型: 菜单
父级菜单: 顶级菜单
菜单图标: i-lucide-images
菜单路径: image-generation
组件路径: /console/image-generation  ← 确保完整，不要被截断
权限编码: [留空]
排序: 0
显示状态: ✅ 启用
```

### 方式二：直接访问URL

不配置菜单也可以直接访问：

```
http://localhost:3000/console/image-generation
```

前提是已经登录系统。

## 🔍 问题排查

### 1. 页面显示空白

**原因**：访问了错误的端口

**检查**：
```bash
# 确认访问的是前端端口3000，不是后端端口4090
http://localhost:3000/console/image-generation  ✅
http://localhost:4090/console/image-generation  ❌
```

### 2. 菜单不显示

**原因**：
- 显示状态未启用
- 组件路径配置错误
- 权限限制

**解决**：
1. 检查"显示状态"是否启用
2. 确认组件路径是 `/console/image-generation`
3. 检查权限配置

### 3. 点击菜单报错

**原因**：组件路径配置错误

**检查**：
```bash
# 确认文件存在
ls /Users/firefly/develop/ailiaobar_projects/BuildingAI/apps/web/app/console/image-generation/index.vue

# 确认组件路径配置
组件路径: /console/image-generation
```

### 4. 前端服务未运行

**检查**：
```bash
# 查看3000端口是否被占用
lsof -iTCP:3000 -sTCP:LISTEN

# 如果没有输出，启动前端服务
cd /path/to/BuildingAI
pnpm --filter web run dev
```

**验证**：
```bash
# 访问前端首页
curl http://localhost:3000

# 访问图片生成页面
curl http://localhost:3000/console/image-generation
```

## 📝 Nuxt 3 路由说明

### 文件系统路由

Nuxt 3 使用基于文件系统的路由：

| 文件位置 | 访问路径 |
|---------|---------|
| `app/index.vue` | `/` |
| `app/console/dashboard.vue` | `/console/dashboard` |
| `app/console/image-generation/index.vue` | `/console/image-generation` |
| `app/chat/[id].vue` | `/chat/:id` |

### 菜单系统中的配置

在菜单管理系统中：

1. **菜单路径**：相对路径，不含父级路径
   - 例如：`image-generation`
   - 系统会自动拼接父级路径

2. **组件路径**：完整的页面路径
   - 例如：`/console/image-generation`
   - 对应文件：`app/console/image-generation/index.vue`

## ✅ 验证配置正确性

### 1. 检查前端服务

```bash
# 确认服务运行
ps aux | grep "nuxt dev"

# 确认端口监听
lsof -iTCP:3000 -sTCP:LISTEN
```

### 2. 测试页面访问

```bash
# 测试前端首页
curl -I http://localhost:3000

# 测试图片生成页面
curl -I http://localhost:3000/console/image-generation

# 应该返回 200 状态码
```

### 3. 浏览器验证

1. 打开浏览器
2. 访问：`http://localhost:3000/console`
3. 登录系统
4. 查看左侧菜单是否显示"图片生成"
5. 点击菜单或直接访问 `http://localhost:3000/console/image-generation`

### 4. 检查页面内容

正常情况下应该看到：
- 页面标题："AI 图片生成"
- 输入区域：描述提示词输入框
- 参数设置：宽度、高度输入框
- 按钮："开始生成"
- 结果区域：图片展示区

## 🔄 完整配置流程

### Step 1: 确认服务运行

```bash
# 进入项目目录
cd /Users/firefly/develop/ailiaobar_projects/BuildingAI

# 启动服务（如果未运行）
pnpm run dev

# 等待服务启动（约10-20秒）
```

### Step 2: 访问管理后台

```
http://localhost:3000/console
```

### Step 3: 登录系统

使用管理员账号登录

### Step 4: 配置菜单

1. 进入 **系统设置 → 菜单管理**
2. 点击"添加菜单"
3. 填写配置：
   ```
   菜单名称: 图片生成
   菜单类型: 菜单
   父级菜单: 顶级菜单
   菜单图标: i-lucide-images
   菜单路径: image-generation
   组件路径: /console/image-generation
   排序: 0
   显示状态: 启用
   ```
4. 点击"确认"保存

### Step 5: 刷新页面

按 `Ctrl+R` 或 `Cmd+R` 刷新页面

### Step 6: 验证菜单

- 查看左侧菜单是否显示"图片生成"
- 点击菜单测试跳转
- 或直接访问 `http://localhost:3000/console/image-generation`

## 🎯 快速修复

如果当前配置有问题：

### 修复方式一：更新菜单配置

1. 在菜单管理中找到"图片生成"菜单
2. 点击编辑
3. 确认以下配置：
   - 菜单路径：`image-generation`
   - 组件路径：`/console/image-generation`（完整，不要被截断）
4. 保存并刷新页面

### 修复方式二：直接访问URL

不配置菜单，直接访问：

```
http://localhost:3000/console/image-generation
```

## 📞 获取帮助

如果仍然遇到问题：

1. 检查控制台错误信息（F12 → Console）
2. 查看网络请求（F12 → Network）
3. 检查后端日志：`/tmp/server-dev.log`
4. 检查前端日志：`/tmp/web-dev.log`

---

**最后更新**：2025-10-20  
**适用版本**：v1.0.0
