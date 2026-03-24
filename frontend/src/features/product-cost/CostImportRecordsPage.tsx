import React from "react";

import { Pagination } from "../../shared/ui/Pagination";
import { importBatchMock } from "./mock";
import { DataTable, SectionCard, SummaryPill, StatusBadge } from "./ui";
import "./styles.css";

export function CostImportRecordsPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const totalCount = importBatchMock.length;
  const pageStart = (page - 1) * pageSize;
  const pagedItems = importBatchMock.slice(pageStart, pageStart + pageSize);

  return (
    <div className="pc-page">
      <div className="pc-shell">
        <div className="pc-header">
          <div>
            <h1>成本导入记录</h1>
            <p>聚合所有成本导入批次，方便回溯成功率、失败原因和错误报告。</p>
          </div>
          <button className="pc-button pc-button--primary">上传导入</button>
        </div>

        <div className="pc-grid-3">
          <SummaryPill label="导入批次" value="18" />
          <SummaryPill label="成功率" value="96.2%" />
          <SummaryPill label="失败报告" value="2" />
        </div>

        <SectionCard title="导入批次" description="按文件、类型和状态查看历史导入。">
          <DataTable
            columns={["批次号", "文件名", "类型", "总数", "成功", "失败", "时间", "状态", "报告"]}
            rows={pagedItems.map((batch) => [
              batch.id,
              batch.fileName,
              batch.importType,
              batch.totalCount,
              batch.successCount,
              batch.failedCount,
              batch.createdAt,
              <StatusBadge key={batch.id} severity={batch.status === "success" ? "low" : batch.status === "warning" ? "medium" : "high"}>
                {batch.status === "success" ? "成功" : batch.status === "warning" ? "部分成功" : "失败"}
              </StatusBadge>,
              <button key={`${batch.id}-report`} className="pc-button pc-button--ghost">
                {batch.reportLabel}
              </button>,
            ])}
          />
          <div style={{ marginTop: 12, color: "#66736a", fontSize: 13 }}>
            当前第 {page} 页，显示 {pagedItems.length} 条，批次总数 {totalCount} 条。
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
