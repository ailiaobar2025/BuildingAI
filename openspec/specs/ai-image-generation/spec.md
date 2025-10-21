# ai-image-generation Specification

## Purpose
TBD - created by archiving change add-image-generation-module. Update Purpose after archive.
## Requirements
### Requirement: 文生图任务提交
系统 SHALL 提供接口，接收用户的文本 prompt 与可选的生成参数，调用火山引擎即梦4.0 `CVSync2AsyncSubmitTask` 接口创建文生图任务，并返回任务ID。

#### Scenario: 文生图提交成功
- **WHEN** 用户提交合法的 prompt 且未提供参考图
- **THEN** 系统应向火山引擎接口发起请求并获取任务ID
- **AND** 将任务ID 返回给调用方

#### Scenario: 参数校验失败
- **WHEN** 用户提交的 prompt 为空或长度超过限制
- **THEN** 系统应拒绝请求并返回参数错误提示

### Requirement: 图生图任务提交
系统 SHALL 支持携带参考图片 URL 发起图生图任务，并将 image_urls 映射到火山引擎接口，支持最多10张参考图。

#### Scenario: 图生图提交成功
- **WHEN** 用户提供合法的 prompt 与一张参考图像 URL
- **THEN** 系统应调用火山引擎接口并返回任务ID

#### Scenario: 参考图数量超限
- **WHEN** 用户提供超过10张参考图 URL
- **THEN** 系统应拒绝请求并提示超出数量限制

### Requirement: 任务结果查询
系统 SHALL 提供接口查询任务状态与生成结果，调用火山引擎 `CVSync2AsyncGetResult` 接口，返回图片链接或 Base64 数据及状态。

#### Scenario: 任务成功完成
- **WHEN** 调用方查询已完成任务
- **THEN** 系统应返回 status 为 done 的结果及图片 URL 列表

#### Scenario: 任务仍在处理中
- **WHEN** 调用方查询状态为 in_queue 或 generating 的任务
- **THEN** 系统应返回当前状态并建议稍后重试

#### Scenario: 任务失败
- **WHEN** 火山引擎返回审核未通过或内部错误
- **THEN** 系统应返回错误信息并映射到对应的可读提示

### Requirement: 鉴权与安全控制
系统 MUST 在服务器端完成火山引擎 API 鉴权签名与调用，避免泄露密钥，并对输入 prompt、image_urls 执行安全校验。

#### Scenario: 服务端签名调用
- **WHEN** 后端向火山引擎发起请求
- **THEN** 必须携带正确的签名 Header（AccessKey/SecretKey 与 Region=cn-north-1, Service=cv）
- **AND** 不得将密钥暴露给前端

#### Scenario: 输入安全校验
- **WHEN** 用户输入包含敏感词或非法 URL
- **THEN** 系统应拒绝调用并返回安全校验失败提示

