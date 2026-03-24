import React from "react";
import { Link } from "react-router-dom";

import { fetchSolutionList, type SolutionSummaryRow } from "./api";
import { AppSurface, Badge, Card, Grid, SummaryCard, Table, actionButtonStyle, secondaryButtonStyle, tertiaryButtonStyle } from "./ui";
import { Pagination } from "../../shared/ui/Pagination";
import { StatePanel } from "../../shared/ui/StatePanel";

type FilterState = {
  keyword: string;
  status: string;
  scene: string;
};

const initialFilters: FilterState = {
  keyword: "",
  status: "",
  scene: "",
};

export function SolutionListPage() {
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = React.useState<FilterState>(initialFilters);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(12);
  const [viewportWidth, setViewportWidth] = React.useState(() => {
    if (typeof window === "undefined") {
      return 1440;
    }
    return window.innerWidth;
  });
  const [items, setItems] = React.useState<SolutionSummaryRow[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleResize() {
      setViewportWidth(window.innerWidth);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadSolutions() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchSolutionList(
          {
            page,
            pageSize,
            keyword: appliedFilters.keyword.trim() || undefined,
            status: appliedFilters.status.trim() || undefined,
          },
          controller.signal,
        );

        if (!isActive) {
          return;
        }

        setItems(response.items);
        setTotalCount(response.totalCount);
      } catch (error_) {
        if (!isActive) {
          return;
        }
        setError(error_ instanceof Error ? error_.message : "加载方案列表失败");
        setItems([]);
        setTotalCount(0);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadSolutions();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [appliedFilters, page, pageSize]);

  const scenes = Array.from(new Set(items.map((item) => item.sceneTag))).filter(Boolean);
  const filteredItems = items.filter((item) => {
    return appliedFilters.scene.trim() === "" || item.sceneTag === appliedFilters.scene;
  });

  const summaryItems = filteredItems;
  const totalReviewCount = summaryItems.reduce((sum, item) => sum + item.reviewCount, 0);
  const totalUnresolvedCount = summaryItems.reduce((sum, item) => sum + item.unresolvedCount, 0);
  const totalCost = summaryItems.reduce((sum, item) => sum + parseAmount(item.totalCost), 0);
  const summarySpan = viewportWidth <= 760 ? "span 12" : viewportWidth <= 1180 ? "span 6" : "span 3";
  const listSpan = viewportWidth <= 1180 ? "span 12" : "span 8";
  const sideSpan = viewportWidth <= 1180 ? "span 12" : "span 4";

  function handleSearch() {
    setPage(1);
    setAppliedFilters({ ...draftFilters });
  }

  function handleReset() {
    setDraftFilters({ ...initialFilters });
    setPage(1);
    setAppliedFilters({ ...initialFilters });
  }

  return (
    <AppSurface
      eyebrow="Solution Center"
      title="方案中心"
      subtitle="从真实后端读取方案列表、待确认和总成本，继续向详情页和 AI 生成闭环联调。"
      actions={
        <>
          <Link className="action-button action-button--secondary" to="/solutions/review">
            查看待确认项
          </Link>
          <Link className="action-button" to="/solutions/import">
            上传方案
          </Link>
        </>
      }
    >
      <Grid>
        <div style={{ gridColumn: summarySpan }}>
          <SummaryCard label="方案总数" value={loading ? "..." : String(totalCount)} hint="来自后端列表总数" tone="neutral" />
        </div>
        <div style={{ gridColumn: summarySpan }}>
          <SummaryCard label="待确认" value={loading ? "..." : String(totalReviewCount)} hint="当前筛选结果" tone="warning" />
        </div>
        <div style={{ gridColumn: summarySpan }}>
          <SummaryCard label="未闭环" value={loading ? "..." : String(totalUnresolvedCount)} hint="当前筛选结果" tone="success" />
        </div>
        <div style={{ gridColumn: summarySpan }}>
          <SummaryCard label="总成本" value={loading ? "..." : formatMoney(totalCost)} hint="当前筛选结果" tone="accent" />
        </div>

        <div style={{ gridColumn: listSpan }}>
          <Card
            title="方案列表"
            subtitle="通过关键词、状态和场景筛查方案，列表数据来自 `/api/solutions`。"
            action={<button type="button" style={tertiaryButtonStyle}>导出列表</button>}
          >
            <div style={toolbarStyle}>
              <input
                value={draftFilters.keyword}
                onChange={(event) => setDraftFilters((prev) => ({ ...prev, keyword: event.target.value }))}
                placeholder="搜索方案名称 / 行业 / 负责人"
                style={inputStyle}
              />
              <select
                value={draftFilters.status}
                onChange={(event) => setDraftFilters((prev) => ({ ...prev, status: event.target.value }))}
                style={selectStyle}
              >
                <option value="">全部状态</option>
                <option value="待确认">待确认</option>
                <option value="处理中">处理中</option>
                <option value="已完成">已完成</option>
                <option value="已归档">已归档</option>
              </select>
              <select
                value={draftFilters.scene}
                onChange={(event) => setDraftFilters((prev) => ({ ...prev, scene: event.target.value }))}
                style={selectStyle}
              >
                <option value="">全部场景</option>
                {scenes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button type="button" style={actionButtonStyle} onClick={handleSearch}>
                查询
              </button>
              <button type="button" style={secondaryButtonStyle} onClick={handleReset}>
                重置
              </button>
            </div>

            {loading ? (
              <StatePanel title="正在加载" description="正在从后端读取方案列表。" tone="neutral" />
            ) : error ? (
              <StatePanel
                title="加载失败"
                description={error}
                tone="danger"
                action={
                  <button type="button" style={secondaryButtonStyle} onClick={handleSearch}>
                    重新加载
                  </button>
                }
              />
            ) : filteredItems.length === 0 ? (
              <StatePanel
                title="没有匹配结果"
                description="当前筛选条件下没有找到方案，可以重置筛选或放宽关键词。"
                tone="warning"
                action={
                  <button type="button" style={secondaryButtonStyle} onClick={handleReset}>
                    清空筛选
                  </button>
                }
              />
            ) : (
              <>
                <Table
                  columns={["方案名称", "场景", "行业", "负责人", "商品数", "待确认", "未闭环", "总成本", "状态", "更新时间", "操作"]}
                  rows={filteredItems.map((item) => (
                    <tr key={item.solutionId}>
                      {cell(
                        <div>
                          <div style={{ fontWeight: 700 }}>{item.solutionName}</div>
                          <div style={subTextStyle}>确认数 {item.confirmedCount}</div>
                        </div>,
                      )}
                      {cell(item.sceneTag)}
                      {cell(item.industryTag)}
                      {cell(item.owner)}
                      {cell(String(item.itemCount))}
                      {cell(String(item.reviewCount))}
                      {cell(String(item.unresolvedCount))}
                      {cell(formatMoney(item.totalCost))}
                      {cell(<Badge tone={badgeToneByStatus(item.status)}>{item.status}</Badge>)}
                      {cell(item.updatedAt)}
                      {cell(
                        <div style={rowActionStyle}>
                          <Link className="pc-button pc-button--ghost" to={`/solutions/${item.solutionId}`}>
                            查看
                          </Link>
                          <Link className="pc-button pc-button--secondary" to={`/solutions/${item.solutionId}`}>
                            重算
                          </Link>
                        </div>,
                      )}
                    </tr>
                  ))}
                  emptyText="没有符合条件的方案"
                />
                <div style={{ marginTop: 12, color: "#66736a", fontSize: 13 }}>
                  当前第 {page} 页，筛选结果 {filteredItems.length} 条，后端总数 {totalCount} 条。
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
              </>
            )}
          </Card>
        </div>

        <div style={{ gridColumn: sideSpan }}>
          <Grid gap={16}>
            <div style={{ gridColumn: "span 12" }}>
              <Card title="最近更新" subtitle="先看最近被修改或创建的方案。">
                <div style={sideListStyle}>
                  {(filteredItems.length > 0 ? filteredItems : items).slice(0, 3).map((item) => (
                    <Link key={item.solutionId} to={`/solutions/${item.solutionId}`} style={sideItemStyle}>
                      <div style={sideItemHeaderStyle}>
                        <strong>{item.solutionName}</strong>
                        <Badge tone={badgeToneByStatus(item.status)}>{item.status}</Badge>
                      </div>
                      <div style={sideItemMetaStyle}>
                        {item.sceneTag} · {item.industryTag} · {item.owner}
                      </div>
                      <div style={sideItemSummaryStyle}>
                        商品 {item.itemCount} 条，待确认 {item.reviewCount} 条，未闭环 {item.unresolvedCount} 条。
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            <div style={{ gridColumn: "span 12" }}>
              <Card title="操作建议" subtitle="把高频动作集中在列表页右侧，减少跳转成本。">
                <div style={hintListStyle}>
                  <div style={hintItemStyle}>
                    <strong>优先处理待确认较多的方案</strong>
                    <p style={hintTextStyle}>从列表进入详情后，可以直接查看明细和成本闭环。</p>
                  </div>
                  <div style={hintItemStyle}>
                    <strong>导入记录和错误报告独立追踪</strong>
                    <p style={hintTextStyle}>便于方案工程师和售前快速回看批次问题，而不是在导入页里反复翻找。</p>
                  </div>
                </div>
              </Card>
            </div>
          </Grid>
        </div>
      </Grid>
    </AppSurface>
  );
}

function formatMoney(value: number | string) {
  return Number(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseAmount(value: string) {
  const numeric = Number(value.replace(/,/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
}

function badgeToneByStatus(status: string) {
  if (status === "已完成" || status === "已归档") {
    return "success" as const;
  }

  if (status === "待确认") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function cell(content: React.ReactNode) {
  return <td style={tdStyle}>{content}</td>;
}

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 16,
};

const inputStyle: React.CSSProperties = {
  flex: "1 1 280px",
  minWidth: 0,
  borderRadius: 14,
  border: "1px solid #dbe4ef",
  padding: "12px 14px",
  font: "inherit",
  background: "#fff",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  flex: "1 1 180px",
  appearance: "none",
};

const rowActionStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
};

const sideListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const sideItemStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 14,
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #e5edf6",
  color: "inherit",
};

const sideItemHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
};

const sideItemMetaStyle: React.CSSProperties = {
  color: "#66736a",
  fontSize: 13,
};

const sideItemSummaryStyle: React.CSSProperties = {
  color: "#203126",
  fontSize: 13,
  lineHeight: 1.6,
};

const hintListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const hintItemStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #e5edf6",
};

const hintTextStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#66736a",
  lineHeight: 1.7,
};

const subTextStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#66736a",
  fontSize: 13,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(35,47,28,0.08)",
  whiteSpace: "normal",
  verticalAlign: "top",
};
