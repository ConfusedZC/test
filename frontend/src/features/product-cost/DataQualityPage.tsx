import React from "react";

import { Pagination } from "../../shared/ui/Pagination";
import { dataIssuesMock } from "./mock";
import { DataTable, SectionCard, SummaryPill, StatusBadge } from "./ui";
import "./styles.css";

export function DataQualityPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const totalCount = dataIssuesMock.length;
  const pageStart = (page - 1) * pageSize;
  const pagedItems = dataIssuesMock.slice(pageStart, pageStart + pageSize);

  return (
    <div className="pc-page">
      <div className="pc-shell">
        <div className="pc-header">
          <div>
            <h1>待补成本 / 异常数据</h1>
            <p>集中处理缺条码、缺成本、重复条码和名称冲突，让主数据更稳定。</p>
          </div>
          <div className="pc-toolbar">
            <button className="pc-button pc-button--secondary">仅看缺条码</button>
            <button className="pc-button pc-button--secondary">仅看缺成本</button>
            <button className="pc-button pc-button--primary">批量处理</button>
          </div>
        </div>

        <div className="pc-grid-3">
          <SummaryPill label="高优先级异常" value="6" />
          <SummaryPill label="中优先级异常" value="8" />
          <SummaryPill label="低优先级异常" value="4" />
        </div>

        <SectionCard title="异常列表" description="优先处理影响匹配和核价的异常项。">
          <DataTable
            columns={["异常项", "商品", "品牌", "分类", "当前成本", "严重级别", "建议操作", "操作"]}
            rows={pagedItems.map((issue) => [
              issue.title,
              issue.productName,
              issue.brand,
              issue.category,
              issue.currentCost,
              <StatusBadge key={issue.id} severity={issue.severity}>
                {issue.severity === "high" ? "高" : issue.severity === "medium" ? "中" : "低"}
              </StatusBadge>,
              issue.suggestedAction,
              <span key={`${issue.id}-actions`} className="pc-toolbar" style={{ margin: 0 }}>
                <button className="pc-button pc-button--ghost">查看详情</button>
                <button className="pc-button pc-button--secondary">标记已处理</button>
              </span>,
            ])}
          />
          <div style={{ marginTop: 12, color: "#66736a", fontSize: 13 }}>
            当前第 {page} 页，显示 {pagedItems.length} 条，异常总数 {totalCount} 条。
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        </SectionCard>
      </div>
    </div>
  );
}
