import { ReactNode, useEffect, useState } from "react";

import { NavigationItem } from "../navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  navigationItems: NavigationItem[];
  title: string;
  description: string;
  children: ReactNode;
};

export function AppShell({ navigationItems, title, description, children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("cost-agent.sidebar.collapsed") === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("cost-agent.sidebar.collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  return (
    <div className={`app-shell ${sidebarCollapsed ? "app-shell--sidebar-collapsed" : ""}`}>
      <div className="app-shell__ambient" aria-hidden="true" />
      <Sidebar
        navigationItems={navigationItems}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />
      <div className="app-shell__main">
        <div className="app-shell__topbarWrap">
          <Topbar title={title} description={description} />
        </div>
        <main className="app-shell__content">
          <div className="app-shell__contentInner">{children}</div>
        </main>
      </div>
    </div>
  );
}
