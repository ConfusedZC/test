import { NavLink } from "react-router-dom";

import { NavigationItem } from "../navigation";

type SidebarProps = {
  navigationItems: NavigationItem[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

function SidebarIcon(props: { icon: NavigationItem["icon"] }) {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  } as const;

  switch (props.icon) {
    case "home":
      return (
        <svg {...commonProps}>
          <path d="M4 10.5 12 4l8 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 9.5v9h11v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 18.5v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "catalog":
      return (
        <svg {...commonProps}>
          <path d="M5.5 8.5 12 5l6.5 3.5L12 12 5.5 8.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M5.5 8.5V16L12 19.5 18.5 16V8.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 12v7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "solutions":
      return (
        <svg {...commonProps}>
          <path d="M8 4.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-8A2.5 2.5 0 0 1 6 18V6.5A2 2 0 0 1 8 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 4.5V9h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 12.5h6M9 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "ai":
      return (
        <svg {...commonProps}>
          <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6.5 6.5l2.8 2.8M14.7 14.7l2.8 2.8M17.5 6.5l-2.8 2.8M9.3 14.7l-2.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar({ navigationItems, collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar__brand">
        <div className="sidebar__brandMark">
          <div className="sidebar__logo">CA</div>
          {!collapsed ? (
            <div className="sidebar__brandCopy">
              <strong>Cost Agent</strong>
              <p className="sidebar__brandScope">商品 · 成本 · 方案 · AI</p>
            </div>
          ) : null}
        </div>
        <button
          className="sidebar__toggle"
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
          title={collapsed ? "展开侧栏" : "收起侧栏"}
          aria-pressed={collapsed}
        >
          <svg
            className="sidebar__toggleIcon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="1.75"
              y="2"
              width="12.5"
              height="12"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d={collapsed ? "M5 4.75v6.5" : "M6.5 4.75v6.5"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {collapsed ? <rect x="3.25" y="4.25" width="1.5" height="7.5" rx="0.75" fill="currentColor" opacity="0.92" /> : null}
          </svg>
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="主导航">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""} ${
                collapsed ? "sidebar__link--collapsed" : ""
              }`
            }
            to={item.to}
            title={`${item.label} · ${item.description}`}
          >
            <span className="sidebar__linkIcon" aria-hidden="true">
              <SidebarIcon icon={item.icon} />
            </span>
            <span className="sidebar__linkBody">
              <strong>{collapsed ? item.compactLabel : item.label}</strong>
              {!collapsed ? <span>{item.description}</span> : null}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className={`sidebar__foot ${collapsed ? "sidebar__foot--compact" : ""}`}>
        <span className="sidebar__hint">{collapsed ? "V1" : "V1 精简版"}</span>
        <p>{collapsed ? "主链路" : "先让商品、方案和 AI 主链路真正可用。"}</p>
      </div>
    </aside>
  );
}
