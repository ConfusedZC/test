export type ProductStatus = "active" | "draft" | "archived";
export type CostSource = "manual" | "import" | "legacy" | "agent";
export type QualitySeverity = "high" | "medium" | "low";

export interface ProductSummary {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: string;
  spec: string;
  boxSpec: string;
  currentCost: string;
  status: ProductStatus;
  updatedAt: string;
  aliasCount: number;
  imageCount: number;
}

export interface ProductDetail extends ProductSummary {
  unit: string;
  material: string;
  series: string;
  note: string;
  aliases: ProductAlias[];
  images: ProductImage[];
  costHistory: CostRecord[];
  matchHistory: MatchRecord[];
}

export interface ProductAlias {
  id: string;
  aliasName: string;
  aliasType: "manual" | "auto" | "legacy";
  confidence: string;
  source: string;
}

export interface ProductImage {
  id: string;
  preview: string;
  label: string;
}

export interface CostRecord {
  id: string;
  effectiveTime: string;
  cost: string;
  supplier: string;
  source: CostSource;
  operator: string;
  note: string;
}

export interface MatchRecord {
  id: string;
  rawName: string;
  matchedName: string;
  score: string;
  method: string;
  status: "confirmed" | "review" | "rejected";
  createdAt: string;
}

export interface ImportBatch {
  id: string;
  fileName: string;
  importType: "product" | "cost" | "solution";
  totalCount: number;
  successCount: number;
  failedCount: number;
  status: "success" | "warning" | "failed";
  createdAt: string;
  reportLabel: string;
}

export interface DataIssue {
  id: string;
  title: string;
  productName: string;
  brand: string;
  category: string;
  currentCost: string;
  severity: QualitySeverity;
  issueType: "missing_barcode" | "missing_cost" | "duplicate_barcode" | "name_conflict";
  suggestedAction: string;
}
