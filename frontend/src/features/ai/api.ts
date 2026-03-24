import { postJson } from "../../shared/api/http";

type BackendAgentGeneratedItem = {
  raw_name: string | null;
  product_id: number | null;
  standard_name: string | null;
  quantity: number | string | null;
  unit: string | null;
  match_method: string | null;
  match_score: number | string | null;
  unit_cost: number | string | null;
  subtotal_cost: number | string | null;
  supplier: string | null;
  cost_warnings: string[];
};

type BackendAgentGenerateResponse = {
  agent_case_id: number | null;
  solution_id: number | null;
  draft_text: string;
  items: BackendAgentGeneratedItem[];
  total_cost: number | string | null;
  ppt_task_id: string | null;
  warnings: string[];
};

export type AgentFormValues = {
  requirement: string;
  scene: string;
  industry: string;
  budgetMin: string;
  budgetMax: string;
  styleTags: string;
  specialRequirements: string;
  needPpt: boolean;
};

export type AgentGeneratedItemView = {
  rawName: string;
  productId: number | null;
  standardName: string;
  quantity: string;
  unit: string;
  matchMethod: string;
  matchScore: string;
  unitCost: string;
  subtotalCost: string;
  supplier: string;
  warnings: string[];
};

export type AgentGenerateResult = {
  agentCaseId: number | null;
  solutionId: number | null;
  draftText: string;
  items: AgentGeneratedItemView[];
  totalCostText: string;
  pptTaskId: string | null;
  warnings: string[];
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

export function buildAgentRequirement(values: AgentFormValues) {
  const segments = [values.requirement.trim()];

  if (values.scene.trim()) {
    segments.push(`场景：${values.scene.trim()}`);
  }
  if (values.industry.trim()) {
    segments.push(`行业：${values.industry.trim()}`);
  }
  const budgetText = [values.budgetMin.trim(), values.budgetMax.trim()].filter(Boolean).join(" - ");
  if (budgetText) {
    segments.push(`预算：${budgetText}`);
  }
  if (values.styleTags.trim()) {
    segments.push(`风格标签：${values.styleTags.trim()}`);
  }
  if (values.specialRequirements.trim()) {
    segments.push(`特殊要求：${values.specialRequirements.trim()}`);
  }

  return segments.filter((segment) => segment.length > 0).join("\n");
}

export async function generateAgentSolution(values: AgentFormValues): Promise<AgentGenerateResult> {
  const response = await postJson<BackendAgentGenerateResponse>("/agent/generate", {
    requirement: buildAgentRequirement(values),
    options: {
      need_ppt: values.needPpt,
      scene_tag: values.scene.trim() || undefined,
      industry_tag: values.industry.trim() || undefined,
    },
  });

  return {
    agentCaseId: response.agent_case_id,
    solutionId: response.solution_id,
    draftText: response.draft_text,
    items: response.items.map((item) => ({
      rawName: toText(item.raw_name),
      productId: item.product_id,
      standardName: toText(item.standard_name),
      quantity: toText(item.quantity),
      unit: toText(item.unit),
      matchMethod: toText(item.match_method),
      matchScore: toText(item.match_score),
      unitCost: toAmountText(item.unit_cost),
      subtotalCost: toAmountText(item.subtotal_cost),
      supplier: toText(item.supplier),
      warnings: item.cost_warnings ?? [],
    })),
    totalCostText: toAmountText(response.total_cost),
    pptTaskId: response.ppt_task_id,
    warnings: response.warnings ?? [],
  };
}
