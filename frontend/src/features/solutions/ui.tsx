import React from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "accent";

type TimelineTone = "neutral" | "success" | "warning" | "danger";

const theme = {
  bg: "#eef3f8",
  panel: "#ffffff",
  panelSoft: "#f6fafc",
  line: "#d9e3ef",
  lineSoft: "rgba(15, 23, 42, 0.08)",
  text: "#132031",
  muted: "#627487",
  accent: "#0f766e",
  accentDeep: "#0a5e58",
  success: "#177245",
  warning: "#c98313",
  danger: "#c24132",
  shadow: "0 18px 38px rgba(15, 23, 42, 0.07)",
};

export function AppSurface({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={surfaceStyle}>
      <div style={shellStyle}>
        <header style={heroStyle}>
          <div style={heroMainStyle}>
            {eyebrow ? <div style={eyebrowStyle}>{eyebrow}</div> : null}
            <h1 style={titleStyle}>{title}</h1>
            <p style={subtitleStyle}>{subtitle}</p>
          </div>
          {actions ? <div style={actionsStyle}>{actions}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
}

export function Grid({
  children,
  gap = 16,
}: {
  children: React.ReactNode;
  gap?: number;
}) {
  return <div style={{ ...gridStyle, gap }}>{children}</div>;
}

export function Card({
  title,
  subtitle,
  action,
  accent = false,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section style={{ ...cardStyle, ...(accent ? cardAccentStyle : null) }}>
      <div style={cardHeaderStyle}>
        <div>
          <h2 style={cardTitleStyle}>{title}</h2>
          {subtitle ? <p style={cardSubtitleStyle}>{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function SummaryCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: BadgeTone;
}) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryLabelStyle}>{label}</div>
      <div style={summaryValueStyle}>{value}</div>
      {hint ? <div style={summaryHintStyle}>{hint}</div> : null}
      <div style={{ ...badgeStyle, ...badgeToneStyle[tone] }}>{label}</div>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return <span style={{ ...badgeStyle, ...badgeToneStyle[tone] }}>{children}</span>;
}

export function Table({
  columns,
  rows,
  emptyText = "暂无数据",
}: {
  columns: string[];
  rows: React.ReactNode[];
  emptyText?: string;
}) {
  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} style={thStyle}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td style={emptyCellStyle} colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Drawer({
  title,
  subtitle,
  open = true,
  children,
}: {
  title: string;
  subtitle?: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <aside style={drawerStyle}>
      <div style={drawerHeaderStyle}>
        <h3 style={drawerTitleStyle}>{title}</h3>
        {subtitle ? <p style={drawerSubtitleStyle}>{subtitle}</p> : null}
      </div>
      {children}
    </aside>
  );
}

export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div style={tabBarStyle}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          style={tab === active ? activeTabStyle : tabStyle}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div style={emptyStateStyle}>
      <div style={emptyTitleStyle}>{title}</div>
      <div style={emptySubtitleStyle}>{subtitle}</div>
    </div>
  );
}

export function DefinitionList({
  items,
}: {
  items: { label: string; value: React.ReactNode; hint?: string }[];
}) {
  return (
    <dl style={definitionListStyle}>
      {items.map((item) => (
        <div key={item.label} style={definitionItemStyle}>
          <dt style={definitionLabelStyle}>{item.label}</dt>
          <dd style={definitionValueStyle}>{item.value}</dd>
          {item.hint ? <div style={definitionHintStyle}>{item.hint}</div> : null}
        </div>
      ))}
    </dl>
  );
}

