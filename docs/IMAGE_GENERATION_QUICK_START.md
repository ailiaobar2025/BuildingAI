# 图片生成功能快速开始指南

## 🎯 立即使用

### 方式一：直接访问（最快）

打开浏览器访问：

**后台管理访问**（推荐）：
```
http://localhost:4091/console/image-generation
```

**用户端访问**：
```
http://localhost:3000/console/image-generation
```

### 方式二：通过菜单访问

如果你已经在后台管理页面看到"图片生成"菜单但点击显示空白，请按以下步骤修复：

## 🔧 菜单配置修复

### 1. 进入菜单管理

访问：`http://localhost:4091/console` → 登录 → **系统设置** → **菜单管理**

### 2. 编辑"图片生成"菜单

点击"图片生成"菜单的编辑按钮

### 3. 确认配置（关键）

**必须确保以下配置完全正确**：

| 字段 | 配置值 | ⚠️ 注意 |
|------|--------|---------|
| **菜单路径** | `image-generation` | 不要加 `/`前缀 |
| **组件路径** | `/console/image-generation` | 必须以 `/` 开头且完整 |

**常见错误**：
- ❌ 组件路径被截断成 `/console/image-generat`
- ❌ 菜单路径写成 `/image-generation`
- ❌ 组件路径写成 `console/image-generation`

### 4. 保存并刷新

1. 点击"确认"保存
2. 按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac) 强制刷新浏览器
3. 重新点击左侧"图片生成"菜单

## 🎨 开始生成图片

### 文生图示例

1. **输入描述**：
   ```
   一只可爱的橘色小猫坐在窗台上晒太阳，温馨的室内场景
   ```

2. **设置尺寸**：
   - 宽度：1024
   - 高度：1024

3. **点击"开始生成"**

4. **等待10-30秒**

5. **查看并下载结果**

### 图生图示例

1. **点击"添加参考图片"**

2. **输入图片URL**：
   ```
   https://example.com/reference.jpg
   ```

3. **输入修改描述**：
   ```
   改成卡通风格，增加更多细节
   ```

4. **设置尺寸并生成**

## ⚠️ 如果仍然显示空白

### 快速诊断

打开浏览器开发者工具（按F12），查看Console标签：

**1. 如果看到路由错误**：
- 检查菜单配置中的组件路径是否为 `/console/image-generation`
- 确保完整，没有被截断

**2. 如果看到403错误**：
- 确认使用管理员账号登录
- 或在权限管理中分配相应权限

**3. 如果看到网络错误**：
- 检查后端服务是否运行（4090端口）
- 检查环境变量配置

### 终极解决方案

如果以上都不行，直接访问URL：

```
http://localhost:4091/console/image-generation
```

或

```
http://localhost:3000/console/image-generation
```

这样可以绕过菜单配置问题。

## 📋 完整配置示例

如果需要重新创建菜单，完整配置如下：

```
菜单名称: 图片生成
菜单类型: 菜单
父级菜单: 顶级菜单
菜单图标: i-lucide-images
菜单路径: image-generation
组件路径: /console/image-generation
权限编码: [留空]
排序: 0
显示状态: ✅ 启用
```

## 🎯 验证成功

访问页面后，你应该看到：

✅ 页面标题："AI 图片生成"  
✅ 左侧输入区域：
  - 描述提示词输入框
  - 参考图片配置
  - 宽度/高度设置
  - "开始生成"按钮

✅ 右侧展示区域：
  - 生成结果展示
  - 下载按钮
  - 复制链接按钮

## 📞 需要帮助？

如果仍然无法解决，请查看详细文档：

- [完整指南](./IMAGE_GENERATION_COMPLETE_GUIDE.md)
- [最终修复方案](./IMAGE_GENERATION_FINAL_FIX.md)
- [网络问题修复](./IMAGE_GENERATION_NETWORK_FIX.md)
- [使用说明](./IMAGE_GENERATION_USAGE.md)

---

**快速访问地址**：
- 后台管理：http://localhost:4091/console/image-generation
- 用户端：http://localhost:3000/console/image-generation

**现在就开始使用吧！** 🎉
