# Cost Agent Frontend

当前前端是正式后台的第一版工程骨架。

技术栈约定：

- React 18
- TypeScript
- Vite
- React Router

## 当前结构

- `src/app/`
  - 路由与页面壳子
- `src/shared/`
  - 导航、布局、公共样式
- `src/features/`
  - 业务模块页面

## 当前页面规划

- `/`：首页
- `/catalog`：商品与成本
- `/catalog/imports`：成本导入记录
- `/catalog/issues`：异常数据
- `/catalog/products/:productId`：商品详情
- `/solutions`：方案列表
- `/solutions/import`：方案导入
- `/solutions/review`：待确认项
- `/solutions/:solutionId`：方案详情
- `/ai`：AI 生成

## 当前协作约定

- `src/app/**`：应用壳子、路由、首页
- `src/shared/**`：公共布局和样式
- `src/features/product-cost/**`：商品与成本页面组
- `src/features/solutions/**`：方案页面组
- `src/features/ai/**`：AI 页面组

如果多个开发者并行，请尽量不要跨 feature 修改。
