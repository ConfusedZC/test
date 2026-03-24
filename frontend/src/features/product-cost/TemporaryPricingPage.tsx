import React from "react";

import {
  calculateTemporaryPricing,
  confirmTemporaryPricingMatch,
  correctTemporaryPricingMatch,
  searchTemporaryPricingProducts,
  updateTemporaryPricingCost,
  type ProductListRow,
  type TemporaryPricingInput,
  type TemporaryPricingResult,
  type TemporaryPricingRow,
} from "./api";
import { PptGenerationPanel } from "./PptGenerationPanel";
import { DataTable, SectionCard } from "./ui";
import { StatePanel } from "../../shared/ui/StatePanel";
import "./styles.css";

const DEFAULT_QUOTE_POINTS = "25";

const EXAMPLE_INPUT = [
  "MissLilly蜜斯莉去屑清爽山茶花洗发水248g,1,瓶",
  "MissLilly蜜斯莉庭院栀子花瓣沐浴露258g,1,瓶",
  "蔬果园乌木玫瑰柔护洗衣液袋装500g,2,袋",
].join("\n");

type PricingRowView = {
  rowKey: string;
  base: TemporaryPricingRow;
  manualQuoteInput: string;
  manualQuoteValue: number | null;
  quoteUnitValue: number | null;
  quoteUnitText: string;
  quoteSourceLabel: string;
  quoteSourceHint: string;
  quoteSubtotalValue: number | null;
  quoteSubtotalText: string;
  grossProfitValue: number | null;
  grossProfitText: string;
  profitRateText: string;
  statusTone: "neutral" | "warning" | "danger";
  statusLabel: string;
  costMissing: boolean;
  hasManualQuote: boolean;
};

type OverviewStats = {
  totalCostValue: number | null;
  totalQuoteValue: number | null;
  totalGrossValue: number | null;
  profitRateText: string;
  reviewRequiredCount: number;
  costMissingCount: number;
  manualQuoteCount: number;
  writtenCount: number;
};

type BindDialogState = {
  rowKey: string;
  item: TemporaryPricingRow;
  keyword: string;
  results: ProductListRow[];
  selectedProductId: number | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
};

type CostDialogState = {
  rowKey: string;
  item: TemporaryPricingRow;
  costPrice: string;
  effectiveDate: string;
  supplier: string;
  reason: string;
  submitting: boolean;
  error: string | null;
};

