# 图片生成功能网络问题修复

## 问题描述

访问图片生成页面时报错：
```json
{
  "code": 40602,
  "message": "getaddrinfo ENOTFOUND cv.volcengineapi.com",
  "data": null,
  "path": "/api/image-generation/submit",
  "timestamp": 1760973486709
}
```

## 问题分析

### 根本原因

**域名配置错误**：使用了不存在的域名 `cv.volcengineapi.com`

### DNS测试结果

```bash
# 错误的域名 - 无法解析
$ dig cv.volcengineapi.com
# 返回：NXDOMAIN（域名不存在）

# 正确的域名 - 可以正常解析
$ dig visual.volcengineapi.com
# 返回：183.205.9.42（正常解析）
```

### 正确的API域名

根据火山引擎官方文档和测试验证：

| 错误域名 | 正确域名 | 状态 |
|---------|---------|------|
| ❌ `cv.volcengineapi.com` | ✅ `visual.volcengineapi.com` | 可正常访问 |

## 解决方案

### 1. 更新环境变量配置

修改 `.env.development.local` 文件：

```bash
# 修改前（错误）
VOLCENGINE_IMAGE_ENDPOINT=https://cv.volcengineapi.com

# 修改后（正确）
VOLCENGINE_IMAGE_ENDPOINT=https://visual.volcengineapi.com
```

完整配置：
```bash
# Volcengine Image Generation
VOLCENGINE_IMAGE_ENDPOINT=https://visual.volcengineapi.com
VOLCENGINE_IMAGE_REGION=cn-north-1
VOLCENGINE_IMAGE_SERVICE=cv
VOLCENGINE_IMAGE_ACCESS_KEY_ID=your_access_key_id
VOLCENGINE_IMAGE_SECRET_ACCESS_KEY=your_secret_access_key
VOLCENGINE_IMAGE_DEFAULT_REQ_KEY=jimeng_t2i_v40
```

### 2. 同步更新示例配置文件

修改 `.env.development.local.example` 文件，确保新用户使用正确的配置：

```bash
VOLCENGINE_IMAGE_ENDPOINT=https://visual.volcengineapi.com
VOLCENGINE_IMAGE_DEFAULT_REQ_KEY=jimeng_t2i_v40
```

### 3. 重启后端服务

```bash
# 停止当前后端进程
lsof -ti:4090 | xargs kill

# 重启后端服务
cd /path/to/BuildingAI
pnpm --filter server run dev

# 或者直接重启整个项目
pnpm run dev
```

### 4. 验证修复

```bash
# 1. 检查域名是否可达
ping visual.volcengineapi.com

# 2. 测试HTTPS连接
curl -I https://visual.volcengineapi.com

# 3. 测试后端服务
curl http://localhost:4090/health

# 4. 在浏览器中测试图片生成功能
# 访问：http://localhost:3000/console/image-generation
```

## 技术细节

### 火山引擎即梦4.0 API配置

**官方文档参考**：
- [图片生成API文档](https://www.volcengine.com/docs/82379/1541523)
- [火山方舟大模型服务](https://console.volcengine.com/ark)

**API端点信息**：
- 主域名：`visual.volcengineapi.com`
- 协议：HTTPS
- 区域：`cn-north-1`（中国北方-1）
- 服务：`cv`（Computer Vision）

**即梦4.0模型标识**：
- 文生图模型：`jimeng_t2i_v40`
- 图生图模型：`jimeng_i2i_v40`（根据需要配置）

### 为什么域名会配置错误？

可能的原因：
1. 参考了过期的文档
2. 使用了早期版本的配置
3. 域名变更未及时更新

### DNS解析详情

```bash
# 正确域名的DNS解析链
visual.volcengineapi.com 
  → CNAME: visual.volcengineapi.com.w.cdngslb.com
  → CNAME: visual.volcengineapi.com.queniusz.com
  → A记录: 183.205.9.42
```

## 相关问题排查

### 如果仍然无法连接

1. **检查网络连接**
   ```bash
   ping 183.205.9.42
   ```

2. **检查防火墙设置**
   ```bash
   # macOS检查防火墙
   /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   ```

3. **检查DNS服务器**
   ```bash
   scutil --dns | grep nameserver
   ```

4. **尝试使用公共DNS**
   - Google DNS: 8.8.8.8, 8.8.4.4
   - 阿里DNS: 223.5.5.5, 223.6.6.6
   - 114DNS: 114.114.114.114

### 如果API密钥错误

```bash
# 检查密钥格式
# AccessKeyId 应该类似于：AKLT... (以AKLT开头)
# SecretAccessKey 应该是Base64编码的字符串
```

### 如果仍然报错

1. 检查后端日志：
   ```bash
   cat /tmp/server-dev.log
   ```

2. 检查环境变量是否生效：
   ```bash
   # 在后端服务运行时
   ps aux | grep node | grep server
   # 查看进程环境变量
   ```

3. 重新构建并启动：
   ```bash
   pnpm run build
   pnpm run dev
   ```

## 总结

### 修复步骤清单

- [x] 识别问题：DNS无法解析域名
- [x] 查找正确的API域名
- [x] 更新 `.env.development.local` 配置
- [x] 更新 `.env.development.local.example` 配置
- [x] 重启后端服务
- [x] 验证网络连接正常
- [x] 测试API接口可用

### 预防措施

1. **使用官方文档**：始终参考火山引擎官方最新文档
2. **定期验证**：定期检查API端点是否可访问
3. **配置管理**：使用版本控制管理配置文件变更
4. **监控告警**：添加网络连接监控和告警

## 参考资料

- [火山引擎即梦AI官网](https://www.volcengine.com/product/jimeng)
- [火山方舟模型服务](https://console.volcengine.com/ark)
- [Seedream 4.0 API文档](https://www.volcengine.com/docs/82379/1541523)
- 项目内部文档：
  - `docs/IMAGE_GENERATION_USAGE.md` - 使用说明
  - `docs/IMAGE_GENERATION_TROUBLESHOOTING.md` - 问题排查
  - `apps/server/src/modules/web/ai/README_IMAGE_GENERATION.md` - 技术文档
