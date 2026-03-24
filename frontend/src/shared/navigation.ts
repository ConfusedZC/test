export type NavigationItem = {
  label: string;
  compactLabel: string;
  to: string;
  description: string;
  icon: "home" | "catalog" | "solutions" | "ai";
};

export const navigationItems: NavigationItem[] = [
  {
    label: "首页",
    compactLabel: "首页",
    to: "/",
    description: "待办、快捷入口和最近方案",
    icon: "home",
  },
  {
    label: "商品与成本",
    compactLabel: "商成",
    to: "/catalog",
    description: "维护商品主数据、成本和异常项",
    icon: "catalog",
  },
  {
    label: "方案",
    compactLabel: "方案",
    to: "/solutions",
    description: "导入、确认、查看和重算方案",
    icon: "solutions",
  },
  {
    label: "AI 生成",
    compactLabel: "AI",
    to: "/ai",
    description: "输入需求并生成方案草案",
    icon: "ai",
  },
];