export function TemporaryPricingPage() {
  const [rawInput, setRawInput] = React.useState(EXAMPLE_INPUT);
  const [submittedItems, setSubmittedItems] = React.useState<TemporaryPricingInput[]>([]);
  const [quotePointsInput, setQuotePointsInput] = React.useState(DEFAULT_QUOTE_POINTS);
  const [manualQuoteInputs, setManualQuoteInputs] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [confirmingRowKeys, setConfirmingRowKeys] = React.useState<string[]>([]);
  const [confirmedRowKeys, setConfirmedRowKeys] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TemporaryPricingResult | null>(null);
  const [bindDialog, setBindDialog] = React.useState<BindDialogState | null>(null);
  const [costDialog, setCostDialog] = React.useState<CostDialogState | null>(null);

  const parsedItems = React.useMemo(() => parseTemporaryPricingInput(rawInput), [rawInput]);
  const quotePointsValue = parseNumericInput(quotePointsInput);
  const rowViews = React.useMemo(
    () => buildPricingRowViews(result?.items ?? [], manualQuoteInputs, quotePointsValue, confirmedRowKeys),
    [confirmedRowKeys, manualQuoteInputs, quotePointsValue, result?.items],
  );
  const overview = React.useMemo(() => buildOverview(rowViews), [rowViews]);
  const pptPanelItems = React.useMemo(
    () =>
      rowViews.map((item) => ({
        rawName: item.base.rawName,
        matchedName: item.base.matchedName,
        quantityText: item.base.quantityText,
        costText: item.base.costText,
        quoteText: item.quoteUnitText,
        costSubtotalText: item.base.subtotalText,
        quoteSubtotalText: item.quoteSubtotalText,
        warnings: item.base.warnings,
      })),
    [rowViews],
  );
  const hasDialogOpen = bindDialog !== null || costDialog !== null;

  React.useEffect(() => {
    if (!hasDialogOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBindDialog(null);
        setCostDialog(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [hasDialogOpen]);

  async function handleSubmit() {
    if (parsedItems.length === 0) {
      setError("请至少输入一条商品，格式为 名称,数量,单位。");
      setResult(null);
      return;
    }

    const nextSubmittedItems = parsedItems.map((item) => ({ ...item }));

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const nextResult = await calculateTemporaryPricing(nextSubmittedItems);
      setSubmittedItems(nextSubmittedItems);
      setResult(nextResult);
      setManualQuoteInputs({});
      setConfirmingRowKeys([]);
      setConfirmedRowKeys([]);
      setBindDialog(null);
      setCostDialog(null);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "临时核价失败");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function refreshSubmittedPricing(itemsOverride?: TemporaryPricingInput[]) {
    const activeItems = itemsOverride ?? submittedItems;
    if (activeItems.length === 0) {
      throw new Error("请先提交当前核价清单。");
    }

    const refreshedResult = await calculateTemporaryPricing(activeItems);
    setResult(refreshedResult);
    return refreshedResult;
  }

  async function handleConfirmMatch(rowKey: string, item: TemporaryPricingRow) {
    if (!item.reviewRequired || item.candidateProductId == null) {
      return;
    }

    setConfirmingRowKeys((current) => Array.from(new Set([...current, rowKey])));
    setError(null);
    setSuccessMessage(null);

    try {
      const confirmed = await confirmTemporaryPricingMatch(item.rawName, item.candidateProductId);
      await refreshSubmittedPricing();
      setConfirmedRowKeys((current) => Array.from(new Set([...current, rowKey])));
      setSuccessMessage(
        `已确认“${item.rawName}”当前匹配，并写入对应表${confirmed.productStandardName ? `：${confirmed.productStandardName}` : ""}。`,
      );
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "确认当前匹配失败");
    } finally {
      setConfirmingRowKeys((current) => current.filter((currentKey) => currentKey !== rowKey));
    }
  }

  function handleManualQuoteChange(rowKey: string, nextValue: string) {
    setManualQuoteInputs((current) => {
      if (!nextValue.trim()) {
        const next = { ...current };
        delete next[rowKey];
        return next;
      }
      return {
        ...current,
        [rowKey]: nextValue,
      };
    });
  }

  function openBindDialog(rowKey: string, item: TemporaryPricingRow) {
    const keyword = item.rawName !== "-" ? item.rawName : item.matchedName;
    const selectedProductId = item.productId ?? item.candidateProductId ?? null;
    setBindDialog({
      rowKey,
      item,
      keyword,
      results: [],
      selectedProductId,
      loading: false,
      submitting: false,
      error: null,
    });
    setSuccessMessage(null);
    setError(null);
    void runBindSearch(keyword, selectedProductId);
  }

  async function runBindSearch(keyword: string, preferredProductId?: number | null) {
    const normalizedKeyword = keyword.trim();
    setBindDialog((current) =>
      current
        ? {
            ...current,
            keyword,
            loading: Boolean(normalizedKeyword),
            error: normalizedKeyword ? null : "请输入商品关键词后再搜索。",
            results: normalizedKeyword ? current.results : [],
            selectedProductId: preferredProductId ?? current.selectedProductId,
          }
        : current,
    );

    if (!normalizedKeyword) {
      return;
    }

    try {
      const results = await searchTemporaryPricingProducts(normalizedKeyword);
      setBindDialog((current) => {
        if (!current) {
          return current;
        }

        const fallbackProductId =
          results.length === 0
            ? null
            : results.find((product) => product.productId === (preferredProductId ?? current.selectedProductId))?.productId ??
              preferredProductId ??
              current.selectedProductId ??
              results[0]?.productId ??
              null;

        return {
          ...current,
          loading: false,
          results,
          selectedProductId: fallbackProductId,
          error: null,
        };
      });
    } catch (error_) {
      setBindDialog((current) =>
        current
          ? {
              ...current,
              loading: false,
              error: error_ instanceof Error ? error_.message : "搜索商品失败",
            }
          : current,
      );
    }
  }

  async function handleBindConfirm() {
    if (!bindDialog || bindDialog.selectedProductId == null) {
      setBindDialog((current) =>
        current
          ? {
              ...current,
              error: "请先搜索并选择一个标准商品。",
            }
          : current,
      );
      return;
    }

    const currentDialog = bindDialog;
    const selectedProductId = currentDialog.selectedProductId;
    if (selectedProductId == null) {
      setBindDialog({
        ...currentDialog,
        error: "请先选择一个标准商品。",
      });
      return;
    }
    setBindDialog({
      ...currentDialog,
      submitting: true,
      error: null,
    });
    setError(null);
    setSuccessMessage(null);

    try {
      const corrected = await correctTemporaryPricingMatch(currentDialog.item.rawName, selectedProductId);
      await refreshSubmittedPricing();
      setConfirmedRowKeys((current) => Array.from(new Set([...current, currentDialog.rowKey])));
      setBindDialog(null);
      setSuccessMessage(
        `已将“${currentDialog.item.rawName}”绑定到商品${corrected.productStandardName ? `：${corrected.productStandardName}` : ""}，并已重跑当前核价。`,
      );
    } catch (error_) {
      setBindDialog((current) =>
        current
          ? {
              ...current,
              submitting: false,
              error: error_ instanceof Error ? error_.message : "绑定商品失败",
            }
          : current,
      );
    }
  }

  function openCostDialog(rowKey: string, item: TemporaryPricingRow) {
    if (item.productId == null) {
      return;
    }

    setCostDialog({
      rowKey,
      item,
      costPrice: item.costValue == null ? "" : item.costValue.toFixed(2),
      effectiveDate: item.costEffectiveDate !== "-" ? item.costEffectiveDate : formatToday(),
      supplier: "",
      reason: "",
      submitting: false,
      error: null,
    });
    setSuccessMessage(null);
    setError(null);
  }

  function updateCostDialogField(field: "costPrice" | "effectiveDate" | "supplier" | "reason", value: string) {
    setCostDialog((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  }

  async function handleCostSubmit() {
    if (!costDialog || costDialog.item.productId == null) {
      return;
    }

    const currentDialog = costDialog;
    const productId = currentDialog.item.productId;
    if (productId == null) {
      return;
    }
    if (!currentDialog.costPrice.trim() || !currentDialog.effectiveDate.trim() || !currentDialog.reason.trim()) {
      setCostDialog({
        ...currentDialog,
        error: "请填写正式成本、生效日期和原因。",
      });
      return;
    }

    setCostDialog({
      ...currentDialog,
      submitting: true,
      error: null,
    });
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await updateTemporaryPricingCost(productId, {
        costPrice: currentDialog.costPrice,
        effectiveDate: currentDialog.effectiveDate,
        supplier: currentDialog.supplier,
        reason: currentDialog.reason,
      });
      await refreshSubmittedPricing();
      setCostDialog(null);
      setSuccessMessage(
        `已提交“${currentDialog.item.matchedName}”的正式成本修正，并已重跑当前核价${updated.warnings.length > 0 ? `（${updated.warnings.join("、")}）` : ""}。`,
      );
    } catch (error_) {
      setCostDialog((current) =>
        current
          ? {
              ...current,
              submitting: false,
              error: error_ instanceof Error ? error_.message : "提交成本修正失败",
            }
          : current,
      );
    }
  }

  return (
    <div className="pc-page">
      <div className="pc-shell">
        <div className="pc-header pc-pricing-header">
          <div className="pc-pricing-header__copy">
            <span className="pc-pricing-header__eyebrow">临时核价工作台</span>
            <h1>临时核价</h1>
            <p>本页只做临时报价和核价，不保存方案。默认按顶部报价点数生成报价，逐行手动填写会覆盖自动报价。</p>
            <div className="pc-pricing-header__tags">
              <span className="pc-badge pc-badge--accent">不保存方案</span>
              <span className="pc-badge pc-badge--neutral">真实成本优先</span>
              <span className="pc-badge pc-badge--warning">可人工确认匹配</span>
            </div>
          </div>
          <div className="pc-pricing-header__panel">
            <div className="pc-pricing-header__stat">
              <span>当前输入行数</span>
              <strong>{String(parsedItems.length)}</strong>
            </div>
            <div className="pc-pricing-header__stat">
              <span>核价结果行数</span>
              <strong>{String(result?.items.length ?? 0)}</strong>
            </div>
            <div className="pc-pricing-header__stat">
              <span>默认报价点数</span>
              <strong>{formatPercent(quotePointsValue)}</strong>
            </div>
          </div>
        </div>

        <div className="pc-pricing-feedback-stack">
          {successMessage ? <div className="pc-pricing-feedback pc-pricing-feedback--success">{successMessage}</div> : null}
          {error ? <div className="pc-pricing-feedback pc-pricing-feedback--danger">{error}</div> : null}
        </div>

        <div className="pc-grid-2">
          <SectionCard
            title="输入清单"
            description="每行一条，支持格式：名称,数量,单位。适合直接粘贴你常用的临时报价清单。"
            action={
              <div className="pc-pricing-toolbar">
                <label className="pc-field pc-pricing-points">
                  <span>报价点数</span>
                  <div className="pc-pricing-points__input">
                    <input
                      className="pc-input"
                      inputMode="decimal"
                      value={quotePointsInput}
                      onChange={(event) => setQuotePointsInput(event.target.value)}
                    />
                    <strong>%</strong>
                  </div>
                </label>
                <button className="pc-button pc-button--secondary" type="button" onClick={() => setRawInput(EXAMPLE_INPUT)}>
                  填充示例
                </button>
                <button className="pc-button pc-button--secondary" type="button" onClick={() => setRawInput("")}>
                  清空
                </button>
                <button className="pc-button pc-button--primary" type="button" onClick={handleSubmit} disabled={loading}>
                  {loading ? "核价中..." : "开始核价"}
                </button>
              </div>
            }
          >
            <div className="pc-pricing-inputShell">
              <div className="pc-pricing-note">
                <strong>页面规则</strong>
                <ul>
                  <li>默认报价 = 真实成本 × (1 + 报价点数 / 100)。</li>
                  <li>手动填写报价后，优先级高于顶部点数自动生成。</li>
                  <li>本页不保存方案；确认当前匹配、绑定商品和成本修正只会沉淀真实业务数据。</li>
                </ul>
              </div>
              <div className="pc-pricing-inputPanel">
                <label className="pc-field">
                  <span>商品清单</span>
                  <textarea
                    className="pc-textarea pc-pricing-textarea"
                    value={rawInput}
                    onChange={(event) => setRawInput(event.target.value)}
                    placeholder="例如：柏缇身体乳200g,2,瓶"
                  />
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="核价总览" description="总览固定看真实成本、报价、毛利和异常项，成功提示不会覆盖这块。">
            {loading ? (
              <StatePanel title="正在核价" description="正在调用 /api/calculate，计算真实成本并生成默认报价。" tone="neutral" />
            ) : result ? (
              <div className="pc-pricing-overview">
                <div className="pc-pricing-overview__headline">
                  <div>
                    <span>当前报价点数</span>
                    <strong>{formatPercent(quotePointsValue)}</strong>
                  </div>
                  <p>默认报价按当前点数自动生成，手动填写报价优先级更高。绑定商品、修正成本后会自动重跑当前核价。</p>
                </div>
                <div className="pc-pricing-summary-grid">
                  <SummaryStat label="总成本" value={formatCurrency(overview.totalCostValue)} />
                  <SummaryStat label="总报价" value={formatCurrency(overview.totalQuoteValue)} />
                  <SummaryStat label="总毛利" value={formatCurrency(overview.totalGrossValue)} />
                  <SummaryStat label="利润率" value={overview.profitRateText} />
                  <SummaryStat label="待人工确认" value={String(overview.reviewRequiredCount)} />
                  <SummaryStat label="缺少真实成本" value={String(overview.costMissingCount)} />
                  <SummaryStat label="手动报价项" value={String(overview.manualQuoteCount)} />
                  <SummaryStat label="已写入对应表" value={String(overview.writtenCount)} />
                </div>
              </div>
            ) : (
              <StatePanel title="等待核价" description="输入商品清单并开始核价后，这里会显示总成本、总报价和毛利汇总。" tone="neutral" />
            )}
          </SectionCard>
        </div>

        {result ? (
          <div className="pc-pricing-commandBar">
            <div className="pc-pricing-commandBar__copy">
              <span>报价控制台</span>
              <strong>先确认匹配与真实成本，再决定是否手动报价或生成 PPT。</strong>
            </div>
            <div className="pc-pricing-commandBar__metrics">
              <span>结果 {result.items.length} 行</span>
              <span>待确认 {overview.reviewRequiredCount}</span>
              <span>缺成本 {overview.costMissingCount}</span>
            </div>
          </div>
        ) : null}

        <SectionCard
          title="核价结果"
          description="每行都区分真实成本、默认/手动报价来源、报价小计和利润摘要，并保留人工确认、绑定商品和成本修正入口。"
        >
          {result ? (
            <div className="pc-pricing-resultMeta">
              <span>结果共 {result.items.length} 行</span>
              <span>报价点数 {formatPercent(quotePointsValue)}</span>
              <span>手动报价 {overview.manualQuoteCount} 项</span>
            </div>
          ) : null}
          {result ? (
            <div className="pc-pricing-resultsWrap">
              <DataTable
                columns={["输入商品", "匹配结果", "匹配来源", "真实成本", "报价", "数量", "成本小计", "报价小计", "利润摘要", "状态", "操作"]}
                rows={rowViews.map((item) => [
                  <div className="pc-pricing-cell pc-pricing-cell--raw" key={`${item.rowKey}-raw`}>
                    <strong>{item.base.rawName}</strong>
                  </div>,
                  <div className="pc-pricing-cell pc-pricing-cell--matched" key={`${item.rowKey}-matched`}>
                    <strong>{item.base.matchedName}</strong>
                    <span>{item.base.matchMethod}</span>
                  </div>,
                  <div className="pc-pricing-cell pc-pricing-cell--source" key={`${item.rowKey}-source`}>
                    <strong>{item.base.matchSourceLabel}</strong>
                    <span>{item.base.mappingActionLabel}</span>
                    {item.base.matchLogId ? <span>日志 #{item.base.matchLogId}</span> : null}
                  </div>,
                  <div className="pc-pricing-cell pc-pricing-cell--cost" key={`${item.rowKey}-cost`}>
                    <strong>{item.base.costText}</strong>
                    <span>{item.base.costSourceLabel}</span>
                    {item.base.costEffectiveDate !== "-" ? <span>成本生效日 {item.base.costEffectiveDate}</span> : null}
                  </div>,
                  <div className="pc-pricing-cell pc-pricing-cell--quote" key={`${item.rowKey}-quote`}>
                    <label className="pc-pricing-quote-input">
                      <span>报价</span>
                      <div className="pc-pricing-quote-input__field">
                        <span>¥</span>
                        <input
                          className="pc-input"
                          inputMode="decimal"
                          value={item.manualQuoteInput}
                          onChange={(event) => handleManualQuoteChange(item.rowKey, event.target.value)}
                          placeholder={item.base.costValue == null ? "手动报价" : item.quoteUnitText.replace(/^¥/, "")}
                        />
                      </div>
                    </label>
                    <span>{item.quoteSourceLabel}</span>
                    <span>{item.quoteSourceHint}</span>
                  </div>,
                  <div className="pc-pricing-cell pc-pricing-cell--qty" key={`${item.rowKey}-qty`}>
                    <strong>{item.base.quantityText}</strong>
                  </div>,
                  <div className="pc-pricing-cell pc-pricing-cell--cost-subtotal" key={`${item.rowKey}-cost-subtotal`}>
                    <strong>{item.base.subtotalText}</strong>
                  </div>,
                  <div className="pc-pricing-cell pc-pricing-cell--quote-subtotal" key={`${item.rowKey}-quote-subtotal`}>
                    <strong>{item.quoteSubtotalText}</strong>
                    <span>{item.hasManualQuote ? "手动报价小计" : "默认报价小计"}</span>
                  </div>,
                  <div className="pc-pricing-cell pc-pricing-cell--gross" key={`${item.rowKey}-gross`}>
                    <strong>{item.grossProfitText}</strong>
                    <span>{item.profitRateText}</span>
                  </div>,
                  <div className="pc-pricing-status" key={`${item.rowKey}-status`}>
                    <span className={`pc-badge pc-badge--${item.statusTone}`}>{item.statusLabel}</span>
                    {item.hasManualQuote ? <span className="pc-badge pc-badge--accent">已手动报价</span> : null}
                    {item.base.mappingWritten ? <span className="pc-badge pc-badge--neutral">已自动写入</span> : null}
                    {confirmedRowKeys.includes(item.rowKey) ? <span className="pc-badge pc-badge--neutral">已人工确认写入</span> : null}
                    {item.base.warnings.length > 0 ? (
                      <div className="pc-pricing-warning-list">
                        {item.base.warnings.map((warning) => (
                          <span key={warning} className="pc-badge pc-badge--danger">
                            {warning}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>,
                  <div className="pc-pricing-actions" key={`${item.rowKey}-actions`}>
                    {item.base.reviewRequired && item.base.candidateProductId ? (
                      <button
                        className="pc-button pc-button--primary pc-pricing-confirm"
                        type="button"
                        onClick={() => handleConfirmMatch(item.rowKey, item.base)}
                        disabled={confirmingRowKeys.includes(item.rowKey)}
                      >
                        {confirmingRowKeys.includes(item.rowKey) ? "确认中..." : "确认当前匹配"}
                      </button>
                    ) : null}
                    <button
                      className="pc-button pc-button--secondary pc-pricing-action-button"
                      type="button"
                      onClick={() => openBindDialog(item.rowKey, item.base)}
                    >
                      绑定商品
                    </button>
                    <button
                      className="pc-button pc-button--secondary pc-pricing-action-button"
                      type="button"
                      onClick={() => openCostDialog(item.rowKey, item.base)}
                      disabled={item.base.productId == null}
                      title={item.base.productId == null ? "当前行没有已确认商品，需先绑定商品后才能反馈成本。" : "提交正式成本修正"}
                    >
                      成本有误
                    </button>
                    {item.base.productId == null ? (
                      <span className="pc-pricing-action-note">需先绑定商品后再提交成本修正</span>
                    ) : null}
                  </div>,
                ])}
                emptyText="暂无核价结果"
              />
            </div>
          ) : (
            <StatePanel
              title="还没有结果"
              description="提交后，这里会按‘全局报价点数 + 逐行手动覆盖’模式展示真实成本、报价和利润摘要。"
              tone="neutral"
            />
          )}
        </SectionCard>

        {result ? (
          <div className="pc-pricing-pptStage">
            <div className="pc-pricing-pptBridge">
              <span className="pc-pricing-pptBridge__eyebrow">下一步</span>
              <strong>确认报价无误后，直接基于这次核价生成 PPT。</strong>
              <p>这一段延续当前核价结果，不重新录入方案，只补标题、客户名和模板选择。</p>
            </div>
            <PptGenerationPanel
              items={pptPanelItems}
              quotePoints={quotePointsValue}
              defaultTitle="临时核价报价单"
            />
          </div>
        ) : null}
      </div>

      {bindDialog ? (
        <div className="pc-modal" role="presentation" onClick={() => setBindDialog(null)}>
          <div
            className="pc-modal__panel pc-pricing-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pc-bind-product-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pc-modal__header">
              <div>
                <h2 id="pc-bind-product-title">绑定商品</h2>
                <p>为“{bindDialog.item.rawName}”搜索标准商品，确认后会写入纠正绑定并自动重跑当前核价。</p>
              </div>
              <button className="pc-button pc-button--secondary" type="button" onClick={() => setBindDialog(null)}>
                关闭
              </button>
            </div>

            <div className="pc-pricing-modal__stack">
              <div className="pc-pricing-modal__meta">
                <div className="pc-kv">
                  <span>当前匹配</span>
                  <strong>{bindDialog.item.matchedName}</strong>
                </div>
                <div className="pc-kv">
                  <span>匹配来源</span>
                  <strong>{bindDialog.item.matchSourceLabel}</strong>
                </div>
                <div className="pc-kv">
                  <span>真实成本</span>
                  <strong>{bindDialog.item.costText}</strong>
                </div>
              </div>

              <div className="pc-pricing-modal__search">
                <label className="pc-field">
                  <span>搜索标准商品</span>
                  <input
                    className="pc-input"
                    value={bindDialog.keyword}
                    onChange={(event) => {
                      const nextKeyword = event.target.value;
                      setBindDialog((current) => (current ? { ...current, keyword: nextKeyword } : current));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void runBindSearch(bindDialog.keyword);
                      }
                    }}
                    placeholder="输入商品名称、条码、品牌关键词"
                  />
                </label>

                <div className="pc-pricing-modal__actions">
                  <button
                    className="pc-button pc-button--secondary"
                    type="button"
                    onClick={() => void runBindSearch(bindDialog.keyword)}
                    disabled={bindDialog.loading}
                  >
                    {bindDialog.loading ? "搜索中..." : "搜索商品"}
                  </button>
                  <button
                    className="pc-button pc-button--primary"
                    type="button"
                    onClick={() => void handleBindConfirm()}
                    disabled={bindDialog.submitting || bindDialog.selectedProductId == null}
                  >
                    {bindDialog.submitting ? "绑定中..." : "确认绑定并重跑"}
                  </button>
                </div>
              </div>

              {bindDialog.error ? (
                <div className="pc-pricing-feedback pc-pricing-feedback--danger">{bindDialog.error}</div>
              ) : null}

              {bindDialog.loading ? (
                <StatePanel title="正在搜索" description="正在根据关键词读取商品列表候选。" tone="neutral" />
              ) : bindDialog.results.length > 0 ? (
                <div className="pc-pricing-search-results">
                  {bindDialog.results.map((product) => {
                    const selected = bindDialog.selectedProductId === product.productId;
                    return (
                      <button
                        key={product.productId}
                        type="button"
                        className={`pc-pricing-search-card${selected ? " pc-pricing-search-card--active" : ""}`}
                        onClick={() =>
                          setBindDialog((current) =>
                            current
                              ? {
                                  ...current,
                                  selectedProductId: product.productId,
                                }
                              : current,
                          )
                        }
                      >
                        <div className="pc-pricing-search-card__top">
                          <strong>{product.name}</strong>
                          <span className={`pc-badge pc-badge--${selected ? "accent" : "neutral"}`}>
                            {selected ? "已选中" : "点击选择"}
                          </span>
                        </div>
                        <div className="pc-pricing-search-card__meta">
                          <span>{product.brandName}</span>
                          <span>{product.category}</span>
                          <span>规格 {product.spec}</span>
                        </div>
                        <div className="pc-pricing-search-card__meta">
                          <span>箱规 {product.boxSpec}</span>
                          <span>{product.barcode}</span>
                          <span>{product.currentCostText === "-" ? "待补成本" : `当前成本 ${product.currentCostText}`}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <StatePanel title="暂无候选商品" description="当前关键词没有搜索到商品，可以换一个更短或更明确的关键词继续搜索。" tone="warning" />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {costDialog ? (
        <div className="pc-modal" role="presentation" onClick={() => setCostDialog(null)}>
          <div
            className="pc-modal__panel pc-pricing-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pc-pricing-cost-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pc-modal__header">
              <div>
                <h2 id="pc-pricing-cost-title">成本有误</h2>
                <p>提交正式成本、生效日期、供应商和原因。保存后会写入成本修正并自动重跑当前核价。</p>
              </div>
              <button className="pc-button pc-button--secondary" type="button" onClick={() => setCostDialog(null)}>
                关闭
              </button>
            </div>

            <div className="pc-pricing-modal__stack">
              <div className="pc-pricing-modal__meta">
                <div className="pc-kv">
                  <span>当前商品</span>
                  <strong>{costDialog.item.matchedName}</strong>
                </div>
                <div className="pc-kv">
                  <span>当前真实成本</span>
                  <strong>{costDialog.item.costText}</strong>
                </div>
                <div className="pc-kv">
                  <span>当前生效日</span>
                  <strong>{costDialog.item.costEffectiveDate}</strong>
                </div>
              </div>

              <div className="pc-pricing-cost-form">
                <label className="pc-field">
                  <span>正式成本</span>
                  <input
                    className="pc-input"
                    inputMode="decimal"
                    value={costDialog.costPrice}
                    onChange={(event) => updateCostDialogField("costPrice", event.target.value)}
                    placeholder="例如 29.90"
                  />
                </label>
                <label className="pc-field">
                  <span>生效日期</span>
                  <input
                    className="pc-input"
                    type="date"
                    value={costDialog.effectiveDate}
                    onChange={(event) => updateCostDialogField("effectiveDate", event.target.value)}
                  />
                </label>
                <label className="pc-field">
                  <span>供应商</span>
                  <input
                    className="pc-input"
                    value={costDialog.supplier}
                    onChange={(event) => updateCostDialogField("supplier", event.target.value)}
                    placeholder="可选填写"
                  />
                </label>
                <label className="pc-field pc-pricing-cost-form__reason">
                  <span>原因</span>
                  <textarea
                    className="pc-textarea"
                    value={costDialog.reason}
                    onChange={(event) => updateCostDialogField("reason", event.target.value)}
                    placeholder="例如：供应商最新到货价有误、旧成本已失效"
                  />
                </label>
              </div>

              {costDialog.error ? <div className="pc-pricing-feedback pc-pricing-feedback--danger">{costDialog.error}</div> : null}

              <div className="pc-pricing-modal__actions">
                <button className="pc-button pc-button--secondary" type="button" onClick={() => setCostDialog(null)}>
                  取消
                </button>
                <button
                  className="pc-button pc-button--primary"
                  type="button"
                  onClick={() => void handleCostSubmit()}
                  disabled={costDialog.submitting}
                >
                  {costDialog.submitting ? "提交中..." : "提交成本修正并重跑"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryStat(props: { label: string; value: string }) {
  return (
    <div className="pc-pricing-summary-stat">
      <span>{props.label}</span>
      <strong>{props.value}</strong>
    </div>
  );
}

function parseTemporaryPricingInput(raw: string): TemporaryPricingInput[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[，,]/).map((item) => item.trim()).filter(Boolean);
      const [name = "", quantity = "1", unit = ""] = parts;
      return {
        name,
        quantity: quantity || "1",
        unit,
      };
    })
    .filter((item) => item.name);
}

function buildPricingRowViews(
  items: TemporaryPricingRow[],
  manualQuoteInputs: Record<string, string>,
  quotePointsValue: number | null,
  confirmedRowKeys: string[],
): PricingRowView[] {
  return items.map((item, index) => {
    const rowKey = getTemporaryPricingRowKey(item, index);
    const manualQuoteInput = manualQuoteInputs[rowKey] ?? "";
    const manualQuoteValue = parseNumericInput(manualQuoteInput);
    const hasManualQuote = manualQuoteInput.trim().length > 0 && manualQuoteValue !== null;
    const quoteUnitValue =
      hasManualQuote
        ? manualQuoteValue
        : item.costValue !== null && quotePointsValue !== null
          ? item.costValue * (1 + quotePointsValue / 100)
          : null;
    const quoteSubtotalValue =
      quoteUnitValue !== null && item.quantityValue !== null ? quoteUnitValue * item.quantityValue : null;
    const grossProfitValue =
      quoteSubtotalValue !== null && item.subtotalValue !== null ? quoteSubtotalValue - item.subtotalValue : null;
    const profitRateValue =
      grossProfitValue !== null && item.subtotalValue !== null && item.subtotalValue > 0
        ? grossProfitValue / item.subtotalValue
        : null;
    const costMissing = item.costValue === null;

    return {
      rowKey,
      base: item,
      manualQuoteInput,
      manualQuoteValue,
      quoteUnitValue,
      quoteUnitText: formatCurrency(quoteUnitValue),
      quoteSourceLabel: hasManualQuote ? "手动报价" : costMissing ? "无真实成本" : "自动报价",
      quoteSourceHint: hasManualQuote
        ? "优先使用本行手动报价"
        : costMissing
          ? "当前没有真实成本，请先手动报价或后续修正"
          : `按 ${formatPercent(quotePointsValue)} 自动生成`,
      quoteSubtotalValue,
      quoteSubtotalText: formatCurrency(quoteSubtotalValue),
      grossProfitValue,
      grossProfitText: grossProfitValue === null ? "--" : formatCurrency(grossProfitValue),
      profitRateText: profitRateValue === null ? "--" : `利润率 ${formatPercent(profitRateValue * 100)}`,
      statusTone: determineStatusTone(item, hasManualQuote, costMissing),
      statusLabel: determineStatusLabel(item, hasManualQuote, costMissing, confirmedRowKeys.includes(rowKey)),
      costMissing,
      hasManualQuote,
    };
  });
}

function buildOverview(rows: PricingRowView[]): OverviewStats {
  const totalCostValue = sumNullable(rows.map((row) => row.base.subtotalValue));
  const totalQuoteValue = sumNullable(rows.map((row) => row.quoteSubtotalValue));
  const totalGrossValue = sumNullable(rows.map((row) => row.grossProfitValue));
  const profitRateText =
    totalCostValue !== null && totalCostValue > 0 && totalGrossValue !== null
      ? formatPercent((totalGrossValue / totalCostValue) * 100)
      : "--";

  return {
    totalCostValue,
    totalQuoteValue,
    totalGrossValue,
    profitRateText,
    reviewRequiredCount: rows.filter((row) => row.base.reviewRequired).length,
    costMissingCount: rows.filter((row) => row.costMissing).length,
    manualQuoteCount: rows.filter((row) => row.hasManualQuote).length,
    writtenCount: rows.filter((row) => row.base.mappingWritten || row.statusLabel === "已人工确认").length,
  };
}

function determineStatusTone(
  item: TemporaryPricingRow,
  hasManualQuote: boolean,
  costMissing: boolean,
): "neutral" | "warning" | "danger" {
  if (item.reviewRequired) {
    return "warning";
  }
  if (costMissing && !hasManualQuote) {
    return "danger";
  }
  return "neutral";
}

function determineStatusLabel(
  item: TemporaryPricingRow,
  hasManualQuote: boolean,
  costMissing: boolean,
  confirmedWritten: boolean,
) {
  if (confirmedWritten) {
    return "已人工确认";
  }
  if (item.reviewRequired) {
    return "待人工确认";
  }
  if (costMissing && !hasManualQuote) {
    return "缺少真实成本";
  }
  if (hasManualQuote) {
    return "已覆盖报价";
  }
  return "已核价";
}

function parseNumericInput(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const numeric = Number(normalized.replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function sumNullable(values: Array<number | null>) {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) {
    return null;
  }
  return present.reduce((sum, value) => sum + value, 0);
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "--";
  }
  return `¥${value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "--";
  }
  return `${value.toLocaleString("zh-CN", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}%`;
}

function formatToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTemporaryPricingRowKey(item: Pick<TemporaryPricingRow, "rawName">, index: number) {
  return `${index}::${item.rawName}`;
}
