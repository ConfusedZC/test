export type SolutionStatus = "待确认" | "处理中" | "已完成" | "已归档";

export type SolutionSource = "方案导入" | "AI 生成" | "手工创建";

export type SolutionImportStatus = "成功" | "失败" | "处理中";

export type SolutionReviewState = "待确认" | "已确认" | "已忽略";

export interface SolutionSummary {
  solutionId: number;
  solutionName: string;
  sceneTag: string;
  industryTag: string;
  owner: string;
  itemCount: number;
  reviewCount: number;
  confirmedCount: number;
  budget: string;
  totalCost: string;
  status: SolutionStatus;
  source: SolutionSource;
  updatedAt: string;
}

export interface SolutionImportRecord {
  importId: number;
  fileName: string;
  fileType: "xlsx" | "csv";
  status: SolutionImportStatus;
  totalCount: number;
  successCount: number;
  failedCount: number;
  importedAt: string;
  owner: string;
  summary: string;
  errorReport: string | null;
}

export interface SolutionImportStep {
  stepId: number;
  title: string;
  description: string;
  status: "done" | "doing" | "todo";
}

export interface SolutionCandidate {
  productId: number;
  standardName: string;
  brandName: string;
  score: number;
  matchMethod: string;
  unitCost: string;
}

export interface SolutionReviewItem {
  itemId: number;
  rawName: string;
  normalizedName: string;
  quantity: number;
  unit: string;
  score: number;
  sourceSolutionName: string;
  sceneTag: string;
  state: SolutionReviewState;
  note: string;
  candidates: SolutionCandidate[];
}

export interface SolutionDetailItem {
  itemId: number;
  rawName: string;
  matchedName: string;
  quantity: number;
  unit: string;
  unitCost: string;
  subtotal: string;
  matchMethod: string;
  status: SolutionReviewState;
  supplier: string;
  confidence: number;
  candidateCount: number;
  tags: string[];
}

export interface SolutionCostBreakdown {
  label: string;
  amount: string;
  ratio: string;
  note: string;
}

export interface SolutionVersionRecord {
  version: string;
  updatedAt: string;
  operator: string;
  action: string;
  note: string;
}

export interface SolutionDetail {
  solutionId: number;
  solutionName: string;
  sceneTag: string;
  industryTag: string;
  sourceFile: string;
  owner: string;
  source: SolutionSource;
  status: SolutionStatus;
  budget: string;
  totalCost: string;
  confirmedRate: string;
  itemCount: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  items: SolutionDetailItem[];
  costBreakdown: SolutionCostBreakdown[];
  versions: SolutionVersionRecord[];
}
