import type { ReactNode } from "react";
import type { QualitySeverity } from "./types";

const severityStyles: Record<QualitySeverity, { label: string; tone: string }> = {
  high: { label: "高", tone: "danger" },
  medium: { label: "中", tone: "warning" },
  low: { label: "低", tone: "neutral" },
};

export function SectionCard(props: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="pc-card">
      <div className="pc-card__header">
        <div>
          <h2>{props.title}</h2>
          {props.description ? <p>{props.description}</p> : null}
        </div>
        {props.action ? <div>{props.action}</div> : null}
      </div>
      {props.children}
    </section>
  );
}

export function SummaryPill(props: { label: string; value: string }) {
  return (
    <div className="pc-pill">
      <span>{props.label}</span>
      <strong>{props.value}</strong>
    </div>
  );
}

export function StatusBadge(props: { severity: QualitySeverity; children: ReactNode }) {
  const meta = severityStyles[props.severity];
  return <span className={`pc-badge pc-badge--${meta.tone}`}>{props.children ?? meta.label}</span>;
}

export function DataTable(props: {
  columns: string[];
  rows: ReactNode[][];
  emptyText?: string;
}) {
  return (
    <div className="pc-tableWrap">
      <table className="pc-table">
        <thead>
          <tr>
            {props.columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.length ? (
            props.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="pc-empty" colSpan={props.columns.length}>
                {props.emptyText || "暂无数据"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
