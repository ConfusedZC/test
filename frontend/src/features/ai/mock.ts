export type AiWorkspaceProductItem = {
  productName: string;
  brand: string;
  quantity: number;
  unit: string;
  unitCost: number;
  subtotalCost: number;
  matchMethod: string;
  confidence: number;
};

export type AiWorkspaceRiskItem = {
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
};

export type AiWorkspaceHistoryItem = {
  id: string;
  caseId: string;
  title: string;
  scene: string;
  industry: string;
  totalCost: number;
  updatedAt: string;
};

export type AiWorkspaceCase = {
  id: string;
  title: string;
  scene: string;
  industry: string;
  budgetRange: string;
  styleTags: string[];
  summary: string;
  products: AiWorkspaceProductItem[];
  risks: AiWorkspaceRiskItem[];
  recommendations: string[];
  history: AiWorkspaceHistoryItem[];
};

export const aiWorkspaceCases: AiWorkspaceCase[] = [
  {
    id: "office-network-v1",
    title: "政企办公网络标准方案",
    scene: "办公园区",
    industry: "政企",
    budgetRange: "20 - 50 万",
    styleTags: ["稳健", "高可用", "易运维"],
    summary:
      "围绕中小型政企办公园区构建核心网络、接入网络和基础安全能力，优先采用成熟型号，保证可交付性和后续扩展空间。",
    products: [
      {
        productName: "H3C 48口千兆交换机",
        brand: "H3C",
        quantity: 4,
        unit: "台",
        unitCost: 6800,
        subtotalCost: 27200,
        matchMethod: "manual+rule",
        confidence: 0.97,
      },
      {
        productName: "42U 标准机柜",
        brand: "通用",
        quantity: 2,
        unit: "台",
        unitCost: 1480,
        subtotalCost: 2960,
        matchMethod: "exact",
        confidence: 0.99,
      },
      {
        productName: "入门级防火墙",
        brand: "H3C",
        quantity: 1,
        unit: "台",
        unitCost: 18600,
        subtotalCost: 18600,
        matchMethod: "vector",
        confidence: 0.84,
      },
    ],
    risks: [
      {
        title: "预算偏紧",
        detail: "当前方案已接近预算上限，若增加备件或冗余设备，需要同步调整品牌或型号档位。",
        severity: "medium",
      },
      {
        title: "部分项待确认",
        detail: "防火墙存在候选商品，需要在方案详情中二次确认后再定稿。",
        severity: "high",
      },
    ],
    recommendations: [
      "优先确认防火墙候选商品，避免后续重算扰动总成本。",
      "若客户更看重交付速度，可保留现有品牌组合；若更看重预算，可下调部分接入设备规格。",
    ],
    history: [
      {
        id: "case-0323-01",
        caseId: "office-network-v1",
        title: "政企办公网络标准方案",
        scene: "办公园区",
        industry: "政企",
        totalCost: 58760,
        updatedAt: "10:12",
      },
      {
        id: "case-0323-02",
        caseId: "machine-room-v1",
        title: "中小型机房基础方案",
        scene: "机房",
        industry: "政企",
        totalCost: 153400,
        updatedAt: "09:48",
      },
      {
        id: "case-0323-03",
        caseId: "office-network-v1",
        title: "制造业无线覆盖方案",
        scene: "厂区",
        industry: "制造",
        totalCost: 86320,
        updatedAt: "昨天",
      },
    ],
  },
  {
    id: "machine-room-v1",
    title: "中小型机房扩容方案",
    scene: "机房",
    industry: "政企",
    budgetRange: "30 - 80 万",
    styleTags: ["高稳定", "可扩容", "成本可控"],
    summary:
      "面向小型机房扩容，强调计算、存储、交换与基础安全能力，保留一定冗余，便于后续扩容。",
    products: [
      {
        productName: "42U 标准机柜",
        brand: "通用",
        quantity: 3,
        unit: "台",
        unitCost: 1480,
        subtotalCost: 4440,
        matchMethod: "exact",
        confidence: 0.99,
      },
      {
        productName: "核心交换机",
        brand: "H3C",
        quantity: 2,
        unit: "台",
        unitCost: 28600,
        subtotalCost: 57200,
        matchMethod: "mixed",
        confidence: 0.91,
      },
      {
        productName: "服务器基础配置",
        brand: "H3C",
        quantity: 6,
        unit: "台",
        unitCost: 33800,
        subtotalCost: 202800,
        matchMethod: "vector",
        confidence: 0.87,
      },
    ],
    risks: [
      {
        title: "服务器成本占比高",
        detail: "若预算有上限，需要通过品牌切换或数量调整进行收敛。",
        severity: "medium",
      },
    ],
    recommendations: [
      "如果客户要求更稳，可保留当前配置并补冗余电源。",
      "如果客户优先预算，可将服务器部分替换为更低规格候选。",
    ],
    history: [
      {
        id: "case-0323-04",
        caseId: "machine-room-v1",
        title: "中小型机房扩容方案",
        scene: "机房",
        industry: "政企",
        totalCost: 266440,
        updatedAt: "08:56",
      },
      {
        id: "case-0323-05",
        caseId: "office-network-v1",
        title: "教育网络升级方案",
        scene: "校园",
        industry: "教育",
        totalCost: 118000,
        updatedAt: "昨天",
      },
    ],
  },
];
