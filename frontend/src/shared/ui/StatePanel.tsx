import type { ReactNode } from "react";

type StateTone = "neutral" | "warning" | "danger" | "success";

const toneStyles: Record<StateTone, { background: string; border: string; accent: string }> = {
  neutral: {
    background: "rgba(255, 255, 255, 0.84)",
    border: "rgba(219, 227, 238, 1)",
    accent: "#0f766e",
  },
  warning: {
    background: "rgba(255, 244, 221, 0.84)",
    border: "rgba(239, 201, 147, 0.8)",
    accent: "#a16207",
  },
  danger: {
    background: "rgba(255, 235, 231, 0.86)",
    border: "rgba(244, 170, 152, 0.8)",
    accent: "#b91c1c",
  },
  success: {
    background: "rgba(234, 247, 239, 0.86)",
    border: "rgba(178, 225, 197, 0.8)",
    accent: "#166534",
  },
};

export function StatePanel({
  title,
  description,
  tone = "neutral",
  action,
}: {
  title: string;
  description: string;
  tone?: StateTone;
  action?: ReactNode;
}) {
  const theme = toneStyles[tone];

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 20,
        border: `1px solid ${theme.border}`,
        background: theme.background,
        display: "grid",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          width: "fit-content",
          borderRadius: 999,
          padding: "6px 10px",
          background: "rgba(255,255,255,0.7)",
          color: theme.accent,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div style={{ color: "#405064", lineHeight: 1.7 }}>{description}</div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

