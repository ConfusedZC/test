import React from "react";

import { solutionReviewItems } from "./mock";
import {
  AppSurface,
  Badge,
  Card,
  DefinitionList,
  Grid,
  SummaryCard,
  actionButtonStyle,
  secondaryButtonStyle,
  Table,
} from "./ui";

export function SolutionReviewPage() {
  const [activeId, setActiveId] = React.useState(solutionReviewItems[0]?.itemId ?? 0);
  const [keyword, setKeyword] = React.useState("");
  const [state, setState] = React.useState("全部");

  const filtered = solutionReviewItems.filter((item) => {
    const text = `${item.rawName} ${item.normalizedName} ${item.sourceSolutionName} ${item.sceneTag}`;
    const matchesKeyword = keyword.trim() === "" || text.includes(keyword.trim());
    const matchesState = state === "全部" || item.state === state;
    return matchesKeyword && matchesState;
  });

  const activeItem = filtered.find((item) => item.itemId === activeId) ?? filtered[0] ?? solutionReviewItems[0];

  const averageScore =
    solutionReviewItems.reduce((sum, item) => sum + item.score, 0) / Math.max(solutionReviewItems.length, 1);

  return (
    <AppSurface
      eyebrow="Solution Review"
      title="待确认项"
      subtitle="把方案导入和 AI 生成过程中置信度不足的条目集中在这里处理，形成正式后台里的人工复核队列。"
      actions={<button type="button" style={secondaryButtonStyle}>批量确认</button>}
    >
      <Grid>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="待确认条目" value={String(solutionReviewItems.length)} hint="当前工作队列" tone="warning" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="高置信候选" value={String(solutionReviewItems.filter((item) => item.score >= 0.85).length)} hint="可优先确认的条目" tone="success" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="平均置信度" value={averageScore.toFixed(2)} hint="用于判断人工复核压力" tone="neutral" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="待处理方案" value={String(new Set(solutionReviewItems.map((item) => item.sourceSolutionName)).size)} hint="涉及的方案批次" tone="accent" />
        </div>

        <div style={{ gridColumn: "span 7" }}>
          <Card title="复核队列" subtitle="按方案和关键词筛选后，逐条确认候选并推动重算。">
            <div style={toolbarStyle}>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索原始名称 / 标准名称 / 方案名称"
                style={inputStyle}
              />
              <select value={state} onChange={(event) => setState(event.target.value)} style={selectStyle}>
                {["全部", "待确认", "已确认", "已忽略"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={queueListStyle}>
              {filtered.map((item) => (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => setActiveId(item.itemId)}
                  style={{
                    ...queueItemStyle,
                    ...(item.itemId === activeItem?.itemId ? activeQueueItemStyle : null),
                  }}
                >
                  <div style={queueItemHeaderStyle}>
                    <div style={queueItemTitleStyle}>{item.rawName}</div>
                    <Badge tone={item.score >= 0.85 ? "success" : item.score >= 0.7 ? "warning" : "neutral"}>
                      {item.score.toFixed(2)}
                    </Badge>
                  </div>
                  <div style={queueItemMetaStyle}>
                    {item.sourceSolutionName} · {item.sceneTag} · {item.quantity}{item.unit}
                  </div>
                  <div style={queueItemFootStyle}>
                    <span>标准化结果：{item.normalizedName}</span>
                    <span>候选数：{item.candidates.length}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ gridColumn: "span 5" }}>
          <Card title="候选详情" subtitle="左侧选择一条记录，右侧显示候选、建议和处理入口。">
            {activeItem ? (
              <>
                <DefinitionList
                  items={[
                    { label: "原始名称", value: activeItem.rawName },
                    { label: "标准化结果", value: activeItem.normalizedName, hint: activeItem.note },
                    { label: "来源方案", value: activeItem.sourceSolutionName },
                    { label: "数量", value: `${activeItem.quantity}${activeItem.unit}` },
                  ]}
                />

                <div style={candidateHeaderStyle}>
                  <strong>候选列表</strong>
                  <span style={candidateHeaderMetaStyle}>按置信度从高到低排序</span>
                </div>

                <div style={candidateListStyle}>
                  {activeItem.candidates.map((candidate) => (
                    <div key={candidate.productId} style={candidateCardStyle}>
                      <div style={candidateTopStyle}>
                        <div>
                          <div style={candidateNameStyle}>{candidate.standardName}</div>
                          <div style={candidateMetaStyle}>{candidate.brandName} · {candidate.matchMethod}</div>
                        </div>
                        <Badge tone={candidate.score >= 0.85 ? "success" : "warning"}>
                          {candidate.score.toFixed(2)}
                        </Badge>
                      </div>
                      <div style={candidateBottomStyle}>
                        <span>建议单价：{candidate.unitCost}</span>
                        <span>产品 ID：{candidate.productId}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={reviewActionStyle}>
                  <button type="button" style={secondaryButtonStyle}>标为已忽略</button>
                  <button type="button" style={secondaryButtonStyle}>改选候选</button>
                  <button type="button" style={actionButtonStyle}>确认并重算</button>
                </div>
              </>
            ) : (
              <div style={emptyStateStyle}>暂无候选条目</div>
            )}
          </Card>
        </div>
      </Grid>

      <div style={{ marginTop: 16 }}>
        <Card title="处理提示" subtitle="把待确认项和原始方案上下文一起看，能更贴近真实业务处理。">
          <Table
            columns={["建议", "适用场景", "说明"]}
            rows={[
              <tr key="1">
                <td style={tdStyle}>优先处理高置信项</td>
                <td style={tdStyle}>数据齐全、品牌清晰的商品</td>
                <td style={tdStyle}>先减少队列长度，再集中处理复杂项。</td>
              </tr>,
              <tr key="2">
                <td style={tdStyle}>保留人工忽略选项</td>
                <td style={tdStyle}>占位名称、测试条目</td>
                <td style={tdStyle}>避免错误商品被强行绑定到方案里。</td>
              </tr>,
            ]}
          />
        </Card>
      </div>
    </AppSurface>
  );
}

const toolbarStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(180px, 0.6fr)",
  gap: 12,
  marginBottom: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid #dbe4ef",
  padding: "12px 14px",
  font: "inherit",
  background: "#fff",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
};

const queueListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const queueItemStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: 16,
  borderRadius: 18,
  border: "1px solid #e5edf6",
  background: "#fff",
  cursor: "pointer",
};

const activeQueueItemStyle: React.CSSProperties = {
  borderColor: "#93c5fd",
  background: "#eff6ff",
};

const queueItemHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
};

const queueItemTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  lineHeight: 1.5,
};

const queueItemMetaStyle: React.CSSProperties = {
  marginTop: 8,
  color: "#667085",
  fontSize: 13,
  lineHeight: 1.7,
};

const queueItemFootStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 10,
  color: "#475569",
  fontSize: 13,
};

const candidateHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 18,
  marginBottom: 12,
};

const candidateHeaderMetaStyle: React.CSSProperties = {
  color: "#667085",
  fontSize: 13,
};

const candidateListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const candidateCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "#fff",
  border: "1px solid #e5edf6",
};

const candidateTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
};

const candidateNameStyle: React.CSSProperties = {
  fontWeight: 800,
};

const candidateMetaStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#667085",
  fontSize: 13,
};

const candidateBottomStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 12,
  color: "#475569",
  fontSize: 13,
};

const reviewActionStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 16,
};

const emptyStateStyle: React.CSSProperties = {
  padding: 24,
  borderRadius: 16,
  border: "1px dashed #dbe4ef",
  color: "#667085",
  textAlign: "center",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #edf2f7",
  whiteSpace: "nowrap",
};
