import { ApiError, getJson, postJson } from "../../shared/api/http";

type BackendPptTemplateItem = {
  template_id?: string | null;
  template_key?: string | null;
  template_name?: string | null;
  template_path?: string | null;
  description?: string | null;
  reason_tags?: string[] | null;
};

type BackendPptTemplateListResponse = {
  items?: BackendPptTemplateItem[];
  templates?: BackendPptTemplateItem[];
  recommended_template_key?: string | null;
  reason_tags?: string[] | null;
};

type BackendPricingPptTaskResponse = {
  task_id: string;
  ppt_id?: number | null;
  solution_id?: number | null;
  status: string;
  detail?: string | null;
  output_ppt_path?: string | null;
  download_url?: string | null;
  download_file_url?: string | null;
};

export type PricingPptTemplateOption = {
  templateId: string;
  templateKey: string | null;
  name: string;
  templatePath: string | null;
  description: string;
  reasonTags: string[];
};

export type PricingPptTemplateListView = {
  templates: PricingPptTemplateOption[];
  recommendedTemplateKey: string | null;
  reasonTags: string[];
};

export type PricingPptPanelItem = {
  rawName: string;
  matchedName: string;
  quantityText: string;
  costText?: string;
  quoteText?: string;
  costSubtotalText?: string;
  quoteSubtotalText?: string;
  warnings?: string[];
};

export type GeneratePricingPptInput = {
  title: string;
  customerName: string;
  templatePath: string | null;
  quotePoints: number | null;
  items: PricingPptPanelItem[];
};

export type PricingPptTaskView = {
  taskId: string;
  pptId: number | null;
  solutionId: number | null;
  status: string;
  detail: string;
  outputPptPath: string | null;
  downloadUrl: string | null;
  downloadFileUrl: string | null;
};

const DEFAULT_TEMPLATE: PricingPptTemplateOption = {
  templateId: "default",
  templateKey: "default",
  name: "系统默认模板",
  templatePath: null,
  description: "使用系统默认模板生成正式 .pptx。",
  reasonTags: [],
};

function mapTemplateItem(item: BackendPptTemplateItem, index: number): PricingPptTemplateOption {
  return {
    templateId: item.template_id ?? item.template_key ?? item.template_path ?? `template-${index + 1}`,
    templateKey: item.template_key ?? null,
    name: item.template_name ?? item.template_path ?? `模板 ${index + 1}`,
    templatePath: item.template_path ?? null,
    description: item.description ?? "可用于临时核价导出。",
    reasonTags: Array.isArray(item.reason_tags) ? item.reason_tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0) : [],
  };
}

function mapTaskResponse(response: BackendPricingPptTaskResponse): PricingPptTaskView {
  return {
    taskId: response.task_id,
    pptId: response.ppt_id ?? null,
    solutionId: response.solution_id ?? null,
    status: response.status,
    detail: response.detail ?? "-",
    outputPptPath: response.output_ppt_path ?? null,
    downloadUrl: response.download_url ?? null,
    downloadFileUrl: response.download_file_url ?? null,
  };
}

export async function fetchPricingPptTemplates(signal?: AbortSignal): Promise<PricingPptTemplateListView> {
  try {
    const response = await getJson<BackendPptTemplateListResponse>("/ppt/templates", undefined, { signal });
    const source = response.items ?? response.templates ?? [];
    if (source.length === 0) {
      return {
        templates: [DEFAULT_TEMPLATE],
        recommendedTemplateKey: null,
        reasonTags: [],
      };
    }
    const templates = source.map(mapTemplateItem);

    return {
      templates,
      recommendedTemplateKey: response.recommended_template_key ?? null,
      reasonTags: Array.isArray(response.reason_tags)
        ? response.reason_tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
        : [],
    };
  } catch (error_) {
    if (error_ instanceof ApiError && error_.status === 404) {
      return {
        templates: [DEFAULT_TEMPLATE],
        recommendedTemplateKey: null,
        reasonTags: [],
      };
    }
    throw error_;
  }
}

export async function generatePricingPpt(
  payload: GeneratePricingPptInput,
  signal?: AbortSignal,
): Promise<PricingPptTaskView> {
  try {
    const response = await postJson<BackendPricingPptTaskResponse>(
      "/ppt/generate-from-pricing",
      {
        title: payload.title,
        customer_name: payload.customerName,
        template_path: payload.templatePath,
        quote_points: payload.quotePoints,
        items: payload.items.map((item) => ({
          raw_name: item.rawName,
          matched_name: item.matchedName,
          quantity_text: item.quantityText,
          cost_text: item.costText ?? null,
          quote_text: item.quoteText ?? null,
          cost_subtotal_text: item.costSubtotalText ?? null,
          quote_subtotal_text: item.quoteSubtotalText ?? null,
          warnings: item.warnings ?? [],
        })),
      },
      { signal },
    );
    return mapTaskResponse(response);
  } catch (error_) {
    if (error_ instanceof ApiError && error_.status === 404) {
      throw new Error("后端暂未提供临时核价生成 PPT 接口（/api/ppt/generate-from-pricing）。");
    }
    throw error_;
  }
}

export async function fetchPricingPptTaskStatus(taskId: string, signal?: AbortSignal): Promise<PricingPptTaskView> {
  const response = await getJson<BackendPricingPptTaskResponse>(
    "/ppt/status",
    { task_id: taskId },
    { signal },
  );
  return mapTaskResponse(response);
}
