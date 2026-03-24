import { Link } from "react-router-dom";

type TopbarProps = {
  title: string;
  description: string;
};

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar__copy">
        <div className="topbar__eyebrowRow">
          <p className="topbar__eyebrow">运营工作台</p>
          <span className="topbar__statusPill">实时联动</span>
        </div>
        <div className="topbar__headingRow">
          <div className="topbar__headline">
            <h1>{title}</h1>
            <p className="topbar__description">{description}</p>
          </div>
          <div className="topbar__meta">
            <span className="topbar__metaLabel">当前范围</span>
            <strong>商品 / 成本 / 方案 / AI</strong>
          </div>
        </div>
      </div>
      <div className="topbar__actions">
        <Link className="action-button action-button--secondary" to="/solutions/import">
          上传方案
        </Link>
        <Link className="action-button" to="/ai">
          打开 AI 生成
        </Link>
      </div>
    </header>
  );
}
