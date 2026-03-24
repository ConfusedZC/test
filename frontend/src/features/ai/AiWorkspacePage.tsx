import React from "react";

import { generateAgentSolution, type AgentFormValues, type AgentGenerateResult } from "./api";
import { AppSurface, Badge, Card, Grid, SummaryCard, Table, actionButtonStyle, secondaryButtonStyle } from "../solutions/ui";
import { StatePanel } from "../../shared/ui/StatePanel";

type RunHistoryItem = AgentGenerateResult & {
  title: string;
  scene: string;
  industry: string;
  updatedAt: string;
};

const initialForm: AgentFormValues = {
  requirement: "给政企客户做一个中小型机房方案，预算 50 万以内，用 H3C 为主，关注稳健和性价比。",
  scene: "机房",
  industry: "政企",
  budgetMin: "300000",
  budgetMax: "500000",
  styleTags: "稳健, 性价比, 高可用",
  specialRequirements: "优先成熟型号，方便快速交付。",
  needPpt: true,
};

export function AiWorkspacePage() {
  const [form, setForm] = React.useState<AgentFormValues>(initialForm);
  const [result, setResult] = React.useState<AgentGenerateResult | null>(null);
  const [history, setHistory] = React.useState<RunHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const response = await generateAgentSolution(form);
      setResult(response);
      const historyItem: RunHistoryItem = {
        ...response,
        title: form.scene.trim() || "未命名方案",
        scene: form.scene.trim() || "-",
        industry: form.industry.trim() || "-",
        updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      };
      setHistory((current) => [historyItem, ...current].slice(0, 5));
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "生成方案失败");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setError(null);
  }

  function restoreRun(item: RunHistoryItem) {
    setResult(item);
    setError(null);
  }

  const itemCount = result?.items.length ?? 0;

  return (
    <AppSurface
      eyebrow="AI Workspace"
      title="AI 生成"
      subtitle="把自然语言需求交给后端 Agent，实时生成方案草案、商品清单和 PPT 任务。"
      actions={
        <>
          <button type="button" style={secondaryButtonStyle} onClick={handleReset}>
            重置示例
          </button>
          <button type="button" style={actionButtonStyle} onClick={handleGenerate} disabled={loading}>
            {loading ? "生成中..." : "生成方案"}
          </button>
        </>
      }
    >
      <Grid>
        <div style={{ gridColumn: "span 4" }}>
          <Card title="需求输入" subtitle="这里直接提交给 `/api/agent/generate`。">
            <div style={formGridStyle}>
              <label style={fieldLabelStyle}>
                场景
                <input
                  className="pc-input"
                  value={form.scene}
                  onChange={(event) => setForm((prev) => ({ ...prev, scene: event.target.value }))}
                  placeholder="例如：机房"
                />
              </label>
              <label style={fieldLabelStyle}>
                行业
                <input
                  className="pc-input"
                  value={form.industry}
                  onChange={(event) => setForm((prev) => ({ ...prev, industry: event.target.value }))}
                  placeholder="例如：政企"
                />
              </label>
              <label style={fieldLabelStyle}>
                预算下限
                <input
                  className="pc-input"
                  value={form.budgetMin}
                  onChange={(event) => setForm((prev) => ({ ...prev, budgetMin: event.target.value }))}
                />
              </label>
              <label style={fieldLabelStyle}>
                预算上限
                <input
                  className="pc-input"
                  value={form.budgetMax}
                  onChange={(event) => setForm((prev) => ({ ...prev, budgetMax: event.target.value }))}
                />
              </label>
              <label style={{ ...fieldLabelStyle, gridColumn: "1 / -1" }}>
                风格标签
                <input
                  className="pc-input"
                  value={form.styleTags}
                  onChange={(event) => setForm((prev) => ({ ...prev, styleTags: event.target.value }))}
                  placeholder="稳健, 性价比, 高可用"
                />
              </label>
              <label style={{ ...fieldLabelStyle, gridColumn: "1 / -1" }}>
                特殊要求
                <textarea
                  className="pc-textarea"
                  value={form.specialRequirements}
                  onChange={(event) => setForm((prev) => ({ ...prev, specialRequirements: event.target.value }))}
                />
              </label>
              <label style={{ ...fieldLabelStyle, gridColumn: "1 / -1" }}>
                需求描述
                <textarea
                  className="pc-textarea"
                  value={form.requirement}
                  onChange={(event) => setForm((prev) => ({ ...prev, requirement: event.target.value }))}
                />
              </label>
              <label style={checkboxStyle}>
                <input
                  type="checkbox"
                  checked={form.needPpt}
                  onChange={(event) => setForm((prev) => ({ ...prev, needPpt: event.target.checked }))}
                />
                生成后同步创建 PPT 任务
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <button type="button" style={actionButtonStyle} onClick={handleGenerate} disabled={loading}>
                {loading ? "生成中..." : "生成方案"}
              </button>
              <button type="button" style={secondaryButtonStyle} onClick={handleReset}>
                重置示例
              </button>
            </div>
          </Card>

          <Card title="最近生成" subtitle="这是本地会话内最近几次生成结果，方便快速回看。">
            {history.length === 0 ? (
              <StatePanel title="暂无记录" description="先生成一次方案，历史记录会自动出现在这里。" tone="warning" />
            ) : (
              <div style={historyListStyle}>
                {history.map((item) => (
                  <button key={`${item.solutionId ?? item.agentCaseId ?? item.updatedAt}`} type="button" style={historyItemStyle} onClick={() => restoreRun(item)}>
                    <div style={historyTopStyle}>
                      <strong>{item.title}</strong>
                      <span style={historyTimeStyle}>{item.updatedAt}</span>
                    </div>
                    <div style={historyMetaStyle}>
                      {item.scene} · {item.industry} · {item.totalCostText}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ gridColumn: "span 8" }}>
          <Card title="生成结果" subtitle="当前结果来自真实后端 Agent。">
            {loading ? (
              <StatePanel title="正在生成" description="Agent 正在组织需求解析、检索、组合和核价。" tone="neutral" />
            ) : error ? (
              <StatePanel title="生成失败" description={error} tone="danger" />
            ) : result ? (
              <div style={resultStackStyle}>
                <Grid gap={14}>
                  <div style={{ gridColumn: "span 3" }}>
                    <SummaryCard label="总成本" value={result.totalCostText} tone="accent" hint="Agent 生成结果" />
                  </div>
                  <div style={{ gridColumn: "span 3" }}>
                    <SummaryCard label="商品数" value={String(itemCount)} tone="neutral" hint="生成明细条数" />
                  </div>
                  <div style={{ gridColumn: "span 3" }}>
                    <SummaryCard
                      label="PPT 任务"
                      value={result.pptTaskId ?? "未创建"}
                      tone={result.pptTaskId ? "success" : "warning"}
                      hint={form.needPpt ? "已请求生成" : "未启用"}
                    />
                  </div>
                  <div style={{ gridColumn: "span 3" }}>
                    <SummaryCard label="风险提示" value={String(result.warnings.length)} tone="warning" hint="需关注事项" />
                  </div>
                </Grid>

                <div style={draftBoxStyle}>
                  <div style={sectionTitleStyle}>方案草案</div>
                  <pre style={draftTextStyle}>{result.draftText}</pre>
                </div>

                <div>
                  <div style={sectionTitleStyle}>商品清单</div>
                  <Table
                    columns={["商品", "商品ID", "数量", "单价", "小计", "匹配方式", "置信度", "供应商"]}
                    rows={result.items.map((item) => (
                      <tr key={`${item.productId ?? item.rawName}-${item.standardName}`}>
                        {cell(
                          <div>
                            <div style={{ fontWeight: 700 }}>{item.standardName}</div>
                            <div style={subTextStyle}>{item.rawName}</div>
                          </div>,
                        )}
                        {cell(item.productId ? `#${item.productId}` : "-")}
                        {cell(item.quantity)}
                        {cell(item.unitCost)}
                        {cell(item.subtotalCost)}
                        {cell(item.matchMethod)}
                        {cell(item.matchScore)}
                        {cell(item.supplier)}
                      </tr>
                    ))}
                    emptyText="暂无商品明细"
                  />
                </div>

                <div>
                  <div style={sectionTitleStyle}>风险提示</div>
                  {result.warnings.length === 0 ? (
                    <StatePanel title="暂无风险" description="这次生成没有返回额外的风险提示。" tone="success" />
                  ) : (
                    <div style={warningListStyle}>
                      {result.warnings.map((warning) => (
                        <Badge key={warning} tone="warning">
                          {warning}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <StatePanel
                title="等待生成"
                description="填写左侧需求后点击生成方案，结果会实时回填到这里。"
                tone="neutral"
              />
            )}
          </Card>
        </div>
      </Grid>
    </AppSurface>
  );
}

function cell(content: React.ReactNode) {
  return <td style={tdStyle}>{content}</td>;
}

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const fieldLabelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#667085",
  fontSize: 13,
  fontWeight: 700,
};

const checkboxStyle: React.CSSProperties = {
  gridColumn: "1 / -1",
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#344054",
  fontSize: 14,
  fontWeight: 600,
};

const historyListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const historyItemStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: 14,
  borderRadius: 16,
  border: "1px solid #e5edf6",
  background: "#fff",
  cursor: "pointer",
};

const historyTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
};

const historyTimeStyle: React.CSSProperties = {
  color: "#66736a",
  fontSize: 12,
};

const historyMetaStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#66736a",
  fontSize: 13,
};

const resultStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 18,
};

const sectionTitleStyle: React.CSSProperties = {
  marginBottom: 10,
  fontSize: 16,
  fontWeight: 800,
};

const draftBoxStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "#f8fbff",
  border: "1px solid #dce4ef",
};

const draftTextStyle: React.CSSProperties = {
  margin: 0,
  whiteSpace: "pre-wrap",
  lineHeight: 1.8,
  color: "#344054",
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  fontSize: 13,
};

const warningListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const subTextStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#66736a",
  fontSize: 12,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(35,47,28,0.08)",
  whiteSpace: "nowrap",
};
