# 前端单独交接说明

更新日期：2026-03-24

## 1. 交接目标

这份说明只用于把当前项目的 `frontend/` 单独交给别家 AI 或别的团队做前端升级。

目标是：

- 让对方只改前端视觉、布局、页面体验和前端页面层逻辑
- 不碰后端接口、数据库、成本口径、匹配逻辑
- 改完后仍然可以无缝适配当前系统

## 2. 可交付范围

建议只交这些目录和文件：

- [frontend](/Users/zhangchao/Desktop/chaxunxitong/frontend)
- [docs/frontend-structure-plan.md](/Users/zhangchao/Desktop/chaxunxitong/docs/frontend-structure-plan.md)
- [docs/frontend-wireframe-v1.md](/Users/zhangchao/Desktop/chaxunxitong/docs/frontend-wireframe-v1.md)
- [docs/task-frontend-engineer-round-review-fixes.md](/Users/zhangchao/Desktop/chaxunxitong/docs/task-frontend-engineer-round-review-fixes.md)
- [docs/temporary-pricing-wireframe-v1.md](/Users/zhangchao/Desktop/chaxunxitong/docs/temporary-pricing-wireframe-v1.md)

如果对方只做 UI/前端，不建议直接给：

- `backend/` 全量代码
- PostgreSQL 数据库
- `materials/` 里的真实 PPT 素材
- `.env`、token、数据库连接串

## 3. 技术栈和硬约束

前端当前技术栈：

- React 18
- TypeScript
- Vite
- React Router

必须遵守的约束：

1. 不新建独立 demo
2. 直接在当前 `frontend/` 内改
3. 不改后端接口路径
4. 不改现有路由路径
5. 不改当前 fetch/request 方式
6. 不重写业务数据结构
7. 不改成本、匹配、方案、PPT 的业务口径
8. 至少保证 `npm run build` 通过

## 4. 关键入口页面

路由入口在：

- [frontend/src/app/router.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/app/router.tsx)

当前路由：

- `/` 首页
- `/catalog` 商品与成本 / 商品列表
- `/catalog/imports` 成本导入记录
- `/catalog/issues` 异常数据
- `/catalog/pricing` 临时核价
- `/catalog/products/:productId` 商品详情
- `/solutions` 方案列表
- `/solutions/import` 方案导入
- `/solutions/review` 待确认项
- `/solutions/:solutionId` 方案详情
- `/ai` AI 生成

## 5. 哪些页面是真实接口，哪些还是 mock

### 已接真实接口

- `/catalog`
  - 页面：[ProductListPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/ProductListPage.tsx)
  - API：[frontend/src/features/product-cost/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/api.ts)

- `/catalog/products/:productId`
  - 页面：[ProductDetailPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/ProductDetailPage.tsx)
  - API：[frontend/src/features/product-cost/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/api.ts)

- `/catalog/pricing`
  - 页面：[TemporaryPricingPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/TemporaryPricingPage.tsx)
  - API：[frontend/src/features/product-cost/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/api.ts)
  - PPT 面板：[PptGenerationPanel.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/PptGenerationPanel.tsx)
  - PPT API：[pptApi.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/pptApi.ts)

- `/solutions`
  - 页面：[SolutionListPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/SolutionListPage.tsx)
  - API：[frontend/src/features/solutions/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/api.ts)

- `/solutions/:solutionId`
  - 页面：[SolutionDetailPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/SolutionDetailPage.tsx)
  - API：[frontend/src/features/solutions/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/api.ts)
  - 注意：详情页不是完全 mock，但部分编辑动作还没真正闭环

- `/ai`
  - 页面：[AiWorkspacePage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/ai/AiWorkspacePage.tsx)
  - API：[frontend/src/features/ai/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/ai/api.ts)

### 仍然是 mock / 静态原型

- `/catalog/imports`
  - 页面：[CostImportRecordsPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/CostImportRecordsPage.tsx)
  - 依赖：[mock.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/mock.ts)

- `/catalog/issues`
  - 页面：[DataQualityPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/DataQualityPage.tsx)
  - 依赖：[mock.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/mock.ts)

- `/solutions/import`
  - 页面：[SolutionImportPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/SolutionImportPage.tsx)
  - 依赖：[mock.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/mock.ts)

- `/solutions/review`
  - 页面：[SolutionReviewPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/SolutionReviewPage.tsx)
  - 依赖：[mock.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/mock.ts)

### 混合态

- `/`
  - 页面：[DashboardPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/app/screens/DashboardPage.tsx)
  - 结构已成型，但首页摘要和经营数字并不完全来自真实后端接口

## 6. 前端最重要的 API 约束

### 公共请求层

- [frontend/src/shared/api/http.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/shared/api/http.ts)

默认 API base：

- `VITE_API_BASE_URL`
- 未配置时默认 `/api`

### 商品与成本

主要 API 封装：

- [frontend/src/features/product-cost/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/api.ts)

已经依赖的接口包括：

