# 前端旧临时核价实现清理结论

日期：2026-03-23

## 当前结论

- 正式路由 `/catalog/pricing` 当前使用的是 [frontend/src/features/product-cost/TemporaryPricingPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/TemporaryPricingPage.tsx)。
- 旧实现只剩两份文件：
  - [frontend/src/features/pricing/TemporaryPricingPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/pricing/TemporaryPricingPage.tsx)
  - [frontend/src/features/pricing/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/pricing/api.ts)
- 目前没有发现正式路由或其他前端页面继续引用这套旧实现。

## 清理影响评估

- 运行时影响：低  
  现行入口不依赖旧实现，删除后大概率不会影响 `/catalog/pricing` 主流程。

- 协作风险：中  
  旧目录名和现行功能非常接近，容易让后续开发误改错文件；在多人并行开发下，这比“代码体积”更值得优先处理。

- 建议做法：分两步
  1. 先保留文件，但在下一轮明确标记为 legacy 或移出 `src/features` 主路径。
  2. 等团队确认没有隐藏引用后，再正式删除旧实现。

## 本轮建议

- 本轮先不删旧文件，避免和其他开发分支产生不必要冲突。
- 下一轮若要清理，建议同时检查：
  - 是否还有文档或任务书引用旧路径
  - 是否有未合并分支仍基于 `frontend/src/features/pricing/` 开发