export function Timeline({
  items,
}: {
  items: { title: string; description: string; meta?: string; tone?: TimelineTone }[];
}) {
  return (
    <div style={timelineStyle}>
      {items.map((item) => (
        <div key={`${item.title}-${item.meta ?? ""}`} style={timelineItemStyle}>
          <div style={{ ...timelineDotStyle, ...timelineToneStyle[item.tone ?? "neutral"] }} />
          <div style={timelineContentStyle}>
            <div style={timelineTitleRowStyle}>
              <strong>{item.title}</strong>
              {item.meta ? <span style={timelineMetaStyle}>{item.meta}</span> : null}
            </div>
            <div style={timelineDescriptionStyle}>{item.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const actionButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 14,
  padding: "11px 16px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#fff",
  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDeep})`,
  boxShadow: "0 12px 24px rgba(37, 99, 235, 0.18)",
};

export const secondaryButtonStyle: React.CSSProperties = {
  borderRadius: 14,
  padding: "11px 16px",
  fontWeight: 700,
  cursor: "pointer",
  color: theme.text,
  background: "#fff",
  border: `1px solid ${theme.line}`,
  boxShadow: "none",
};

export const tertiaryButtonStyle: React.CSSProperties = {
  borderRadius: 14,
  padding: "11px 16px",
  fontWeight: 700,
  cursor: "pointer",
  color: theme.accentDeep,
  background: "rgba(37, 99, 235, 0.08)",
  border: "1px solid transparent",
};

const surfaceStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: 24,
  color: theme.text,
  background:
    "radial-gradient(circle at top left, rgba(15, 118, 110, 0.1), transparent 24rem), linear-gradient(180deg, #f6f9fc 0%, #eef3f8 44%, #e8eef4 100%)",
  fontFamily:
    '"Avenir Next", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif',
};

const shellStyle: React.CSSProperties = {
  width: "min(1440px, 100%)",
  margin: "0 auto",
};

const heroStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 24,
  marginBottom: 22,
  padding: 26,
  borderRadius: 30,
  background:
    "radial-gradient(circle at top left, rgba(15, 118, 110, 0.12), transparent 22rem), linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,249,252,0.94))",
  border: `1px solid ${theme.lineSoft}`,
  boxShadow: theme.shadow,
};

const heroMainStyle: React.CSSProperties = {
  maxWidth: 860,
};

const eyebrowStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 12px",
  borderRadius: 999,
  color: theme.accentDeep,
  background: "rgba(15, 118, 110, 0.08)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  margin: "14px 0 10px",
  fontFamily: '"Iowan Old Style", "Noto Serif SC", "Songti SC", Georgia, serif',
  fontSize: "clamp(30px, 4vw, 42px)",
  lineHeight: 1.04,
  letterSpacing: "-0.04em",
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: theme.muted,
  fontSize: 15,
  lineHeight: 1.8,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 12,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
};

const cardStyle: React.CSSProperties = {
  gridColumn: "span 12",
  padding: 22,
  borderRadius: 26,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,250,253,0.95))",
  border: `1px solid ${theme.lineSoft}`,
  boxShadow: theme.shadow,
};

const cardAccentStyle: React.CSSProperties = {
  background: theme.panelSoft,
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  marginBottom: 16,
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: '"Iowan Old Style", "Noto Serif SC", "Songti SC", Georgia, serif',
  fontSize: 20,
  letterSpacing: "-0.03em",
};

const cardSubtitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: theme.muted,
  lineHeight: 1.7,
};

const summaryCardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(247,250,253,0.95))",
  border: `1px solid ${theme.lineSoft}`,
  boxShadow: "0 12px 26px rgba(15, 23, 42, 0.05)",
};

const summaryLabelStyle: React.CSSProperties = {
  color: theme.muted,
  fontSize: 13,
};

const summaryValueStyle: React.CSSProperties = {
  marginTop: 8,
  fontFamily: '"Iowan Old Style", "Noto Serif SC", "Songti SC", Georgia, serif',
  fontSize: 28,
  fontWeight: 800,
  letterSpacing: "-0.04em",
};

const summaryHintStyle: React.CSSProperties = {
  marginTop: 6,
  color: theme.muted,
  fontSize: 13,
  lineHeight: 1.6,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  marginTop: 14,
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const badgeToneStyle: Record<BadgeTone, React.CSSProperties> = {
  neutral: { color: theme.accentDeep, background: "rgba(15, 118, 110, 0.08)" },
  success: { color: theme.success, background: "rgba(5, 150, 105, 0.1)" },
  warning: { color: theme.warning, background: "rgba(217, 119, 6, 0.12)" },
  danger: { color: theme.danger, background: "rgba(220, 38, 38, 0.12)" },
  accent: { color: "#fff", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDeep})` },
};

const tableWrapStyle: React.CSSProperties = {
  overflow: "auto",
  borderRadius: 20,
  border: `1px solid ${theme.lineSoft}`,
  background: "rgba(255,255,255,0.94)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle: React.CSSProperties = {
  padding: "13px 14px",
  textAlign: "left",
  whiteSpace: "nowrap",
  fontWeight: 700,
  color: theme.muted,
  background: "rgba(15, 118, 110, 0.05)",
  borderBottom: `1px solid ${theme.lineSoft}`,
};

const emptyCellStyle: React.CSSProperties = {
  padding: "28px 14px",
  textAlign: "center",
  color: theme.muted,
};

const drawerStyle: React.CSSProperties = {
  position: "sticky",
  top: 24,
  alignSelf: "start",
  padding: 20,
  borderRadius: 24,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,250,253,0.95))",
  border: `1px solid ${theme.lineSoft}`,
  boxShadow: theme.shadow,
};

