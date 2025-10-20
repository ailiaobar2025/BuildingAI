## 1. 实现
- [ ] 1.1 在配置中心新增即梦 API 相关配置（密钥、Region、Service、默认参数）。
- [ ] 1.2 后端实现任务提交接口：封装调用 `CVSync2AsyncSubmitTask`，校验 prompt、image_urls、size/width/height 等参数。
- [ ] 1.3 后端实现任务结果查询：封装调用 `CVSync2AsyncGetResult`，解析图片链接/Base64 与状态。
- [ ] 1.4 增加错误码映射与重试策略，处理审核失败、超限、内部错误等场景。
- [ ] 1.5 集成鉴权签名逻辑，复用或扩展已有火山引擎 SDK/HTTP 客户端。
- [ ] 1.6 编写单元测试与集成测试，覆盖成功、审核未通过、超时重试等关键路径。

## 2. 校验
- [ ] 2.1 通过 `openspec validate add-image-generation-module --strict`。
- [ ] 2.2 通过项目现有 Lint、单元测试、E2E 测试。