- `GET /api/products`
- `GET /api/products/filter-options`
- `GET /api/products/{productId}`
- `GET /api/products/{productId}/costs/history`
- `POST /api/calculate`
- `POST /api/match/feedback`
- `POST /api/products/{productId}/costs/formal-update`

### PPT

- [frontend/src/features/product-cost/pptApi.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/pptApi.ts)

接口包括：

- `GET /api/ppt/templates`
- `POST /api/ppt/generate-from-pricing`
- `GET /api/ppt/status`

### 方案

- [frontend/src/features/solutions/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/api.ts)

接口包括：

- `GET /api/solutions`
- `GET /api/solutions/{solutionId}`

### AI 生成

- [frontend/src/features/ai/api.ts](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/ai/api.ts)

接口包括：

- `POST /api/agent/generate`

## 7. 重点页面的业务边界

### 临时核价页

页面：

- [TemporaryPricingPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/TemporaryPricingPage.tsx)

这是当前系统最重要的前端业务页之一。外部 AI 可以重做视觉、布局、留白、表格和表单样式，但不要改掉这些核心逻辑：

- 临时核价不是正式方案
- 核价结果可以人工确认绑定商品
- 成本有误可以发起正式成本新增
- 可从当前核价结果发起 PPT 生成
- 页面里的报价点数、利润率、总览统计不能被改口径

### 商品列表 / 商品详情

关键要求：

- 列表和详情要继续兼容 `retail_price / jd_price / display_price / display_price_source`
- 不能把“真实成本”和“零售价参考”展示混成一回事
- 当前商品列表需要展示：
  - 当前成本
  - 某些品牌在当前成本下方显示零售价与折扣关系

### 方案详情

关键要求：

- 可以重做布局和信息层级
- 但不能假装把未接好的编辑动作做成“看起来已生效”的假功能

## 8. 推荐修改范围

建议主要改这些文件：

- [frontend/src/shared/layout/AppShell.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/shared/layout/AppShell.tsx)
- [frontend/src/shared/layout/Sidebar.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/shared/layout/Sidebar.tsx)
- [frontend/src/shared/layout/Topbar.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/shared/layout/Topbar.tsx)
- [frontend/src/styles.css](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/styles.css)
- [frontend/src/app/screens/DashboardPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/app/screens/DashboardPage.tsx)
- [frontend/src/features/product-cost/ProductListPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/ProductListPage.tsx)
- [frontend/src/features/product-cost/ProductDetailPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/ProductDetailPage.tsx)
- [frontend/src/features/product-cost/TemporaryPricingPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/TemporaryPricingPage.tsx)
- [frontend/src/features/product-cost/styles.css](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/product-cost/styles.css)
- [frontend/src/features/solutions/SolutionListPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/SolutionListPage.tsx)
- [frontend/src/features/solutions/SolutionDetailPage.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/features/solutions/SolutionDetailPage.tsx)

## 9. 不建议改的范围

除非明确要补真实接口，否则外部 AI 不要主动修改：

- `frontend/src/shared/api/http.ts`
- `frontend/src/features/product-cost/api.ts`
- `frontend/src/features/solutions/api.ts`
- `frontend/src/features/ai/api.ts`
- `frontend/src/features/product-cost/pptApi.ts`
- `frontend/src/app/router.tsx`

更不要改：

- `backend/`
- `.env`
- PostgreSQL
- 成本计算逻辑
- 商品匹配逻辑

## 10. 如何启动

```bash
cd /Users/zhangchao/Desktop/chaxunxitong/frontend
npm install
npm run dev
```

构建验收：

```bash
cd /Users/zhangchao/Desktop/chaxunxitong/frontend
npm run build
```

如果需要连本地后端，可让后端跑在 `http://127.0.0.1:8000`，前端默认通过 `/api` 反向访问；如果是分离联调，可配置：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## 11. 交付验收标准

外部 AI 的交付至少要满足：

1. `npm run build` 通过
2. 路由路径不变
3. 现有 API 调用不被改坏
4. 首页、商品列表、商品详情、临时核价、方案列表、方案详情的页面质感明显升级
5. 左侧导航折叠态和展开态都像完整设计，而不是压缩版
6. 不引入新的全局状态库
7. 不把 mock 页误包装成“真实已完成页”

## 12. 最推荐的对外协作方式

对外团队如果只做前端，我建议直接给：

1. `frontend/`
2. 本文档
3. [frontend/README.md](/Users/zhangchao/Desktop/chaxunxitong/frontend/README.md)
4. [frontend/src/app/router.tsx](/Users/zhangchao/Desktop/chaxunxitong/frontend/src/app/router.tsx)
5. [docs/frontend-wireframe-v1.md](/Users/zhangchao/Desktop/chaxunxitong/docs/frontend-wireframe-v1.md)
6. [docs/temporary-pricing-wireframe-v1.md](/Users/zhangchao/Desktop/chaxunxitong/docs/temporary-pricing-wireframe-v1.md)

如果需要一句话交接：

“请只在当前 `frontend/` 内做升级，不改后端接口和业务逻辑，保留现有路由和 API 适配，重点提升首页、列表页、详情页和临时核价页的成品感。”
