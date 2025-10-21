# 图片生成功能

## 概述

本模块集成了火山引擎即梦4.0 API，提供文生图和图生图功能。

## 功能特性

- ✅ 文生图：根据文本描述生成图片
- ✅ 图生图：基于参考图和文本描述生成图片
- ✅ 异步任务处理：提交任务后可通过任务ID查询结果
- ✅ 完整的参数校验和错误处理
- ✅ 支持自定义图片尺寸、比例等参数
- ✅ 支持水印和内容认证信息

## 配置

在 `.env` 文件中添加以下配置：

```bash
# 火山引擎图片生成服务配置
VOLCENGINE_IMAGE_ENDPOINT=https://cv.volcengineapi.com
VOLCENGINE_IMAGE_REGION=cn-north-1
VOLCENGINE_IMAGE_SERVICE=cv
VOLCENGINE_IMAGE_ACCESS_KEY_ID=your_access_key_id
VOLCENGINE_IMAGE_SECRET_ACCESS_KEY=your_secret_access_key
VOLCENGINE_IMAGE_DEFAULT_REQ_KEY=i2i_general_v3.0
```

## API 接口

### 1. 提交图片生成任务

**接口地址**: `POST /api/image-generation/submit`

**请求参数**:

```typescript
{
  "prompt": string,           // 必填，文本描述，最长800字符
  "imageUrls"?: string[],     // 可选，参考图URL列表，最多10张
  "size"?: number,            // 可选，图片面积（1K-4K分辨率）
  "width"?: number,           // 可选，图片宽度
  "height"?: number,          // 可选，图片高度
  "scale"?: number,           // 可选，缩放比例 0-1
  "forceSingle"?: boolean,    // 可选，是否强制单张输出
  "minRatio"?: number,        // 可选，最小宽高比 1/16-16
  "maxRatio"?: number         // 可选，最大宽高比 1/16-16
}
```

**响应示例**:

```json
{
  "taskId": "xxx-xxx-xxx",
  "raw": { /* 原始响应数据 */ }
}
```

### 2. 查询任务结果

**接口地址**: `POST /api/image-generation/query`

**请求参数**:

```typescript
{
  "taskId": string,              // 必填，任务ID
  "returnUrl"?: boolean,         // 可选，是否返回URL，默认true
  "addLogo"?: boolean,           // 可选，是否添加水印，默认false
  "logoPosition"?: number,       // 可选，水印位置 0-3
  "logoLanguage"?: number,       // 可选，水印语言 0或1
  "logoOpacity"?: number,        // 可选，水印透明度 0-1
  "logoTextContent"?: string,    // 可选，水印文本内容
  "contentProducer"?: string,    // 可选，内容生产者ID
  "producerId"?: string,         // 可选，内容生产者唯一ID
  "contentPropagator"?: string,  // 可选，传播服务商ID
  "propagateId"?: string         // 可选，传播服务商唯一ID
}
```

**响应示例**:

```json
{
  "status": "done",              // 任务状态：in_queue | generating | done | not_found | expired
  "imageUrls": ["url1", "url2"], // 图片URL列表（当status为done时）
  "base64List": [],              // Base64数据列表（如果请求了）
  "raw": { /* 原始响应数据 */ }
}
```

## 任务状态说明

- `in_queue`: 任务排队中
- `generating`: 生成中
- `done`: 生成完成
- `not_found`: 任务不存在
- `expired`: 任务已过期

## 错误处理

服务会自动处理以下错误场景并返回友好的错误提示：

- **输入违规**: 输入内容存在违规，无法处理
- **审核未通过**: 生成内容未通过审核，请调整提示词后重试
- **频率限制**: 调用频率过高，请稍后重试
- **服务错误**: 即梦服务内部错误，请稍后重试

## 使用示例

### 文生图示例

```typescript
// 提交任务
const submitResponse = await fetch('/api/image-generation/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: '一只可爱的小猫在花园里玩耍',
    width: 1024,
    height: 1024
  })
});
const { taskId } = await submitResponse.json();

// 轮询查询结果
const queryResponse = await fetch('/api/image-generation/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ taskId })
});
const result = await queryResponse.json();
```

### 图生图示例

```typescript
const submitResponse = await fetch('/api/image-generation/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: '改成卡通风格',
    imageUrls: ['https://example.com/reference.jpg'],
    width: 1024,
    height: 1024
  })
});
```

## 架构说明

```
Controller (image-generation.controller.ts)
    ↓
Service (image-generation.service.ts)
    ↓
SDK (volcengine/image-generation.sdk.ts)
    ↓
火山引擎即梦 API
```

- **Controller**: 处理HTTP请求，进行参数验证
- **Service**: 业务逻辑层，负责协调SDK调用和错误处理
- **SDK**: 封装火山引擎API调用，包括签名认证和请求构建

## 安全性

- ✅ 密钥在服务器端管理，不会暴露给前端
- ✅ 使用HMAC-SHA256签名认证
- ✅ 完整的输入参数校验
- ✅ 错误信息脱敏处理

## 注意事项

1. 图片生成是异步任务，提交后需要轮询查询结果
2. 建议设置合理的轮询间隔（例如2-5秒）
3. 任务结果有过期时间，请及时获取
4. 注意遵守内容审核规范，避免违规内容
5. 合理控制调用频率，避免触发限流

## 相关文件

- Controller: `apps/server/src/modules/web/ai/controllers/image-generation.controller.ts`
- Service: `apps/server/src/modules/web/ai/services/image-generation.service.ts`
- DTO: `apps/server/src/modules/web/ai/dto/image-generation.dto.ts`
- SDK: `apps/server/src/sdk/ai/volcengine/image-generation.sdk.ts`
- Module: `apps/server/src/modules/web/ai/ai.module.ts`
