# 图片生成功能测试指南

## 修复内容

已修复火山引擎API签名算法中的日期格式问题：
- ✅ 修正 X-Date 头格式为 `YYYYMMDDTHHmmssZ` （移除所有 `-`、`:` 和毫秒）
- ✅ 确保日期字符串提取正确（前8位 `YYYYMMDD`）
- ✅ 增加详细的签名调试日志

## 测试步骤

### 1. 检查环境变量配置

确保 `.env.development.local` 文件包含以下配置：

```bash
# 火山引擎图片生成配置
VOLCENGINE_IMAGE_ENDPOINT=https://visual.volcengineapi.com
VOLCENGINE_IMAGE_REGION=cn-north-1
VOLCENGINE_IMAGE_SERVICE=cv
VOLCENGINE_IMAGE_ACCESS_KEY_ID=你的AccessKey
VOLCENGINE_IMAGE_SECRET_ACCESS_KEY=你的SecretKey
VOLCENGINE_IMAGE_DEFAULT_REQ_KEY=jimeng_t2i_v40
```

### 2. 登录系统

图片生成接口需要用户认证，请先登录系统：
1. 访问 `http://localhost:4090/console/login`
2. 使用你的账号登录

### 3. 访问图片生成页面

登录后，访问图片生成页面：
- URL: `http://localhost:4090/console/image-generation`

### 4. 测试生成图片

1. 在"描述提示词"输入框中输入内容，例如：
   ```
   一只可爱的小猫在花园里玩耍，阳光明媚，油画风格
   ```

2. （可选）设置图片尺寸：
   - 宽度：1024
   - 高度：1024

3. 点击"开始生成"按钮

### 5. 查看详细日志

如果出现错误，请查看以下日志：

#### 浏览器控制台日志
打开浏览器开发者工具（F12），查看 Console 标签页：
- 应该能看到 `[VolcengineSDK] Submit task request` 日志
- 应该能看到 `[VolcengineSDK] Signing details` 日志
- 如果有错误，会显示详细的错误响应

#### 服务端日志
查看服务端日志：
```bash
tail -100 /tmp/buildingai-dev.log | grep -A 10 "VolcengineSDK\|ImageGenerationService"
```

## 预期结果

### 成功情况
- 提交任务后返回 `taskId`
- 页面显示"生成中..."状态
- 等待一段时间后（通常10-30秒）显示生成的图片
- 可以下载或复制图片链接

### 常见错误及解决方案

#### 1. 返回 401 错误
- **原因**：未登录或token过期
- **解决**：重新登录系统

#### 2. 返回 40602 错误（修复前）
- **原因**：签名验证失败（日期格式错误）
- **解决**：已修复，重启服务器即可

#### 3. 返回 "火山引擎图片生成服务未配置密钥"
- **原因**：环境变量未配置
- **解决**：检查 `.env.development.local` 文件中的密钥配置

#### 4. 返回 "输入内容存在违规，无法处理"
- **原因**：提示词包含敏感内容
- **解决**：修改提示词内容

#### 5. 返回 "调用频率过高，请稍后重试"
- **原因**：API调用频率限制
- **解决**：等待一段时间后重试

## 调试技巧

### 查看签名详情
服务端日志会输出签名详情：
```javascript
[VolcengineSDK] Signing details: {
  datetime: '20251021T020359Z',
  date: '20251021',
  canonicalRequest: 'POST\n/\nAction=CVSync2AsyncSubmitTask&Version=2022-08-31\n...',
  stringToSign: 'HMAC-SHA256\n20251021T020359Z\n20251021/cn-north-1/cv/request\n...'
}
```

### 查看完整请求
服务端日志会输出完整请求：
```javascript
[VolcengineSDK] Submit task request: {
  endpoint: 'https://visual.volcengineapi.com',
  query: { Action: 'CVSync2AsyncSubmitTask', Version: '2022-08-31' },
  body: { req_key: 'jimeng_t2i_v40', prompt: '...' },
  headers: { Authorization: 'HMAC-SHA256 Credential=...', 'X-Date': '...' }
}
```

### 查看API响应
成功响应示例：
```json
{
  "code": 10000,
  "message": "Success",
  "data": {
    "task_id": "7428679467635040276"
  }
}
```

错误响应示例：
```json
{
  "code": 40001,
  "message": "签名验证失败"
}
```

## 参考文档

- 火山引擎视觉智能 API 文档: https://www.volcengine.com/docs/6791/155772
- 签名算法 V4: https://www.volcengine.com/docs/6291/65567
- 即梦 4.0 文生图: https://www.volcengine.com/docs/6791/1383036
