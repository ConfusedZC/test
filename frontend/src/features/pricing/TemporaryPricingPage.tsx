import React from "react";

import { StatePanel } from "../../shared/ui/StatePanel";
import {
  calculateTemporaryPricing,
  confirmTemporaryPricingMatch,
  correctTemporaryPricingMatch,
  searchTemporaryPricingProducts,
  type TemporaryPricingInputRow,
  type TemporaryPricingProductSearchResult,
  type TemporaryPricingResult,
  type TemporaryPricingRow,
  updateTemporaryPricingCost,
} from "./api";
import { DataTable, SectionCard, SummaryPill } from "../product-cost/ui";
import "../product-cost/styles.css";

const SAMPLE_TEXT = [
  "750g 浅香日本扁柏氨基酸洗发水,12,瓶",
  "750g 浅香日本晚樱氨基酸洗发水,12,瓶",
  "500ml 香氛柔顺衣物护理剂,24,瓶",
  "1L 家庭装洗发水,6,瓶",
].join("\n");

type ParsedPricingInput = {
  items: TemporaryPricingInputRow[];
  errors: string[];
};

export function TemporaryPricingPage() {
  const [inputText, setInputText] = React.useState("");
  const [result, setResult] = React.useState<TemporaryPricingResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeRowKey, setActiveRowKey] = React.useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<TemporaryPricingProductSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [confirmingCurrent, setConfirmingCurrent] = React.useState(false);
  const [bindingProductId, setBindingProductId] = React.useState<number | null>(null);
  const [submittingCost, setSubmittingCost] = React.useState(false);
  const [costForm, setCostForm] = React.useState(() => ({
    costPrice: "",
    effectiveDate: todayDateInputValue(),
    supplier: "",
    reason: "",
  }));

  const parsedInput = React.useMemo(() => parsePricingInput(inputText), [inputText]);

  const summary = React.useMemo(() => buildSummary(result?.items ?? []), [result]);
  const topWarnings = result?.warnings ?? [];
  const activeRow = React.useMemo(
    () => result?.items.find((item) => item.rowKey === activeRowKey) ?? null,
    [activeRowKey, result?.items],
  );

  React.useEffect(() => {
    if (!result?.items.length) {
      setActiveRowKey(null);
      return;
    }

    setActiveRowKey((previous) => {
      if (previous && result.items.some((item) => item.rowKey === previous)) {
        return previous;
      }
      return result.items[0]?.rowKey ?? null;
    });
  }, [result]);

  function handleFillSample() {
    setInputText(SAMPLE_TEXT);
    setError(null);
  }

  function handleClear() {
    setInputText("");
    setResult(null);
    setError(null);
    setActiveRowKey(null);
    setSearchKeyword("");
    setSearchResults([]);
    setSearchError(null);
    setFeedbackMessage(null);
  }

  async function runCalculate(items: TemporaryPricingInputRow[]) {
    setLoading(true);
    setError(null);

    try {
      const response = await calculateTemporaryPricing({ items });
      setResult(response);
      setFeedbackMessage(null);
    } catch (error_) {
      setResult(null);
      setError(error_ instanceof Error ? error_.message : "临时核价失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleCalculate() {
    const parsed = parsePricingInput(inputText);
    if (parsed.items.length === 0) {
      setResult(null);
      setError("请先输入至少一行有效清单，例如：名称,数量,单位。");
      return;
    }
    if (parsed.errors.length > 0) {
      setResult(null);
      setError(parsed.errors.join("；"));
      return;
    }

    await runCalculate(parsed.items);
  }

  function handleOpenActions(row: TemporaryPricingRow) {
    setActiveRowKey(row.rowKey);
    setSearchKeyword(row.rawName === "-" ? "" : row.rawName);
    setSearchResults([]);
    setSearchError(null);
    setFeedbackMessage(null);
    setCostForm({
      costPrice: "",
      effectiveDate: todayDateInputValue(),
      supplier: row.supplier === "-" ? "" : row.supplier,
      reason: "",
    });
  }

  async function handleSearchProducts() {
    if (!activeRow) {
      return;
    }
    const keyword = searchKeyword.trim() || activeRow.rawName;
    if (!keyword || keyword === "-") {
      setSearchResults([]);
      setSearchError("请输入商品关键词后再搜索。");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const items = await searchTemporaryPricingProducts(keyword);
      setSearchResults(items);
      if (items.length === 0) {
        setSearchError("没有找到可绑定的商品，请换关键词再试。");
      }
    } catch (error_) {
      setSearchResults([]);
      setSearchError(error_ instanceof Error ? error_.message : "商品搜索失败");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleConfirmCurrentMatch() {
    if (!activeRow || activeRow.candidateProductId == null) {
      return;
    }

    setConfirmingCurrent(true);
    setFeedbackMessage(null);

    try {
      const feedback = await confirmTemporaryPricingMatch(activeRow.rawName, activeRow.candidateProductId);
      await rerunCurrentPricing();
      setFeedbackMessage({
        tone: "success",
        text: `已确认当前匹配${feedback.productStandardName ? `：${feedback.productStandardName}` : ""}`,
      });
    } catch (error_) {
      setFeedbackMessage({
        tone: "danger",
        text: error_ instanceof Error ? error_.message : "确认当前匹配失败",
      });
    } finally {
      setConfirmingCurrent(false);
    }
  }

  async function handleBindProduct(product: TemporaryPricingProductSearchResult) {
    if (!activeRow) {
      return;
    }

    setBindingProductId(product.productId);
    setFeedbackMessage(null);

    try {
      const feedback = await correctTemporaryPricingMatch(activeRow.rawName, product.productId);
      await rerunCurrentPricing();
      setFeedbackMessage({
        tone: "success",
        text: `已绑定商品${feedback.productStandardName ? `：${feedback.productStandardName}` : ""}`,
      });
    } catch (error_) {
      setFeedbackMessage({
        tone: "danger",
        text: error_ instanceof Error ? error_.message : "绑定商品失败",
      });
    } finally {
      setBindingProductId(null);
    }
  }

  async function handleSubmitCostUpdate() {
    if (!activeRow || activeRow.productId == null) {
      setFeedbackMessage({ tone: "danger", text: "当前行还没有正式商品，先完成绑定商品后再修正成本。" });
      return;
    }

    if (!costForm.costPrice.trim() || !costForm.reason.trim()) {
      setFeedbackMessage({ tone: "danger", text: "请填写成本和修正原因后再提交。" });
      return;
    }

    setSubmittingCost(true);
    setFeedbackMessage(null);

    try {
      const mutation = await updateTemporaryPricingCost(activeRow.productId, {
        costPrice: costForm.costPrice,
        effectiveDate: costForm.effectiveDate,
        supplier: costForm.supplier,
        reason: costForm.reason,
      });
      await rerunCurrentPricing();
      setFeedbackMessage({
        tone: "success",
        text: `已新增正式成本记录 #${mutation.costId}，重新核价后已刷新。`,
      });
      setCostForm((previous) => ({
        ...previous,
        costPrice: "",
        reason: "",
      }));
    } catch (error_) {
      setFeedbackMessage({
        tone: "danger",
        text: error_ instanceof Error ? error_.message : "正式成本修正失败",
      });
    } finally {
      setSubmittingCost(false);
    }
  }

  async function rerunCurrentPricing() {
    const parsed = parsePricingInput(inputText);
    if (parsed.items.length === 0 || parsed.errors.length > 0) {
      return;
    }
    await runCalculate(parsed.items);
  }

  return (
    <div className="pc-page">
      <div className="pc-shell">
        <div className="pc-header">
          <div>
            <h1>临时核价</h1>
            <p>本次查询不存储方案，只调用 `/api/calculate` 做临时试算，并明确展示匹配来源、价格来源和待确认状态。</p>
          </div>
          <div className="pc-toolbar">
            <button className="pc-button pc-button--secondary" type="button" onClick={handleFillSample}>
              填充常用清单
            </button>
            <button className="pc-button pc-button--secondary" type="button" onClick={handleClear}>
              清空
            </button>
            <button className="pc-button pc-button--primary" type="button" onClick={handleCalculate} disabled={loading}>
              {loading ? "核价中..." : "开始核价"}
            </button>
          </div>
        </div>

        <div className="pc-hero-mini" style={{ marginBottom: 18 }}>
          <strong>本次查询不存储方案</strong>
          <span>仅用于临时试算价格，不写方案库；模糊匹配、低置信度和无成本结果都会显著提示，不会假装已确认。</span>
        </div>

        <div className="pc-grid-2">
          <SectionCard
            title="输入清单"
            description="按行输入：名称,数量,单位。支持直接从 Excel 或文本里粘贴，逗号和制表符都能识别。"
            action={
              <div className="pc-toolbar" style={{ marginBottom: 0 }}>
                <span className="pc-badge pc-badge--neutral">格式：名称,数量,单位</span>
              </div>
            }
          >
            <div className="pc-filter-panel" style={{ marginBottom: 0 }}>
              <label className="pc-field">
                <span>核价清单</span>
                <textarea
                  className="pc-textarea"
                  value={inputText}
                  onChange={(event) => {
                    setInputText(event.target.value);
                    setError(null);
                  }}
                  placeholder={SAMPLE_TEXT}
                />
              </label>

              <div className="pc-filter-actions">
                <button className="pc-button pc-button--secondary" type="button" onClick={handleFillSample}>
                  填充示例
                </button>
                <button className="pc-button pc-button--secondary" type="button" onClick={handleClear}>
                  清空输入
                </button>
                <button className="pc-button pc-button--primary" type="button" onClick={handleCalculate} disabled={loading}>
                  {loading ? "核价中..." : "发起核价"}
                </button>
              </div>

              <div style={guideRowStyle}>
                <span className="pc-badge pc-badge--neutral">支持 Excel 粘贴</span>
                <span className="pc-badge pc-badge--neutral">支持中文逗号</span>
                <span className="pc-badge pc-badge--neutral">支持制表符</span>
                <span className="pc-badge pc-badge--warning">模糊匹配会待确认</span>
              </div>

              <div style={previewRowStyle}>
                <span>已识别 {parsedInput.items.length} 行</span>
                <span>{parsedInput.errors.length > 0 ? `格式问题 ${parsedInput.errors.length} 行` : "格式检查通过"}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="核价说明" description="先看来源，再看价格，避免把临时试算误当成正式方案。">
            <div className="pc-hero-mini">
              <strong>来源优先级</strong>
              <span>历史映射 / 精确匹配 / 别名匹配可以直接使用；模糊匹配会标记为待确认。</span>
            </div>

            <div className="pc-card" style={{ margin: 0, padding: 18 }}>
              <div className="pc-kv">
                <span>匹配来源</span>
                <strong>历史映射 / 精确匹配 / 别名匹配 / 模糊匹配待确认</strong>
              </div>
              <div className="pc-kv">
                <span>价格来源</span>
                <strong>历史成本 / 手工覆盖成本 / 回退成本 / 暂无成本</strong>
              </div>
              <div className="pc-kv">
                <span>确认状态</span>
                <strong>已确认 / 模糊匹配待确认 / 未匹配</strong>
              </div>
              <div className="pc-kv">
                <span>结果用途</span>
                <strong>仅临时核价，不存储方案</strong>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={sampleLabelStyle}>示例清单</div>
              <pre style={sampleCodeStyle}>{SAMPLE_TEXT}</pre>
            </div>
          </SectionCard>
        </div>

        {error ? (
          <div style={{ marginTop: 18 }}>
            <StatePanel title="核价失败" description={error} tone="danger" />
          </div>
        ) : null}

        {result ? (
          <div style={{ marginTop: 18 }}>
            <SectionCard
              title="价格结果"
              description="结果中明确展示匹配来源、价格来源和确认状态；模糊结果默认会标为待确认。"
              action={<span className="pc-badge pc-badge--accent">本次共 {result.items.length} 行</span>}
            >
              <div className="pc-grid-3" style={summaryGridStyle}>
                <SummaryPill label="试算行数" value={String(result.items.length)} />
                <SummaryPill label="已确认" value={String(summary.confirmed)} />
                <SummaryPill label="待确认" value={String(summary.pending)} />
                <SummaryPill label="未匹配" value={String(summary.unresolved)} />
                <SummaryPill label="总成本" value={result.totalCostText} />
              </div>

              {topWarnings.length > 0 ? (
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <div style={hintLabelStyle}>全局 warnings</div>
                  <div style={chipListStyle}>
                    {topWarnings.map((warning) => (
                      <span key={warning} className="pc-badge pc-badge--warning" title={warning}>
                        {warningLabel(warning)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pc-tableWrap" style={{ marginTop: 18 }}>
                <DataTable
                  columns={["原始名称", "匹配商品", "匹配来源", "价格来源", "确认状态", "数量 / 单位", "单价", "小计", "warnings", "操作"]}
                  rows={result.items.map((item) => [
                    renderNameCell(item),
                    renderMatchedCell(item),
                    renderSourceCell(item.matchSourceLabel, item.matchSourceTone, item.matchSourceHint, item.matchMethod),
                    renderSourceCell(item.priceSourceLabel, item.priceSourceTone, item.priceSourceHint, item.costSource),
                    renderStatusCell(item),
                    renderQuantityCell(item),
                    renderMoneyCell(item.unitCostText),
                    renderMoneyCell(item.subtotalCostText),
                    renderWarningsCell(item.warnings),
                    renderActionCell(item, activeRowKey, handleOpenActions),
                  ])}
                  emptyText="暂无核价结果"
                />
              </div>

              {activeRow ? (
                <div style={actionPanelStyle}>
                  <div style={actionPanelHeaderStyle}>
                    <div>
                      <strong>当前处理：{activeRow.rawName}</strong>
                      <div style={secondaryTextStyle}>
                        当前匹配 {activeRow.matchedProductName} · {activeRow.reviewStatusLabel} · {activeRow.mappingActionLabel}
                      </div>
                    </div>
                    {activeRow.matchLogId ? (
                      <span className="pc-badge pc-badge--neutral">日志 #{activeRow.matchLogId}</span>
                    ) : null}
                  </div>

                  {feedbackMessage ? (
                    <div className={`pc-pricing-feedback pc-pricing-feedback--${feedbackMessage.tone === "success" ? "success" : "danger"}`}>
                      {feedbackMessage.text}
                    </div>
                  ) : null}

                  <div style={actionBlockStyle}>
                    <div style={actionBlockHeaderStyle}>
                      <strong>绑定商品</strong>
                      <span style={secondaryTextStyle}>支持确认当前候选或手动搜索商品后纠正绑定。</span>
                    </div>

                    <div style={compactActionRowStyle}>
                      {activeRow.isReviewRequired && activeRow.candidateProductId != null ? (
                        <button
                          className="pc-button pc-button--primary"
                          type="button"
                          onClick={handleConfirmCurrentMatch}
                          disabled={confirmingCurrent}
                        >
                          {confirmingCurrent ? "确认中..." : "确认当前匹配"}
                        </button>
                      ) : null}

                      <input
                        className="pc-input"
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.target.value)}
                        placeholder="搜索标准名 / 品牌 / 条码"
                        style={{ flex: 1 }}
                      />
                      <button
                        className="pc-button pc-button--secondary"
                        type="button"
                        onClick={handleSearchProducts}
                        disabled={searchLoading}
                      >
                        {searchLoading ? "搜索中..." : "搜索商品"}
                      </button>
                    </div>

                    {searchError ? <div style={dangerHintStyle}>{searchError}</div> : null}

                    {searchResults.length > 0 ? (
                      <div style={searchResultListStyle}>
                        {searchResults.map((product) => (
                          <div key={product.productId} style={searchResultCardStyle}>
                            <div style={cellStackStyle}>
                              <strong style={primaryTextStyle}>{product.standardName}</strong>
                              <span style={secondaryTextStyle}>
                                {product.brandName} · {product.category} · 规格 {product.resolvedSpec}
                              </span>
                              <span style={secondaryTextStyle}>当前成本 {product.currentCostText}</span>
                            </div>
                            <button
                              className="pc-button pc-button--secondary"
                              type="button"
                              onClick={() => handleBindProduct(product)}
                              disabled={bindingProductId === product.productId}
                            >
                              {bindingProductId === product.productId ? "绑定中..." : "绑定该商品"}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div style={actionBlockStyle}>
                    <div style={actionBlockHeaderStyle}>
                      <strong>成本有误</strong>
                      <span style={secondaryTextStyle}>只新增正式成本历史，不覆盖旧记录；提交后重新核价即可生效。</span>
                    </div>

                    <div style={costFormGridStyle}>
                      <label style={fieldStyle}>
                        <span style={fieldLabelStyle}>正式成本</span>
                        <input
                          className="pc-input"
                          inputMode="decimal"
                          value={costForm.costPrice}
                          onChange={(event) => setCostForm((prev) => ({ ...prev, costPrice: event.target.value }))}
                          placeholder="如 12.50"
                        />
                      </label>
                      <label style={fieldStyle}>
                        <span style={fieldLabelStyle}>生效日期</span>
                        <input
                          className="pc-input"
                          type="date"
                          value={costForm.effectiveDate}
                          onChange={(event) => setCostForm((prev) => ({ ...prev, effectiveDate: event.target.value }))}
                        />
                      </label>
                      <label style={fieldStyle}>
                        <span style={fieldLabelStyle}>供应商</span>
                        <input
                          className="pc-input"
                          value={costForm.supplier}
                          onChange={(event) => setCostForm((prev) => ({ ...prev, supplier: event.target.value }))}
                          placeholder="可选"
                        />
                      </label>
                      <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                        <span style={fieldLabelStyle}>修正原因</span>
                        <input
                          className="pc-input"
                          value={costForm.reason}
                          onChange={(event) => setCostForm((prev) => ({ ...prev, reason: event.target.value }))}
                          placeholder="说明为什么需要新增正式成本"
                        />
                      </label>
                    </div>

                    <div style={compactActionRowStyle}>
                      <button
                        className="pc-button pc-button--primary"
                        type="button"
                        onClick={handleSubmitCostUpdate}
                        disabled={submittingCost || activeRow.productId == null}
                      >
                        {submittingCost ? "提交中..." : "新增正式成本"}
                      </button>
                      {activeRow.productId == null ? (
                        <span style={secondaryTextStyle}>当前行还没有正式商品，请先完成绑定。</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </SectionCard>
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <StatePanel
              title="等待核价"
              description="在左侧输入清单并点击开始核价，结果会在这里展示来源、单价、小计、总成本和 warnings。"
              tone="neutral"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function parsePricingInput(text: string): ParsedPricingInput {
  const items: TemporaryPricingInputRow[] = [];
  const errors: string[] = [];

  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .forEach((line, index) => {
      if (!line) {
        return;
      }

      if (line.startsWith("#")) {
        return;
      }

      const normalized = line.replace(/，/g, ",");
      const parts = normalized.includes("\t")
        ? normalized.split(/\t+/).map((part) => part.trim())
        : normalized.split(",").map((part) => part.trim());

      if (parts.length < 3) {
        errors.push(`第 ${index + 1} 行格式不完整：${line}`);
        return;
      }

      const unit = parts.pop()?.trim() ?? "";
      const quantityText = parts.pop()?.trim() ?? "";
      const name = parts.join(normalized.includes("\t") ? "\t" : ",").trim();

      if (!name) {
        errors.push(`第 ${index + 1} 行名称为空：${line}`);
        return;
      }

      const quantity = Number(quantityText.replace(/,/g, ""));
      if (!Number.isFinite(quantity) || quantity <= 0) {
        errors.push(`第 ${index + 1} 行数量无效：${line}`);
        return;
      }

      if (!unit) {
        errors.push(`第 ${index + 1} 行单位为空：${line}`);
        return;
      }

      items.push({ name, quantity, unit });
    });

  return { items, errors };
}

function buildSummary(rows: TemporaryPricingRow[]) {
  return {
    confirmed: rows.filter((row) => row.reviewStatusLabel === "已确认").length,
    pending: rows.filter((row) => row.reviewStatusLabel === "模糊匹配待确认").length,
    unresolved: rows.filter((row) => row.reviewStatusLabel === "未匹配").length,
  };
}

function warningLabel(warning: string) {
  switch (warning) {
    case "product_unresolved":
      return "未匹配";
    case "match_review_required":
      return "匹配待确认";
    case "product_not_found":
      return "商品不存在";
    case "cost_missing":
      return "待补成本";
    case "manual_override_in_effect":
      return "手工覆盖生效";
    case "rollback_record_in_effect":
      return "回退记录生效";
    default:
      return warning;
  }
}

function renderNameCell(row: TemporaryPricingRow) {
  return (
    <div style={cellStackStyle}>
      <strong style={primaryTextStyle}>{row.rawName}</strong>
      <span style={secondaryTextStyle}>数量 {row.quantity} · 单位 {row.unit}</span>
    </div>
  );
}

function renderMatchedCell(row: TemporaryPricingRow) {
  return (
    <div style={cellStackStyle}>
      <strong style={primaryTextStyle}>{row.matchedProductName}</strong>
      <span style={secondaryTextStyle}>产品 ID {row.productId ?? "-"}</span>
      <span style={secondaryTextStyle}>置信度 {row.matchScore}</span>
    </div>
  );
}

function renderSourceCell(label: string, tone: string, hint: string, raw: string) {
  return (
    <div style={cellStackStyle}>
      <span className={`pc-badge pc-badge--${tone}`}>{label}</span>
      <span style={secondaryTextStyle}>{hint}</span>
      {raw ? <span style={tertiaryTextStyle}>方式：{raw}</span> : null}
    </div>
  );
}

function renderStatusCell(row: TemporaryPricingRow) {
  return (
    <div style={cellStackStyle}>
      <span className={`pc-badge pc-badge--${row.reviewStatusTone}`}>{row.reviewStatusLabel}</span>
      <span style={secondaryTextStyle}>{row.reviewStatusHint}</span>
    </div>
  );
}

function renderQuantityCell(row: TemporaryPricingRow) {
  return (
    <div style={cellStackStyle}>
      <strong style={primaryTextStyle}>
        {row.quantity} / {row.unit}
      </strong>
      <span style={secondaryTextStyle}>{row.costEffectiveTime !== "-" ? `生效日 ${row.costEffectiveTime}` : "无生效日"}</span>
    </div>
  );
}

function renderMoneyCell(value: string) {
  return <strong style={moneyTextStyle}>{value}</strong>;
}

function renderWarningsCell(warnings: string[]) {
  if (warnings.length === 0) {
    return <span style={secondaryTextStyle}>-</span>;
  }

  return (
    <div style={warningChipListStyle}>
      {warnings.map((warning) => (
        <span key={warning} className="pc-badge pc-badge--warning" title={warning}>
          {warningLabel(warning)}
        </span>
      ))}
    </div>
  );
}

function renderActionCell(
  row: TemporaryPricingRow,
  activeRowKey: string | null,
  onOpen: (row: TemporaryPricingRow) => void,
) {
  return (
    <button
      className="pc-button pc-button--secondary"
      type="button"
      onClick={() => onOpen(row)}
      style={activeRowKey === row.rowKey ? activeActionButtonStyle : undefined}
    >
      {activeRowKey === row.rowKey ? "处理中" : "处理闭环"}
    </button>
  );
}

function todayDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

const guideRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const previewRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: 12,
  color: "#5f6f83",
  fontSize: 13,
};

const sampleLabelStyle: React.CSSProperties = {
  marginBottom: 8,
  color: "#5f6f83",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.04em",
};

const sampleCodeStyle: React.CSSProperties = {
  margin: 0,
  padding: 14,
  borderRadius: 16,
  background: "rgba(248, 250, 252, 0.95)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  color: "#203126",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const hintLabelStyle: React.CSSProperties = {
  color: "#5f6f83",
  fontSize: 13,
  fontWeight: 700,
};

const chipListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const warningChipListStyle: React.CSSProperties = {
  ...chipListStyle,
  alignItems: "flex-start",
};

const cellStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  minWidth: 0,
};

const primaryTextStyle: React.CSSProperties = {
  lineHeight: 1.45,
};

const secondaryTextStyle: React.CSSProperties = {
  color: "#5f6f83",
  fontSize: 12,
  lineHeight: 1.5,
};

const tertiaryTextStyle: React.CSSProperties = {
  color: "#7c8798",
  fontSize: 12,
  lineHeight: 1.45,
};

const moneyTextStyle: React.CSSProperties = {
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

const actionPanelStyle: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gap: 16,
  paddingTop: 18,
  borderTop: "1px solid rgba(15, 23, 42, 0.08)",
};

const actionPanelHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const actionBlockStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 16,
  borderRadius: 16,
  background: "rgba(248, 250, 252, 0.95)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
};

const actionBlockHeaderStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
};

const compactActionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
};

const searchResultListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const searchResultCardStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: 14,
  borderRadius: 14,
  background: "#fff",
  border: "1px solid rgba(15, 23, 42, 0.08)",
};

const costFormGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const fieldLabelStyle: React.CSSProperties = {
  color: "#5f6f83",
  fontSize: 13,
  fontWeight: 700,
};

const dangerHintStyle: React.CSSProperties = {
  color: "#b42318",
  fontSize: 13,
  lineHeight: 1.5,
};

const activeActionButtonStyle: React.CSSProperties = {
  borderColor: "#0f766e",
};
