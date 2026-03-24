import React from "react";
import { Link, useParams } from "react-router-dom";

import { fetchSolutionDetail, type SolutionDetailRow, type SolutionDetailView } from "./api";
import {
  AppSurface,
  Badge,
  Card,
  DefinitionList,
  Drawer,
  Grid,
  SummaryCard,
  Table,
  actionButtonStyle,
  secondaryButtonStyle,
} from "./ui";
import { StatePanel } from "../../shared/ui/StatePanel";

export function SolutionDetailPage() {
  const params = useParams();
  const solutionId = Number(params.solutionId);
  const [detail, setDetail] = React.useState<SolutionDetailView | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [activeItemId, setActiveItemId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!Number.isFinite(solutionId)) {
      setLoading(false);
      setError("缺少有效的方案 ID");
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function loadDetail() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchSolutionDetail(solutionId, controller.signal);
        if (!isActive) {
          return;
        }
        setDetail(response);
        setActiveItemId((current) => current ?? response.items[0]?.itemId ?? null);
      } catch (error_) {
        if (!isActive) {
          return;
        }
        setDetail(null);
        setError(error_ instanceof Error ? error_.message : "加载方案详情失败");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [solutionId, refreshKey]);

  if (!Number.isFinite(solutionId)) {
    return (
      <div className="page-grid">
        <StatePanel
          title="参数错误"
          description="当前路由没有带上有效的方案 ID。"
          tone="danger"
          action={
            <Link className="pc-button pc-button--secondary" to="/solutions">
              返回方案列表
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-grid">
        <StatePanel title="正在加载" description="正在读取方案详情和明细。" tone="neutral" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="page-grid">
        <StatePanel
          title="加载失败"
          description={error ?? "未找到方案详情"}
          tone="danger"
          action={
            <div className="pc-toolbar" style={{ marginBottom: 0 }}>
              <button className="pc-button pc-button--primary" type="button" onClick={() => setRefreshKey((value) => value + 1)}>
                重新加载
              </button>
              <Link className="pc-button pc-button--secondary" to="/solutions">
                返回列表
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const selectedItem = detail.items.find((item) => item.itemId === activeItemId) ?? detail.items[0] ?? null;

  return (
    <AppSurface
      eyebrow="Solution Detail"
      title={detail.solutionName}
      subtitle={`${detail.sceneTag} · ${detail.industryTag} · 来源文件 ${detail.sourceFile} · 负责人 ${detail.owner}`}
      actions={
        <>
          <Link className="action-button action-button--secondary" to="/solutions">
            返回列表
          </Link>
          <button type="button" className="action-button" onClick={() => setRefreshKey((value) => value + 1)}>
            刷新数据
          </button>
        </>
      }
    >
      <Grid>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="总成本" value={detail.totalCost} tone="accent" hint="方案整体成本" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="待确认" value={String(detail.reviewCount)} tone="warning" hint="需要人工复核" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="未闭环" value={String(detail.unresolvedCount)} tone="success" hint="未确认或缺成本" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="商品数" value={String(detail.itemCount)} tone="neutral" hint={detail.updatedAt} />
        </div>

        <div style={{ gridColumn: "span 8" }}>
          <Card title="方案明细" subtitle="来自真实后端的方案明细与核价结果。">
            {detail.items.length === 0 ? (
              <StatePanel title="暂无明细" description="这个方案当前还没有任何明细项。" tone="warning" />
            ) : (
              <Table
                columns={["原始名称", "匹配商品", "品牌", "数量", "单位", "单价", "小计", "方式", "状态", "操作"]}
                rows={detail.items.map((item) => (
                  <tr key={item.itemId}>
                    {cell(item.rawName)}
                    {cell(item.matchedProductName)}
                    {cell(item.brandName)}
                    {cell(item.quantity)}
                    {cell(item.unit)}
                    {cell(item.unitCost)}
                    {cell(item.subtotalCost)}
                    {cell(item.matchMethod)}
                    {cell(
                      <Badge tone={item.isConfirmed ? "success" : "warning"}>{item.statusLabel}</Badge>,
                    )}
                    {cell(
                      <button type="button" className="pc-button pc-button--secondary" onClick={() => setActiveItemId(item.itemId)}>
                        查看
                      </button>,
                    )}
                  </tr>
                ))}
              />
            )}
          </Card>
        </div>

        <div style={{ gridColumn: "span 4" }}>
          <Grid gap={16}>
            <div style={{ gridColumn: "span 12" }}>
              <Card title="基础信息" subtitle="方案元信息与统计摘要。">
                <DefinitionList
                  items={[
                    { label: "方案名称", value: detail.solutionName },
                    { label: "场景", value: detail.sceneTag },
                    { label: "行业", value: detail.industryTag },
                    { label: "负责人", value: detail.owner },
                    { label: "来源文件", value: detail.sourceFile },
                    { label: "PPT 模板", value: detail.pptTemplatePath },
                    { label: "创建时间", value: detail.createdAt },
                    { label: "更新时间", value: detail.updatedAt },
                    { label: "状态", value: detail.status },
                    { label: "成本缺失", value: String(detail.costMissingCount) },
                  ]}
                />
              </Card>
            </div>

            <div style={{ gridColumn: "span 12" }}>
              <Drawer
                open={Boolean(selectedItem)}
                title={selectedItem ? `明细：${selectedItem.rawName}` : "明细详情"}
                subtitle="这里先展示真实后端返回的明细状态，后续可再接编辑与重算。"
              >
                {selectedItem ? (
                  <>
                    <div style={drawerMetaStyle}>
                      <div>匹配商品：{selectedItem.matchedProductName}</div>
                      <div>品牌：{selectedItem.brandName}</div>
                      <div>数量：{selectedItem.quantity}</div>
                      <div>单位：{selectedItem.unit}</div>
                      <div>单价：{selectedItem.unitCost}</div>
                      <div>小计：{selectedItem.subtotalCost}</div>
                      <div>匹配方式：{selectedItem.matchMethod}</div>
                      <div>置信度：{selectedItem.matchScore}</div>
                      <div>供应商：{selectedItem.supplier}</div>
                      <div>成本生效时间：{selectedItem.costEffectiveTime}</div>
                    </div>
                    <div style={drawerActionStyle}>
                      <button type="button" style={secondaryButtonStyle}>
                        标记确认
                      </button>
                      <button type="button" style={secondaryButtonStyle}>
                        查看候选
                      </button>
                      <button type="button" style={actionButtonStyle}>
                        保存并重算
                      </button>
                    </div>
                  </>
                ) : null}
              </Drawer>
            </div>
          </Grid>
        </div>
      </Grid>
    </AppSurface>
  );
}

function cell(content: React.ReactNode) {
  return <td style={tdStyle}>{content}</td>;
}

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(35,47,28,0.08)",
  whiteSpace: "nowrap",
};

const drawerMetaStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  color: "#1f2a24",
  lineHeight: 1.7,
};

const drawerActionStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 16,
};

