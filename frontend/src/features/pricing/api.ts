import { getJson, postJson } from "../../shared/api/http";

export type TemporaryPricingInputRow = {
  name: string;
  quantity: number;
  unit: string;
};

export type PricingTone = "neutral" | "success" | "warning" | "danger" | "accent";

type BackendCalculateItemResult = {
  raw_name: string | null;
  product_id: number | null;
  standard_name: string | null;
  candidate_product_id?: number | null;
  candidate_standard_name?: string | null;
  match_method: string | null;
  match_source_label?: string | null;
  match_score: number | string | null;
  match_review_required?: boolean;
  match_log_id?: number | null;
  mapping_action?: string | null;
  mapping_action_label?: string | null;
  mapping_written?: boolean;
  unit_cost: number | string | null;
  quantity: number | string;
  unit: string | null;
  subtotal_cost: number | string | null;
  cost_record_id: number | null;
  cost_effective_time: string | null;
  supplier: string | null;
  cost_source: string | null;
  cost_source_label?: string | null;
  cost_note: string | null;
  cost_warnings: string[];
};

type BackendCalculateResponse = {
  items: BackendCalculateItemResult[];
  total_cost: number | string;
};

type BackendProductListItem = {
  product_id: number;
  standard_name: string;
  category: string | null;
  resolved_spec?: string | null;
  current_cost_price?: number | string | null;
  brand: {
    brand_name: string;
  } | null;
};

type BackendProductListResponse = {
  page: number;
  page_size: number;
  total_count: number;
  items: BackendProductListItem[];
};

type BackendMatchFeedbackResponse = {
  feedback: {
    feedback_id: number;
    raw_name: string;
    candidate_product_id: number | null;
    final_product_id: number | null;
    feedback_type: string | null;
  };
  promoted_mapping: {
    mapping_id: number;
    product_standard_name: string | null;
  } | null;
};

type BackendProductCostMutationResponse = {
  record: {
    cost_id: number;
    product_id: number;
    cost_price: number | string;
    currency: string;
    effective_time: string;
    supplier: string | null;
    source: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
  };
  warnings: string[];
  audit_action: string;
};

export type TemporaryPricingRow = {
  rowKey: string;
  rawName: string;
  productId: number | null;
  candidateProductId: number | null;
  matchedProductName: string;
  matchMethod: string;
  matchScore: string;
  matchSourceLabel: string;
  matchSourceTone: PricingTone;
  matchSourceHint: string;
  quantity: string;
  unit: string;
  unitCostText: string;
  subtotalCostText: string;
  priceSourceLabel: string;
  priceSourceTone: PricingTone;
  priceSourceHint: string;
  reviewStatusLabel: string;
  reviewStatusTone: PricingTone;
  reviewStatusHint: string;
  isReviewRequired: boolean;
  isUnresolved: boolean;
  isCostMissing: boolean;
  matchLogId: number | null;
  mappingActionLabel: string;
  supplier: string;
  costEffectiveTime: string;
  costSource: string;
  costNote: string;
  warnings: string[];
};

export type TemporaryPricingResult = {
  items: TemporaryPricingRow[];
  totalCostText: string;
  warnings: string[];
};

export type TemporaryPricingProductSearchResult = {
  productId: number;
  standardName: string;
  brandName: string;
  category: string;
  resolvedSpec: string;
  currentCostText: string;
};

export type ConfirmTemporaryPricingMatchResult = {
  feedbackType: string;
  mappingId: number | null;
  productStandardName: string | null;
};

export type UpdateTemporaryPricingCostInput = {
  costPrice: string;
  effectiveDate: string;
  supplier?: string;
  reason: string;
};

export type UpdateTemporaryPricingCostResult = {
  costId: number;
  warnings: string[];
  auditAction: string;
};

export type TemporaryPricingRequest = {
  items: TemporaryPricingInputRow[];
  pricingTime?: string;
};

