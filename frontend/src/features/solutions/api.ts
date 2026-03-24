import { getJson } from "../../shared/api/http";

type BackendSolutionListItem = {
  solution_id: number;
  solution_name: string;
  upload_time: string | null;
  scene_tag: string | null;
  industry_tag: string | null;
  created_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  item_count: number;
  total_cost: number | string;
  unresolved_item_count: number;
  cost_missing_item_count: number;
  review_required_item_count: number;
};

type BackendSolutionListResponse = {
  page: number;
  page_size: number;
  total_count: number;
  items: BackendSolutionListItem[];
};

type BackendSolutionItem = {
  item_id: number;
  raw_name: string | null;
  normalized_name: string | null;
  matched_product_id: number | null;
  matched_product_name_snapshot: string | null;
  brand_name_snapshot: string | null;
  match_score: number | string | null;
  match_method: string | null;
  quantity: number | string | null;
  unit: string | null;
  pricing_time: string | null;
  cost_effective_time: string | null;
  unit_cost: number | string | null;
  subtotal_cost: number | string | null;
  supplier_snapshot: string | null;
  is_confirmed: boolean;
  created_at: string;
  updated_at: string;
};

type BackendSolutionDetail = {
  solution_id: number;
  solution_name: string;
  upload_time: string | null;
  scene_tag: string | null;
  industry_tag: string | null;
  created_by: string | null;
  source_file: string | null;
  ppt_template_path: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  item_count: number;
  total_cost: number | string;
  unresolved_item_count: number;
  cost_missing_item_count: number;
  review_required_item_count: number;
  items: BackendSolutionItem[];
};

export type SolutionListFilters = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
};

export type SolutionSummaryRow = {
  solutionId: number;
  solutionName: string;
  sceneTag: string;
  industryTag: string;
  owner: string;
  itemCount: number;
  reviewCount: number;
  unresolvedCount: number;
  costMissingCount: number;
  confirmedCount: number;
  budget: string;
  totalCost: string;
  status: string;
  updatedAt: string;
};

export type SolutionDetailRow = {
  itemId: number;
  rawName: string;
  normalizedName: string;
  matchedProductId: number | null;
  matchedProductName: string;
  brandName: string;
  matchScore: string;
  matchMethod: string;
  quantity: string;
  unit: string;
  pricingTime: string;
  costEffectiveTime: string;
  unitCost: string;
  subtotalCost: string;
  supplier: string;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  statusLabel: string;
};

export type SolutionDetailView = {
  solutionId: number;
  solutionName: string;
  sceneTag: string;
  industryTag: string;
  owner: string;
  sourceFile: string;
  pptTemplatePath: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  totalCost: string;
  unresolvedCount: number;
  costMissingCount: number;
  reviewCount: number;
  confirmedCount: number;
  items: SolutionDetailRow[];
};

export type SolutionListResult = {
  page: number;
  pageSize: number;
  totalCount: number;
  items: SolutionSummaryRow[];
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

function confirmedCount(itemCount: number, unresolvedCount: number, reviewCount: number) {
  return Math.max(0, itemCount - unresolvedCount - reviewCount);
}

function mapSummaryRow(item: BackendSolutionListItem): SolutionSummaryRow {
  return {
    solutionId: item.solution_id,
    solutionName: item.solution_name,
    sceneTag: item.scene_tag ?? "-",
    industryTag: item.industry_tag ?? "-",
    owner: item.created_by ?? "-",
    itemCount: item.item_count,
    reviewCount: item.review_required_item_count,
    unresolvedCount: item.unresolved_item_count,
    costMissingCount: item.cost_missing_item_count,
    confirmedCount: confirmedCount(item.item_count, item.unresolved_item_count, item.review_required_item_count),
    budget: "-",
    totalCost: toAmountText(item.total_cost),
    status: item.status,
    updatedAt: item.updated_at,
  };
}

function mapDetailRow(item: BackendSolutionItem): SolutionDetailRow {
  return {
    itemId: item.item_id,
    rawName: item.raw_name ?? "-",
    normalizedName: item.normalized_name ?? "-",
    matchedProductId: item.matched_product_id,
    matchedProductName: item.matched_product_name_snapshot ?? "-",
    brandName: item.brand_name_snapshot ?? "-",
    matchScore: item.match_score == null ? "-" : String(item.match_score),
    matchMethod: item.match_method ?? "-",
    quantity: item.quantity == null ? "-" : String(item.quantity),
    unit: item.unit ?? "-",
    pricingTime: item.pricing_time ?? "-",
    costEffectiveTime: item.cost_effective_time ?? "-",
    unitCost: toAmountText(item.unit_cost),
    subtotalCost: toAmountText(item.subtotal_cost),
    supplier: item.supplier_snapshot ?? "-",
    isConfirmed: item.is_confirmed,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    statusLabel: item.is_confirmed ? "已确认" : "待确认",
  };
}

export async function fetchSolutionList(
  filters: SolutionListFilters = {},
  signal?: AbortSignal,
): Promise<SolutionListResult> {
  const response = await getJson<BackendSolutionListResponse>("/solutions", {
    page: filters.page ?? 1,
    page_size: filters.pageSize ?? 20,
    keyword: filters.keyword,
    status: filters.status,
  }, { signal });

  return {
    page: response.page,
    pageSize: response.page_size,
    totalCount: response.total_count,
    items: response.items.map(mapSummaryRow),
  };
}

export async function fetchSolutionDetail(solutionId: number, signal?: AbortSignal): Promise<SolutionDetailView> {
  const response = await getJson<BackendSolutionDetail>(`/solutions/${solutionId}`, undefined, { signal });
  const items = response.items.map(mapDetailRow);
  const reviewCount = response.review_required_item_count;
  const unresolvedCount = response.unresolved_item_count;
  const confirmedCountValue = confirmedCount(response.item_count, unresolvedCount, reviewCount);

  return {
    solutionId: response.solution_id,
    solutionName: response.solution_name,
    sceneTag: response.scene_tag ?? "-",
    industryTag: response.industry_tag ?? "-",
    owner: response.created_by ?? "-",
    sourceFile: response.source_file ?? "-",
    pptTemplatePath: response.ppt_template_path ?? "-",
    status: response.status,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    itemCount: response.item_count,
    totalCost: toAmountText(response.total_cost),
    unresolvedCount,
    costMissingCount: response.cost_missing_item_count,
    reviewCount,
    confirmedCount: confirmedCountValue,
    items,
  };
}
