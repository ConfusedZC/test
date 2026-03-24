import { createBrowserRouter, Outlet, useMatches } from "react-router-dom";

import { AiWorkspacePage } from "../features/ai";
import {
  CostImportRecordsPage,
  DataQualityPage,
  ProductDetailPage,
  ProductListPage,
  TemporaryPricingPage,
} from "../features/product-cost";
import {
  SolutionDetailPage,
  SolutionImportPage,
  SolutionListPage,
  SolutionReviewPage,
} from "../features/solutions";
import { navigationItems } from "../shared/navigation";
import { AppShell } from "../shared/layout/AppShell";
import { DashboardPage } from "./screens/DashboardPage";

type RouteHandle = {
  title: string;
  description?: string;
};

function AppLayout() {
  const matches = useMatches();
  const routeHandles = matches
    .map((match) => match.handle as RouteHandle | undefined)
    .filter(Boolean) as RouteHandle[];
  const activeHandle = routeHandles[routeHandles.length - 1];

  return (
    <AppShell
      navigationItems={navigationItems}
      title={activeHandle?.title ?? "首页"}
      description={activeHandle?.description ?? "商品、方案和 AI 生成的统一后台。"}
    >
      <Outlet />
    </AppShell>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: {
          title: "首页",
          description: "先看待办、最近方案和常用入口。",
        } satisfies RouteHandle,
      },
      {
        path: "catalog",
        element: <ProductListPage />,
        handle: {
          title: "商品与成本 / 商品列表",
          description: "围绕商品对象维护主数据，并快速看到当前成本。",
        } satisfies RouteHandle,
      },
      {
        path: "catalog/imports",
        element: <CostImportRecordsPage />,
        handle: {
          title: "商品与成本 / 成本导入记录",
          description: "查看批次导入结果、失败数和错误报告。",
        } satisfies RouteHandle,
      },
      {
        path: "catalog/issues",
        element: <DataQualityPage />,
        handle: {
          title: "商品与成本 / 异常数据",
          description: "集中处理缺条码、缺成本、重复冲突等历史数据问题。",
        } satisfies RouteHandle,
      },
      {
        path: "catalog/pricing",
        element: <TemporaryPricingPage />,
        handle: {
          title: "商品与成本 / 临时核价",
          description: "只做临时核价和报价，不保存方案。",
        } satisfies RouteHandle,
      },
      {
        path: "catalog/products/:productId",
        element: <ProductDetailPage />,
        handle: {
          title: "商品与成本 / 商品详情",
          description: "在一个页面里看基本信息、别名、图片和成本历史。",
        } satisfies RouteHandle,
      },
      {
        path: "solutions",
        element: <SolutionListPage />,
        handle: {
          title: "方案 / 方案列表",
          description: "查看方案、待确认条数和总成本。",
        } satisfies RouteHandle,
      },
      {
        path: "solutions/import",
        element: <SolutionImportPage />,
        handle: {
          title: "方案 / 导入",
          description: "上传方案文件并跟踪解析状态。",
        } satisfies RouteHandle,
      },
      {
        path: "solutions/review",
        element: <SolutionReviewPage />,
        handle: {
          title: "方案 / 待确认项",
          description: "处理导入和 Agent 产生的待确认匹配。",
        } satisfies RouteHandle,
      },
      {
        path: "solutions/:solutionId",
        element: <SolutionDetailPage />,
        handle: {
          title: "方案 / 详情",
          description: "查看明细、编辑匹配结果并重算。",
        } satisfies RouteHandle,
      },
      {
        path: "ai",
        element: <AiWorkspacePage />,
        handle: {
          title: "AI 生成",
          description: "输入需求，查看建议商品、总成本和风险提示。",
        } satisfies RouteHandle,
      },
    ],
  },
]);