function formatCurrencyText(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numeric = Number(String(value).replace(/,/g, ""));
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return `¥${numeric.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPlainNumberText(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numeric = Number(String(value).replace(/,/g, ""));
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  if (Number.isInteger(numeric)) {
    return numeric.toLocaleString("zh-CN");
  }

  return numeric.toLocaleString("zh-CN", {
    maximumFractionDigits: 4,
  });
}

function formatScoreText(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return numeric.toFixed(2);
}

function formatDateOnly(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const raw = String(value).trim();
  if (!raw) {
    return fallback;
  }

  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw.split("T")[0] || fallback;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function uniqueWarnings(rows: TemporaryPricingRow[]) {
  return Array.from(new Set(rows.flatMap((row) => row.warnings)));
}

function describeMatchSource(matchMethod: string | null): { label: string; tone: PricingTone; hint: string } {
  const normalized = (matchMethod ?? "").trim();

  if (!normalized || normalized === "-") {
    return {
      label: "未匹配",
      tone: "danger",
      hint: "当前结果没有可确认的匹配来源。",
    };
  }

  if (normalized === "direct_product_id" || normalized === "manual_mapping" || normalized === "auto_mapping") {
    return {
      label: "历史映射",
      tone: "accent",
      hint: "直接复用历史映射结果。",
    };
  }

  if (normalized === "exact_standard") {
    return {
      label: "精确匹配",
      tone: "success",
      hint: "标准名称完全命中。",
    };
  }

  if (normalized === "barcode") {
    return {
      label: "条码匹配",
      tone: "success",
      hint: "条码直接命中。",
    };
  }

  if (normalized === "alias") {
    return {
      label: "别名匹配",
      tone: "success",
      hint: "通过别名命中商品。",
    };
  }

  if (normalized === "legacy_heuristic") {
    return {
      label: "模糊匹配",
      tone: "warning",
      hint: "需要人工确认后再复用。",
    };
  }

  return {
    label: "其他匹配",
    tone: "neutral",
    hint: `匹配方式：${normalized}`,
  };
}

function describeMappingAction(
  mappingActionLabel: string | null | undefined,
  mappingWritten: boolean | undefined,
  matchLogId: number | null | undefined,
) {
  const parts: string[] = [];
  if (mappingActionLabel && mappingActionLabel !== "-") {
    parts.push(mappingActionLabel);
  }
  if (mappingWritten) {
    parts.push("已自动沉淀");
  }
  if (matchLogId) {
    parts.push(`日志 #${matchLogId}`);
  }
  return parts.join(" · ");
}

function describeReviewStatus(
  matchMethod: string | null,
  warnings: string[],
): { label: string; tone: PricingTone; hint: string; unresolved: boolean; reviewRequired: boolean } {
  const warningSet = new Set(warnings);
  const unresolved = warningSet.has("product_unresolved") || warningSet.has("product_not_found");
  if (unresolved) {
    return {
      label: "未匹配",
      tone: "danger",
      hint: "当前行没有可核价的商品，请先检查名称、条码或映射。",
      unresolved: true,
      reviewRequired: false,
    };
  }

  const reviewRequired = warningSet.has("match_review_required") || matchMethod === "legacy_heuristic";
  if (reviewRequired) {
    return {
      label: "模糊匹配待确认",
      tone: "warning",
      hint: "当前结果置信度不足，需要人工确认后再复用。",
      unresolved: false,
      reviewRequired: true,
    };
  }

  if (warningSet.has("cost_missing")) {
    return {
      label: "已匹配 · 待补成本",
      tone: "warning",
      hint: "商品已确认，但当前没有可用成本记录。",
      unresolved: false,
      reviewRequired: false,
    };
  }

  return {
    label: "已确认",
    tone: "success",
    hint: "可以直接用于临时核价。",
    unresolved: false,
    reviewRequired: false,
  };
}

function describePriceSource(
  costSource: string | null,
  unitCostText: string,
  costEffectiveTime: string,
): { label: string; tone: PricingTone; hint: string; costMissing: boolean } {
  if (unitCostText === "-") {
    return {
      label: "暂无成本",
      tone: "danger",
      hint: "当前没有可用成本记录。",
      costMissing: true,
    };
  }

  const normalized = (costSource ?? "").trim();
  if (normalized === "manual_override") {
    return {
      label: "手工覆盖成本",
      tone: "warning",
      hint: costEffectiveTime !== "-" ? `生效日 ${costEffectiveTime}` : "手工覆盖记录生效中。",
      costMissing: false,
    };
  }

  if (normalized === "manual_rollback") {
    return {
      label: "回退成本",
      tone: "warning",
      hint: costEffectiveTime !== "-" ? `生效日 ${costEffectiveTime}` : "回退记录生效中。",
      costMissing: false,
    };
  }

  return {
    label: "历史成本",
    tone: "neutral",
    hint: costEffectiveTime !== "-" ? `生效日 ${costEffectiveTime}` : "来自历史成本记录。",
    costMissing: false,
  };
}

