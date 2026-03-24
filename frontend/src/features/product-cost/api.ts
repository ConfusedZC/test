import { getJson, postJson } from "../../shared/api/http";

type BackendBrand = {
  brand_id: number;
  brand_name: string;
  alias: Record<string, unknown> | unknown[] | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type BackendProductListItem = {
  product_id: number;
  legacy_product_id: string | null;
  brand_id: number | null;
  barcode: string | null;
  standard_name: string;
  category: string | null;
  series: string | null;
  size_69_code: string | null;
  spec: string | null;
  box_spec?: string | null;
  color: string | null;
  material: string | null;
  unit: string | null;
  policy: string | null;
  note: string | null;
  status: string;
  image_path: string | null;
  extra_attributes: Record<string, unknown> | unknown[] | null;
  normalized_name: string | null;
  resolved_spec?: string | null;
  retail_price?: number | string | null;
  jd_price?: number | string | null;
  display_price?: number | string | null;
  display_price_source?: string | null;
  current_cost_price?: number | string | null;
  current_cost_currency?: string | null;
  current_cost_effective_time?: string | null;
  current_cost_supplier?: string | null;
  brand: BackendBrand | null;
  created_at: string;
  updated_at: string;
};

type BackendProductAlias = {
  alias_id: number;
  product_id: number;
  alias_name: string;
  alias_type: string | null;
  confidence: number | string | null;
  source: string | null;
  normalized_alias_name: string | null;
  created_at: string;
  updated_at: string;
};

type BackendProductImage = {
  image_id: number;
  product_id: number;
  image_path: string;
  source: string | null;
  sort_order: number;
  is_primary: boolean;
  extra_attributes: Record<string, unknown> | unknown[] | null;
  created_at: string;
  updated_at: string;
};

type BackendProductDetail = BackendProductListItem & {
  aliases: BackendProductAlias[];
  images: BackendProductImage[];
};

type BackendProductListResponse = {
  page: number;
  page_size: number;
  total_count: number;
  items: BackendProductListItem[];
};

type BackendProductHistoryRecord = {
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

type BackendProductCostHistoryResponse = {
  product_id: number;
  items: BackendProductHistoryRecord[];
};

type BackendProductFilterMetadataResponse = {
  brands: Array<{
    brand_id: number;
    brand_name: string;
  }>;
  categories: string[];
  statuses: string[];
};

type BackendTemporaryPricingItem = {
  raw_name: string | null;
  product_id: number | null;
  standard_name: string | null;
  candidate_product_id?: number | null;
  candidate_standard_name?: string | null;
  match_method: string | null;
  match_source_label?: string | null;
  match_score: number | null;
  match_review_required?: boolean;
  match_log_id?: number | null;
  mapping_action?: string | null;
  mapping_action_label?: string | null;
  mapping_written?: boolean;
  mapping_id?: number | null;
  mapping_type?: string | null;
  mapping_source?: string | null;
  unit: string | null;
  unit_cost: number | string | null;
  quantity: number | string;
  subtotal_cost: number | string | null;
  cost_record_id: number | null;
  cost_effective_time: string | null;
  supplier: string | null;
  cost_source: string | null;
  cost_source_label?: string | null;
  cost_note: string | null;
  cost_warnings: string[];
};

type BackendTemporaryPricingResponse = {
  items: BackendTemporaryPricingItem[];
  total_cost: number | string;
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
    query_text: string;
    normalized_query_text: string;
    product_id: number;
    mapping_type: string;
    active: boolean;
    confirmed: boolean;
    source: string | null;
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

export type ProductListFilters = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  brandName?: string;
  category?: string;
  status?: string;
  barcode?: string;
};

export type ProductListRow = {
  productId: number;
  name: string;
  brandName: string;
  barcode: string;
  category: string;
  spec: string;
  boxSpec: string;
  material: string;
  status: string;
  updatedAt: string;
  currentCostText: string;
  listPriceText: string;
  listPriceTag: string | null;
  listPriceSecondaryText: string | null;
  currentCostEffectiveTime: string;
  retailPriceText: string;
  jdPriceText: string;
  displayPriceText: string;
  displayPriceSource: string | null;
  displayPriceSourceLabel: string;
  normalizedName: string;
  series: string;
  unit: string;
  note: string;
};

export type ProductAliasView = {
  aliasId: number;
  aliasName: string;
  aliasType: string;
  confidence: string;
  source: string;
  normalizedAliasName: string;
};

export type ProductImageView = {
  imageId: number;
  imagePath: string;
  source: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductCostHistoryView = {
  costId: number;
  effectiveTime: string;
  costText: string;
  amountValue: number | null;
  currency: string;
  supplier: string;
  source: string;
  note: string;
};

export type ProductDetailView = ProductListRow & {
  aliases: ProductAliasView[];
  images: ProductImageView[];
  costHistory: ProductCostHistoryView[];
  currentCostText: string;
  currentCostEffectiveTime: string;
  currentCostSupplier: string;
  currentCostSource: string;
};

export type CatalogFilterOptions = {
  brands: string[];
  categories: string[];
  statuses: string[];
};

export type ProductListResult = {
  page: number;
  pageSize: number;
  totalCount: number;
  items: ProductListRow[];
};

export type TemporaryPricingInput = {
  name: string;
  quantity: string;
  unit: string;
};

export type TemporaryPricingRow = {
  rawName: string;
  productId: number | null;
  candidateProductId: number | null;
  matchedName: string;
  matchMethod: string;
  matchSourceLabel: string;
  matchScore: string;
  reviewRequired: boolean;
  matchLogId: number | null;
  mappingAction: string;
  mappingActionLabel: string;
  mappingWritten: boolean;
  unit: string;
  quantityValue: number | null;
  costText: string;
  costValue: number | null;
  costSourceLabel: string;
  costEffectiveDate: string;
  quantityText: string;
  subtotalText: string;
  subtotalValue: number | null;
  warnings: string[];
};

export type TemporaryPricingResult = {
  totalCostValue: number;
  totalCostText: string;
  items: TemporaryPricingRow[];
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

function toText(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function toAmountText(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numeric = Number(String(value).replace(/,/g, ""));
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return numeric.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function toCurrencyText(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return `¥${toAmountText(value, fallback)}`;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function formatDateOnly(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const raw = String(value).trim();
  if (!raw) {
    return fallback;
  }

  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    return isoMatch[1];
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw.replace("T", " ").split(".")[0] || fallback;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    const raw = String(value).replace("T", " ");
    return raw.split(".")[0] || fallback;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatConfidence(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return numeric.toFixed(2);
}

function extractObjectText(source: unknown, key: string) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return null;
  }

  const value = (source as Record<string, unknown>)[key];
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  return text || null;
}

function resolveProductSpec(item: Pick<BackendProductListItem, "resolved_spec">) {
  const text = item.resolved_spec?.trim();
  return text || "待补规格";
}

function resolveBoxSpec(item: Pick<BackendProductListItem, "spec" | "box_spec" | "extra_attributes">) {
  return (
    item.box_spec?.trim() ||
    extractObjectText(item.extra_attributes, "box_spec") ||
    item.spec?.trim() ||
    "-"
  );
}

function formatDisplayPriceSource(value: string | null | undefined, fallback = "-") {
  if (!value) {
    return fallback;
  }

  const labels: Record<string, string> = {
    current_cost: "真实成本",
    retail_price: "参考零售价",
    jd_price: "京东价",
  };

  return labels[value] ?? value;
}

function formatDiscountRatio(currentCost: number | null, retailPrice: number | null) {
  if (currentCost === null || retailPrice === null || retailPrice <= 0) {
    return null;
  }

  return (currentCost / retailPrice).toFixed(2);
}

function mapProductRow(item: BackendProductListItem): ProductListRow {
  const currentCostValue = toNullableNumber(item.current_cost_price);
  const retailPriceValue = toNullableNumber(item.retail_price);
  const currentCostText = toCurrencyText(item.current_cost_price);
  const retailPriceText = toCurrencyText(item.retail_price);
  const jdPriceText = toCurrencyText(item.jd_price);
  const displayPriceText = toCurrencyText(item.display_price);
  const displayPriceSource = item.display_price_source ?? null;
  const displayPriceSourceLabel = formatDisplayPriceSource(displayPriceSource);
  const listPriceText =
    currentCostText !== "-"
      ? currentCostText
      : displayPriceSource === "retail_price" && displayPriceText !== "-"
        ? displayPriceText
        : "-";
  const listPriceTag =
    currentCostText === "-" && displayPriceSource === "retail_price" && displayPriceText !== "-"
      ? "零售价"
      : null;
  const discountRatioText = formatDiscountRatio(currentCostValue, retailPriceValue);
  const listPriceSecondaryText =
    currentCostText !== "-" && retailPriceText !== "-" && discountRatioText
      ? `零售价 ${retailPriceText} × 折扣${discountRatioText}`
      : null;

  return {
    productId: item.product_id,
    name: item.standard_name,
    brandName: item.brand?.brand_name ?? "-",
    barcode: item.barcode ?? "-",
    category: item.category ?? "-",
    spec: resolveProductSpec(item),
    boxSpec: resolveBoxSpec(item),
    material: item.material ?? "-",
    status: item.status,
    updatedAt: formatDateOnly(item.updated_at),
    currentCostText,
    listPriceText,
    listPriceTag,
    listPriceSecondaryText,
    currentCostEffectiveTime: formatDateOnly(item.current_cost_effective_time),
    retailPriceText,
    jdPriceText,
    displayPriceText,
    displayPriceSource,
    displayPriceSourceLabel,
    normalizedName: item.normalized_name ?? "-",
    series: item.series ?? "-",
    unit: item.unit ?? "-",
    note: item.note ?? "-",
  };
}

function mapCostHistoryRow(item: BackendProductHistoryRecord): ProductCostHistoryView {
  const numericAmount = Number(String(item.cost_price).replace(/,/g, ""));

  return {
    costId: item.cost_id,
    effectiveTime: formatDateTime(item.effective_time),
    costText: toAmountText(item.cost_price),
    amountValue: Number.isFinite(numericAmount) ? numericAmount : null,
    currency: item.currency,
    supplier: item.supplier ?? "-",
    source: item.source ?? "-",
    note: item.note ?? "-",
  };
}

function mapAliasRow(item: BackendProductAlias): ProductAliasView {
  return {
    aliasId: item.alias_id,
    aliasName: item.alias_name,
    aliasType: item.alias_type ?? "-",
    confidence: formatConfidence(item.confidence),
    source: item.source ?? "-",
    normalizedAliasName: item.normalized_alias_name ?? "-",
  };
}

function mapImageRow(item: BackendProductImage): ProductImageView {
  return {
    imageId: item.image_id,
    imagePath: item.image_path,
    source: item.source ?? "-",
    sortOrder: item.sort_order,
    isPrimary: item.is_primary,
  };
}

export async function fetchProducts(
  filters: ProductListFilters = {},
  signal?: AbortSignal,
): Promise<ProductListResult> {
  const response = await getJson<BackendProductListResponse>("/products", {
    page: filters.page ?? 1,
    page_size: filters.pageSize ?? 20,
    keyword: filters.keyword,
    brand_name: filters.brandName,
    category: filters.category,
    status: filters.status,
    barcode: filters.barcode,
  }, { signal });

  return {
    page: response.page,
    pageSize: response.page_size,
    totalCount: response.total_count,
    items: response.items.map(mapProductRow),
  };
}

export async function searchTemporaryPricingProducts(
  keyword: string,
  signal?: AbortSignal,
): Promise<ProductListRow[]> {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) {
    return [];
  }

  const response = await fetchProducts(
    {
      page: 1,
      pageSize: 8,
      keyword: normalizedKeyword,
    },
    signal,
  );

  return response.items;
}

export async function fetchCatalogFilterOptions(signal?: AbortSignal): Promise<CatalogFilterOptions> {
  const response = await getJson<BackendProductFilterMetadataResponse>(
    "/products/filter-options",
    undefined,
    { signal },
  );

  return {
    brands: response.brands
      .map((item) => item.brand_name.trim())
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort((left, right) => left.localeCompare(right, "zh-Hans-CN")),
    categories: response.categories
      .map((item) => item.trim())
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right, "zh-Hans-CN")),
    statuses: response.statuses,
  };
}

export async function fetchProductDetail(productId: number, signal?: AbortSignal): Promise<ProductDetailView> {
  const [detail, costHistory] = await Promise.all([
    getJson<BackendProductDetail>(`/products/${productId}`, undefined, { signal }),
    getJson<BackendProductCostHistoryResponse>(
      `/products/${productId}/costs/history`,
      {
        limit: 100,
      },
      { signal },
    ),
  ]);

  const sortedHistory = [...costHistory.items]
    .map(mapCostHistoryRow)
    .sort((left, right) => right.effectiveTime.localeCompare(left.effectiveTime));
  const currentCost = sortedHistory[0];

  return {
    ...mapProductRow(detail),
    aliases: detail.aliases.map(mapAliasRow),
    images: detail.images.map(mapImageRow).sort((left, right) => {
      if (left.isPrimary !== right.isPrimary) {
        return Number(right.isPrimary) - Number(left.isPrimary);
      }
      return left.sortOrder - right.sortOrder;
    }),
    costHistory: sortedHistory,
    currentCostText: detail.current_cost_price == null ? currentCost?.costText ?? "-" : toCurrencyText(detail.current_cost_price),
    currentCostEffectiveTime:
      detail.current_cost_effective_time == null ? formatDateOnly(currentCost?.effectiveTime) : formatDateOnly(detail.current_cost_effective_time),
    currentCostSupplier: detail.current_cost_supplier ?? currentCost?.supplier ?? "-",
    currentCostSource: currentCost?.source ?? "-",
  };
}

function formatMatchScore(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }
  return value.toFixed(4);
}

function mapWarningCode(value: string) {
  const labels: Record<string, string> = {
    product_unresolved: "商品未解析",
    match_review_required: "待人工确认",
    product_not_found: "商品不存在",
    cost_missing: "缺少真实成本",
    manual_override_in_effect: "人工覆盖成本生效",
    rollback_record_in_effect: "回退成本生效",
  };
  return labels[value] ?? value;
}

export async function calculateTemporaryPricing(
  items: TemporaryPricingInput[],
  signal?: AbortSignal,
): Promise<TemporaryPricingResult> {
  const response = await postJson<BackendTemporaryPricingResponse>(
    "/calculate",
    {
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || null,
      })),
    },
    { signal },
  );

  return {
    totalCostValue: toNullableNumber(response.total_cost) ?? 0,
    totalCostText: `¥${toAmountText(response.total_cost, "0.00")}`,
    items: response.items.map((item) => ({
      rawName: item.raw_name ?? "-",
      productId: item.product_id ?? null,
      candidateProductId: item.candidate_product_id ?? item.product_id ?? null,
      matchedName: item.standard_name ?? item.candidate_standard_name ?? "待人工确认",
      matchMethod: item.match_method ?? "-",
      matchSourceLabel: item.match_source_label ?? "未命中",
      matchScore: formatMatchScore(item.match_score),
      reviewRequired: Boolean(item.match_review_required),
      matchLogId: item.match_log_id ?? null,
      mappingAction: item.mapping_action ?? "-",
      mappingActionLabel: item.mapping_action_label ?? "未写入对应表",
      mappingWritten: Boolean(item.mapping_written),
      unit: item.unit ?? "-",
      quantityValue: toNullableNumber(item.quantity),
      costText: item.unit_cost == null ? "待补成本" : `¥${toAmountText(item.unit_cost)}`,
      costValue: toNullableNumber(item.unit_cost),
      costSourceLabel: item.cost_source_label ?? item.cost_source ?? "-",
      costEffectiveDate: formatDateOnly(item.cost_effective_time),
      quantityText: `${item.quantity}${item.unit ?? ""}`,
      subtotalText: item.subtotal_cost == null ? "-" : `¥${toAmountText(item.subtotal_cost)}`,
      subtotalValue: toNullableNumber(item.subtotal_cost),
      warnings: (item.cost_warnings ?? []).map(mapWarningCode),
    })),
  };
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