const drawerHeaderStyle: React.CSSProperties = {
  marginBottom: 14,
};

const drawerTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
};

const drawerSubtitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: theme.muted,
  lineHeight: 1.7,
};

const tabBarStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 16,
};

const tabStyle: React.CSSProperties = {
  border: `1px solid ${theme.line}`,
  borderRadius: 999,
  padding: "10px 14px",
  background: "rgba(255,255,255,0.92)",
  color: theme.text,
  cursor: "pointer",
  fontWeight: 700,
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  borderColor: "transparent",
  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDeep})`,
  color: "#fff",
};

const emptyStateStyle: React.CSSProperties = {
  padding: 28,
  borderRadius: 20,
  background: "rgba(255,255,255,0.94)",
  border: `1px dashed ${theme.line}`,
  textAlign: "center",
};

const emptyTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 16,
};

const emptySubtitleStyle: React.CSSProperties = {
  marginTop: 8,
  color: theme.muted,
  lineHeight: 1.7,
};

const definitionListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const definitionItemStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 18,
  background: "rgba(255,255,255,0.94)",
  border: `1px solid ${theme.lineSoft}`,
};

const definitionLabelStyle: React.CSSProperties = {
  color: theme.muted,
  fontSize: 12,
  marginBottom: 6,
};

const definitionValueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: theme.text,
};

const definitionHintStyle: React.CSSProperties = {
  marginTop: 6,
  color: theme.muted,
  fontSize: 13,
  lineHeight: 1.6,
};

const timelineStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const timelineItemStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "12px 1fr",
  gap: 12,
  alignItems: "start",
};

const timelineDotStyle: React.CSSProperties = {
  marginTop: 6,
  width: 12,
  height: 12,
  borderRadius: 999,
  background: theme.accent,
  boxShadow: "0 0 0 5px rgba(37, 99, 235, 0.08)",
};

const timelineToneStyle: Record<TimelineTone, React.CSSProperties> = {
  neutral: { background: theme.accent, boxShadow: "0 0 0 5px rgba(37, 99, 235, 0.08)" },
  success: { background: theme.success, boxShadow: "0 0 0 5px rgba(5, 150, 105, 0.1)" },
  warning: { background: theme.warning, boxShadow: "0 0 0 5px rgba(217, 119, 6, 0.1)" },
  danger: { background: theme.danger, boxShadow: "0 0 0 5px rgba(220, 38, 38, 0.1)" },
};

const timelineContentStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 18,
  border: `1px solid ${theme.lineSoft}`,
  background: "rgba(255,255,255,0.95)",
};

const timelineTitleRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const timelineMetaStyle: React.CSSProperties = {
  color: theme.muted,
  fontSize: 12,
};

const timelineDescriptionStyle: React.CSSProperties = {
  marginTop: 8,
  color: theme.muted,
  lineHeight: 1.65,
  fontSize: 13,
};