export async function calculateTemporaryPricing(
  request: TemporaryPricingRequest,
  signal?: AbortSignal,
): Promise<TemporaryPricingResult> {
  const response = await postJson<BackendCalculateResponse>(
    "/calculate",
    {
      pricing_time: request.pricingTime || undefined,
      items: request.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })),
    },
    { signal },
  );

  const items = response.items.map<TemporaryPricingRow>((item, index) => ({
    rowKey: `${index}-${item.raw_name ?? "row"}`,
    rawName: item.raw_name ?? "-",
    productId: item.product_id,
    candidateProductId: item.candidate_product_id ?? item.product_id ?? null,
    matchedProductName: item.standard_name ?? "-",
    matchMethod: item.match_method ?? "-",
    matchScore: formatScoreText(item.match_score),
    ...(() => {
      const matchSource = describeMatchSource(item.match_method);
      return {
        matchSourceLabel: item.match_source_label ?? matchSource.label,
        matchSourceTone: matchSource.tone,
        matchSourceHint: describeMappingAction(
          item.mapping_action_label,
          item.mapping_written,
          item.match_log_id,
        ) || matchSource.hint,
      };
    })(),
    quantity: formatPlainNumberText(item.quantity),
    unit: item.unit ?? "-",
    unitCostText: formatCurrencyText(item.unit_cost),
    subtotalCostText: formatCurrencyText(item.subtotal_cost),
    ...(() => {
      const priceSource = describePriceSource(
        item.cost_source ?? null,
        formatCurrencyText(item.unit_cost),
        formatDateOnly(item.cost_effective_time),
      );
      return {
        priceSourceLabel: item.cost_source_label ?? priceSource.label,
        priceSourceTone: priceSource.tone,
        priceSourceHint: priceSource.hint,
        isCostMissing: priceSource.costMissing,
      };
    })(),
    ...(() => {
      const reviewStatus = describeReviewStatus(item.match_method ?? null, item.cost_warnings ?? []);
      return {
        reviewStatusLabel: reviewStatus.label,
        reviewStatusTone: reviewStatus.tone,
        reviewStatusHint: reviewStatus.hint,
        isReviewRequired: reviewStatus.reviewRequired,
        isUnresolved: reviewStatus.unresolved,
      };
    })(),
    matchLogId: item.match_log_id ?? null,
    mappingActionLabel: item.mapping_action_label ?? "未写入对应表",
    supplier: item.supplier ?? "-",
    costEffectiveTime: formatDateOnly(item.cost_effective_time),
    costSource: item.cost_source ?? "-",
    costNote: item.cost_note ?? "-",
    warnings: item.cost_warnings ?? [],
  }));

  return {
    items,
    totalCostText: formatCurrencyText(response.total_cost),
    warnings: uniqueWarnings(items),
  };
}

export async function searchTemporaryPricingProducts(
  keyword: string,
  signal?: AbortSignal,
): Promise<TemporaryPricingProductSearchResult[]> {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) {
    return [];
  }

  const response = await getJson<BackendProductListResponse>(
    "/products",
    {
      page: 1,
      page_size: 8,
      keyword: normalizedKeyword,
      status: "active",
    },
    { signal },
  );

  return response.items.map((item) => ({
    productId: item.product_id,
    standardName: item.standard_name,
    brandName: item.brand?.brand_name ?? "-",
    category: item.category ?? "-",
    resolvedSpec: item.resolved_spec?.trim() || "待补规格",
    currentCostText:
      item.current_cost_price == null
        ? "待补成本"
        : formatCurrencyText(item.current_cost_price),
  }));
}

export async function confirmTemporaryPricingMatch(
  rawName: string,
  candidateProductId: number,
  signal?: AbortSignal,
): Promise<ConfirmTemporaryPricingMatchResult> {
  const response = await postJson<BackendMatchFeedbackResponse>(
    "/match/feedback",
    {
      raw_name: rawName,
      candidate_product_id: candidateProductId,
      feedback_type: "confirmed",
      operator: "temporary_pricing_ui",
      source: "temporary_pricing_page",
    },
    { signal },
  );

  return {
    feedbackType: response.feedback.feedback_type ?? "confirmed",
    mappingId: response.promoted_mapping?.mapping_id ?? null,
    productStandardName: response.promoted_mapping?.product_standard_name ?? null,
  };
}

export async function correctTemporaryPricingMatch(
  rawName: string,
  productId: number,
  signal?: AbortSignal,
): Promise<ConfirmTemporaryPricingMatchResult> {
  const response = await postJson<BackendMatchFeedbackResponse>(
    "/match/feedback",
    {
      raw_name: rawName,
      final_product_id: productId,
      feedback_type: "corrected",
      operator: "temporary_pricing_ui",
      source: "temporary_pricing_page",
    },
    { signal },
  );

  return {
    feedbackType: response.feedback.feedback_type ?? "corrected",
    mappingId: response.promoted_mapping?.mapping_id ?? null,
    productStandardName: response.promoted_mapping?.product_standard_name ?? null,
  };
}

export async function updateTemporaryPricingCost(
  productId: number,
  payload: UpdateTemporaryPricingCostInput,
  signal?: AbortSignal,
): Promise<UpdateTemporaryPricingCostResult> {
  const response = await postJson<BackendProductCostMutationResponse>(
    `/products/${productId}/costs/formal-update`,
    {
      cost_price: payload.costPrice,
      currency: "CNY",
      effective_time: `${payload.effectiveDate}T00:00:00+08:00`,
      supplier: payload.supplier?.trim() || null,
      source: "quote_correction",
      note: payload.reason,
    },
    { signal },
  );

  return {
    costId: response.record.cost_id,
    warnings: response.warnings,
    auditAction: response.audit_action,
  };
}
