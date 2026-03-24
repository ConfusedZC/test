import React from "react";
import { Link, useParams } from "react-router-dom";

import { fetchProductDetail, type ProductDetailView } from "./api";
import { DataTable, SectionCard } from "./ui";
import { StatePanel } from "../../shared/ui/StatePanel";
import "./styles.css";

export function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.productId);
  const [detail, setDetail] = React.useState<ProductDetailView | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [costHistoryOpen, setCostHistoryOpen] = React.useState(false);

  React.useEffect(() => {
    if (!Number.isFinite(productId)) {
      setLoading(false);
      setError("缺少有效的商品 ID");
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchProductDetail(productId, controller.signal);
        if (!isActive) {
          return;
        }
        setDetail(response);
      } catch (error_) {
        if (!isActive) {
          return;
        }
        setDetail(null);
        setError(error_ instanceof Error ? error_.message : "加载商品详情失败");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [productId, refreshKey]);

  React.useEffect(() => {
    if (!costHistoryOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCostHistoryOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [costHistoryOpen]);

  const costHistoryChart = React.useMemo(
    () => buildCostHistoryChart(detail?.costHistory ?? []),
    [detail?.costHistory],
  );
  const costHistoryLabelIndexes = React.useMemo(
    () => new Set([0, Math.floor((costHistoryChart.points.length - 1) / 2), costHistoryChart.points.length - 1]),
    [costHistoryChart.points.length],
  );

  if (!Number.isFinite(productId)) {
    return (
      <div className="pc-page">
        <div className="pc-shell">
          <StatePanel
            title="参数错误"
            description="当前路由没有带上有效的商品 ID。"
            tone="danger"
            action={
              <Link className="pc-button pc-button--secondary" to="/catalog">
                返回商品列表
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pc-page">
        <div className="pc-shell">
          <StatePanel title="正在加载" description="正在读取商品详情、别名、图片和成本历史。" tone="neutral" />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="pc-page">
        <div className="pc-shell">
          <StatePanel
            title="加载失败"
            description={error ?? "未找到商品详情"}
            tone="danger"
            action={
              <div className="pc-toolbar" style={{ marginBottom: 0 }}>
                <button className="pc-button pc-button--primary" type="button" onClick={() => setRefreshKey((value) => value + 1)}>
                  重新加载
                </button>
                <Link className="pc-button pc-button--secondary" to="/catalog">
                  返回列表
                </Link>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  const hasCurrentCost = detail.currentCostText !== "-";
  const hasReferencePrice = detail.retailPriceText !== "-" || detail.jdPriceText !== "-";
  const priceSummaryCopy = hasCurrentCost
    ? `当前优先展示真实成本；价格口径为${detail.displayPriceSourceLabel}。`
    : hasReferencePrice
      ? "当前没有真实成本，先展示参考零售价 / 京东价供业务参考。"
      : "当前还没有真实成本和参考价格，请继续补齐商品价格信息。";

  return (
    <div className="pc-page">
      <div className="pc-shell">
        <section className="pc-page-hero pc-page-hero--detail">
          <div className="pc-page-hero__copy">
            <div className="pc-page-hero__masthead">
              <span className="pc-page-hero__eyebrow">商品档案</span>
              <span className="pc-page-hero__stamp">Dossier View</span>
            </div>
            <h1>{detail.name}</h1>
            <p>
              {detail.brandName} · {detail.category} · 规格 {detail.spec} · 箱规 {detail.boxSpec} · 价格口径 {detail.displayPriceSourceLabel}
            </p>
            <div className="pc-page-hero__tags">
              <span className="pc-badge pc-badge--accent">{detail.displayPriceSourceLabel}</span>
              <span className="pc-badge pc-badge--neutral">{statusLabel(detail.status)}</span>
              <span className="pc-badge pc-badge--warning">成本记录 {detail.costHistory.length}</span>
            </div>
          </div>
          <div className="pc-page-hero__aside">
            <div className="pc-page-hero__stat">
              <span>真实成本</span>
              <strong>{detail.currentCostText}</strong>
            </div>
            <div className="pc-page-hero__stat">
              <span>零售价</span>
              <strong>{detail.retailPriceText}</strong>
            </div>
            <div className="pc-page-hero__stat">
              <span>京东价</span>
              <strong>{detail.jdPriceText}</strong>
            </div>
          </div>
          <div className="pc-page-hero__actions">
            <Link className="pc-button pc-button--secondary" to="/catalog">
              返回列表
            </Link>
            <button className="pc-button pc-button--primary" type="button" onClick={() => setRefreshKey((value) => value + 1)}>
              刷新数据
            </button>
          </div>
        </section>

        <div className="pc-grid-3 pc-grid-3--heroStats">
          <div className="pc-pill">
            <span>条码</span>
            <strong>{detail.barcode}</strong>
          </div>
          <div className="pc-pill">
            <span>真实成本</span>
            <strong>{detail.currentCostText}</strong>
          </div>
          <div className="pc-pill">
            <span>参考零售价</span>
            <strong>{detail.retailPriceText}</strong>
          </div>
        </div>

        <SectionCard title="商品详情" description="商品主数据、别名、图片和成本历史都来自真实后端。">
          <div className="pc-section-intro">
            <div>
              <strong>商品档案</strong>
              <p>这里集中展示商品主数据、价格口径、别名、图片和成本历史，方便商品与采购快速核查。</p>
            </div>
            <div className="pc-section-intro__meta">
              <span>最新供应商</span>
              <strong>{detail.currentCostSupplier}</strong>
            </div>
          </div>
          <div className="pc-detail-grid">
            <div className="pc-card" style={{ margin: 0 }}>
              <div className="pc-meta-grid">
                <div className="pc-meta">
                  <label>标准名称</label>
                  <strong>{detail.name}</strong>
                </div>
                <div className="pc-meta">
                  <label>规范化名称</label>
                  <strong>{detail.normalizedName}</strong>
                </div>
                <div className="pc-meta">
                  <label>品牌</label>
                  <strong>{detail.brandName}</strong>
                </div>
                <div className="pc-meta">
                  <label>分类</label>
                  <strong>{detail.category}</strong>
                </div>
                <div className="pc-meta">
                  <label>规格</label>
                  <strong>{detail.spec}</strong>
                </div>
                <div className="pc-meta">
                  <label>箱规</label>
                  <strong>{detail.boxSpec}</strong>
                </div>
                <div className="pc-meta">
                  <label>真实成本</label>
                  <strong>{detail.currentCostText}</strong>
                </div>
                <div className="pc-meta">
                  <label>成本生效日</label>
                  <strong>{detail.currentCostEffectiveTime}</strong>
                </div>
                <div className="pc-meta">
                  <label>参考零售价</label>
                  <strong>{detail.retailPriceText}</strong>
                </div>
                <div className="pc-meta">
                  <label>京东价</label>
                  <strong>{detail.jdPriceText}</strong>
                </div>
                <div className="pc-meta">
                  <label>价格口径</label>
                  <strong>{detail.displayPriceSourceLabel}</strong>
                </div>
                <div className="pc-meta">
                  <label>系列</label>
                  <strong>{detail.series}</strong>
                </div>
                <div className="pc-meta">
                  <label>材质</label>
                  <strong>{detail.material}</strong>
                </div>
                <div className="pc-meta">
                  <label>状态</label>
                  <strong>{statusLabel(detail.status)}</strong>
                </div>
                <div className="pc-meta" style={{ gridColumn: "1 / -1" }}>
                  <label>备注</label>
                  <strong>{detail.note}</strong>
                </div>
              </div>
            </div>

            <div className="pc-split">
              <div className="pc-hero-mini">
                <strong>{hasCurrentCost ? "价格概览" : "参考价格概览"}</strong>
                <span>{priceSummaryCopy}</span>
              </div>
              <div className="pc-card" style={{ margin: 0 }}>
                <div className="pc-kv">
                  <span>价格口径</span>
                  <strong>{detail.displayPriceSourceLabel}</strong>
                </div>
                <div className="pc-kv">
                  <span>最新供应商</span>
                  <strong>{detail.currentCostSupplier}</strong>
                </div>
                <div className="pc-kv">
                  <span>别名数</span>
                  <strong>{detail.aliases.length}</strong>
                </div>
                <div className="pc-kv">
                  <span>图片数</span>
                  <strong>{detail.images.length}</strong>
                </div>
                <div className="pc-kv">
                  <span>成本记录</span>
                  <strong>{detail.costHistory.length}</strong>
                </div>
                <div className="pc-kv">
                  <span>最新成本</span>
                  <strong>{detail.currentCostText}</strong>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="pc-grid-2">
          <SectionCard title="别名" description="真实别名来自后端商品主数据。">
            <DataTable
              columns={["别名", "类型", "置信度", "来源", "规范化别名"]}
              rows={detail.aliases.map((alias) => [
                alias.aliasName,
                alias.aliasType,
                alias.confidence,
                alias.source,
                alias.normalizedAliasName,
              ])}
              emptyText="暂无别名"
            />
          </SectionCard>

          <SectionCard title="图片" description="这里先展示图片路径和元数据，后续可继续接对象存储预览。">
            <div className="pc-gallery">
              {detail.images.length > 0 ? (
                detail.images.map((image) => (
                  <div key={image.imageId} className="pc-photo">
                    <strong>{image.isPrimary ? "主图" : `图片 #${image.sortOrder + 1}`}</strong>
                    <span>{image.imagePath}</span>
                    <span>{image.source}</span>
                  </div>
                ))
              ) : (
                <div className="pc-photo" style={{ gridColumn: "1 / -1" }}>
                  暂无图片
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="成本历史"
          description="按时间回溯真实成本；参考零售价和京东价在上方单独展示，不和成本历史混用。"
          action={
            detail.costHistory.length > 0 ? (
              <button className="pc-button pc-button--ghost" type="button" onClick={() => setCostHistoryOpen(true)}>
                查看折线图
              </button>
            ) : null
          }
        >
          <div className="pc-cost-history-panel">
            <div className="pc-hero-mini">
              <strong>{detail.costHistory.length > 0 ? "成本记录已收纳到弹窗中" : "暂无真实成本历史"}</strong>
              <span>
                {detail.costHistory.length > 0
                  ? `当前商品共有 ${detail.costHistory.length} 条真实成本记录，点击右上角按钮查看时间趋势、最高 / 最低成本和明细。`
                  : hasReferencePrice
                    ? "当前没有真实成本历史，但已提供参考零售价 / 京东价，页面仍可用于报价参考。"
                    : "当前还没有真实成本历史和参考价格，建议继续补齐商品价格信息。"}
              </span>
            </div>
            <div className="pc-grid-3">
              <div className="pc-kv">
                <span>记录数</span>
                <strong>{detail.costHistory.length}</strong>
              </div>
              <div className="pc-kv">
                <span>最新成本</span>
                <strong>{detail.currentCostText}</strong>
              </div>
              <div className="pc-kv">
                <span>价格口径</span>
                <strong>{detail.displayPriceSourceLabel}</strong>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {costHistoryOpen ? (
        <div className="pc-modal" role="presentation" onClick={() => setCostHistoryOpen(false)}>
          <div
            className="pc-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pc-cost-history-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pc-modal__header">
              <div>
                <h2 id="pc-cost-history-title">成本趋势</h2>
                <p>
                  {detail.name} · {costHistoryChart.points.length} 条记录
                </p>
              </div>
              <button className="pc-button pc-button--secondary" type="button" onClick={() => setCostHistoryOpen(false)}>
                关闭
              </button>
            </div>

            <div className="pc-cost-chart__summary">
              <div className="pc-pill">
                <span>最新成本</span>
                <strong>{detail.currentCostText}</strong>
              </div>
              <div className="pc-pill">
                <span>最高成本</span>
                <strong>{costHistoryChart.maxText}</strong>
              </div>
              <div className="pc-pill">
                <span>最低成本</span>
                <strong>{costHistoryChart.minText}</strong>
              </div>
              <div className="pc-pill">
                <span>时间范围</span>
                <strong>{costHistoryChart.rangeText}</strong>
              </div>
            </div>

            <div className="pc-cost-chart__wrap">
              {costHistoryChart.points.length > 0 ? (
                <svg className="pc-cost-chart" viewBox="0 0 760 320" role="img" aria-label="成本趋势折线图">
                  <defs>
                    <linearGradient id="pc-cost-chart-line" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(15, 118, 110, 0.26)" />
                      <stop offset="100%" stopColor="rgba(15, 118, 110, 0.02)" />
                    </linearGradient>
                  </defs>

                  {costHistoryChart.gridLines.map((line, index) => (
                    <g key={`${line.label}-${index}`}>
                      <line
                        x1={line.x1}
                        y1={line.y}
                        x2={line.x2}
                        y2={line.y}
                        className={`pc-cost-chart__grid${line.isBaseline ? " pc-cost-chart__grid--baseline" : ""}`}
                      />
                      <text x="16" y={line.y + 4} className="pc-cost-chart__axis-label">
                        {line.label}
                      </text>
                    </g>
                  ))}

                  {costHistoryChart.areaPath ? (
                    <path d={costHistoryChart.areaPath} className="pc-cost-chart__area" />
                  ) : null}
                  <path d={costHistoryChart.linePath} className="pc-cost-chart__line" />

                  {costHistoryChart.points.map((point, index) => (
                    <g key={`${point.label}-${point.value}-${index}`}>
                      <circle cx={point.x} cy={point.y} r="5.5" className="pc-cost-chart__dot" />
                      {costHistoryLabelIndexes.has(index) ? (
                        <text x={point.x} y="300" textAnchor="middle" className="pc-cost-chart__x-label">
                          {point.label}
                        </text>
                      ) : null}
                    </g>
                  ))}
                </svg>
              ) : (
                <div className="pc-empty">暂无成本记录</div>
              )}
            </div>

            <div className="pc-cost-chart__table">
              <DataTable
                columns={["生效时间", "成本", "币种", "供应商", "来源", "备注"]}
                rows={detail.costHistory.map((record) => [
                  record.effectiveTime,
                  record.costText,
                  record.currency,
                  record.supplier,
                  record.source,
                  record.note,
                ])}
                emptyText="暂无成本记录"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "active") {
    return "启用";
  }
  if (status === "draft") {
    return "草稿";
  }
  if (status === "archived") {
    return "归档";
  }
  return status || "-";
}

type CostHistoryChartPoint = {
  label: string;
  value: number;
  x: number;
  y: number;
  effectiveTime: string;
};

type CostHistoryChartGridLine = {
  label: string;
  value: number;
  y: number;
  x1: number;
  x2: number;
  isBaseline: boolean;
};

type CostHistoryChartRecord = {
  costId: number;
  effectiveTime: string;
  amount: number;
  label: string;
};

function parseAmount(value: string) {
  const numeric = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function formatAmount(value: number) {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatChartLabel(value: string) {
  const [datePart] = value.split(" ");
  return datePart || value;
}

function formatChartTickValue(value: number) {
  if (value === 0) {
    return "0";
  }

  if (value >= 100) {
    return value.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
  }

  if (value >= 10) {
    return value.toLocaleString("zh-CN", { maximumFractionDigits: 1 });
  }

  return value.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

function getNiceAxisMax(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  const padded = value * 1.05;
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  const normalized = padded / magnitude;
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 10];
  const niceStep = steps.find((step) => normalized <= step) ?? 10;
  return niceStep * magnitude;
}

function buildCostHistoryChart(records: ProductDetailView["costHistory"]) {
  const normalizedRecords = records
    .map((record): CostHistoryChartRecord | null => {
      const amount = record.amountValue ?? parseAmount(record.costText);
      if (amount === null || amount <= 0) {
        return null;
      }

      return {
        costId: record.costId,
        amount,
        label: formatChartLabel(record.effectiveTime),
        effectiveTime: record.effectiveTime,
      };
    })
    .filter((record): record is CostHistoryChartRecord => record !== null)
    .sort((left, right) => {
      if (left.effectiveTime === right.effectiveTime) {
        return left.costId - right.costId;
      }
      return left.effectiveTime.localeCompare(right.effectiveTime);
    });

  const usableRecords = normalizedRecords.reduce<CostHistoryChartRecord[]>((result, record) => {
    const previous = result[result.length - 1];
    if (previous && previous.effectiveTime === record.effectiveTime) {
      result[result.length - 1] = record;
      return result;
    }
    result.push(record);
    return result;
  }, []);

  if (usableRecords.length === 0) {
    return {
      points: [] as CostHistoryChartPoint[],
      linePath: "",
      areaPath: "",
      gridLines: [] as CostHistoryChartGridLine[],
      maxText: "-",
      minText: "-",
      rangeText: "-",
    };
  }

  const width = 760;
  const height = 320;
  const marginTop = 28;
  const marginRight = 24;
  const marginBottom = 56;
  const marginLeft = 72;
  const chartWidth = width - marginLeft - marginRight;
  const values = usableRecords.map((record) => record.amount);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const axisMin = 0;
  const axisMax = getNiceAxisMax(max);
  const range = axisMax - axisMin || 1;
  const plotTop = marginTop + 8;
  const plotBottom = height - marginBottom - 8;
  const plotHeight = plotBottom - plotTop;
  const first = usableRecords[0]!;
  const last = usableRecords[usableRecords.length - 1]!;

  const points = usableRecords.map((record, index) => {
    const x =
      usableRecords.length === 1
        ? marginLeft + chartWidth / 2
        : marginLeft + (chartWidth * index) / (usableRecords.length - 1);
    const normalized = (record.amount - axisMin) / range;
    const y = plotBottom - normalized * plotHeight;

    return {
      label: record.label,
      value: record.amount,
      x,
      y,
      effectiveTime: record.effectiveTime,
    };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${plotBottom} L ${points[0].x.toFixed(2)} ${plotBottom} Z`
    : "";

  const tickValues = Array.from({ length: 6 }, (_, index) => (axisMax / 5) * index);

  const gridLines = tickValues.map((value) => {
    const normalized = (value - axisMin) / range;
    const y = plotBottom - normalized * plotHeight;
    return {
      label: formatChartTickValue(value),
      value,
      y,
      x1: marginLeft,
      x2: width - marginRight,
      isBaseline: value === 0,
    };
  });

  return {
    points,
    linePath,
    areaPath,
    gridLines,
    maxText: formatAmount(max),
    minText: formatAmount(min),
    rangeText: `${first.label} - ${last.label}`,
  };
}
