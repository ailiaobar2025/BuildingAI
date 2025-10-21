# 图片生成模块环境变量检查

## 问题诊断

您遇到了 400 Bad Request 错误，这通常是由于以下原因之一：

1. **API 密钥配置错误**
2. **req_key 配置错误**
3. **请求参数格式问题**

## 必需的环境变量配置

请检查 `.env.development.local` 文件中的以下配置：

```bash
# 火山引擎图片生成配置
VOLCENGINE_IMAGE_ENDPOINT=https://visual.volcengineapi.com
VOLCENGINE_IMAGE_REGION=cn-north-1
VOLCENGINE_IMAGE_SERVICE=cv
VOLCENGINE_IMAGE_ACCESS_KEY_ID=你的AccessKeyId
VOLCENGINE_IMAGE_SECRET_ACCESS_KEY=你的SecretAccessKey
VOLCENGINE_IMAGE_DEFAULT_REQ_KEY=jimeng_t2i_v40
```

## 关键配置项说明

### 1. VOLCENGINE_IMAGE_DEFAULT_REQ_KEY

**即梦 4.0 文生图模型**，正确的值应该是：
- `jimeng_t2i_v40` - 即梦 4.0 文生图模型

**常见错误值：**
- ❌ `i2i_general_v3.0` - 这是图生图模型，不适用于纯文生图
- ❌ 其他过时的 req_key

### 2. 密钥获取方式

1. 登录火山引擎控制台
2. 进入 **视觉智能** > **即梦AI** 服务
3. 获取 Access Key ID 和 Secret Access Key
4. 确保账户已开通即梦 4.0 服务权限

### 3. Endpoint 配置

- **正确值**: `https://visual.volcengineapi.com`
- **错误值**: `https://cv.volcengineapi.com` (旧版本)

## 调试步骤

### 步骤 1: 验证环境变量

```bash
# 查看当前配置（注意不要泄露密钥）
cd /Users/firefly/develop/ailiaobar_projects/BuildingAI
grep VOLCENGINE_IMAGE .env.development.local
```

### 步骤 2: 重启服务

```bash
# 停止当前服务
# 重新启动服务以加载新的环境变量
pnpm dev:server
```

### 步骤 3: 查看详细日志

修改后的代码已经添加了详细的日志输出。当你再次尝试生成图片时，控制台会输出：

```
[VolcengineSDK] Submit task request: {
  endpoint: 'https://visual.volcengineapi.com',
  query: { Action: 'CVSync2AsyncSubmitTask', Version: '2022-08-31' },
  body: { req_key: 'jimeng_t2i_v40', prompt: '...', width: 1024, height: 1024 },
  headers: { ... }
}
```

如果请求失败，还会输出：

```
[VolcengineSDK] API Error Response: {
  status: 400,
  statusText: 'Bad Request',
  data: { /* 火山引擎返回的详细错误信息 */ }
}
```

### 步骤 4: 检查 API 响应

根据火山引擎返回的错误信息，可能的原因包括：

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `SignatureDoesNotMatch` | 签名验证失败 | 检查 Access Key 和 Secret Key 是否正确 |
| `InvalidParameterValue` | 参数值无效 | 检查 req_key 是否正确，确认为 `jimeng_t2i_v40` |
| `InvalidAction` | Action 不存在 | 确认 endpoint 为 `https://visual.volcengineapi.com` |
| `AuthFailure` | 认证失败 | 检查密钥是否有效，账户是否已开通服务 |
| `RequestLimitExceeded` | 请求频率超限 | 等待一段时间后重试 |

## 代码修改说明

我已经对代码进行了以下修改：

1. **修正了默认配置**
   - endpoint: `https://visual.volcengineapi.com`
   - req_key: `jimeng_t2i_v40`

2. **添加了详细日志**
   - 请求前记录完整的请求信息
   - 请求失败时记录详细的错误响应

3. **清理请求参数**
   - 移除所有 `undefined` 的字段
   - 只发送有值的参数

## 测试请求

使用以下 curl 命令测试（替换为你的实际密钥）：

```bash
curl -X POST http://localhost:4090/api/image-generation/submit \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的小猫",
    "width": 1024,
    "height": 1024
  }'
```

## 下一步

1. 确认 `.env.development.local` 中的配置正确
2. 重启服务器
3. 重新尝试生成图片
4. 查看控制台日志中的详细错误信息
5. 如果问题仍然存在，请提供完整的日志输出（记得隐藏敏感信息）
