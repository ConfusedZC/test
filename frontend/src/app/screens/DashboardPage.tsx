import { Link } from "react-router-dom";

const summaryCards = [
  {
    label: "待确认匹配",
    value: "12",
    tone: "accent",
    to: "/solutions/review",
    hint: "进入方案待确认队列",
  },
  {
    label: "待补成本",
    value: "8",
    tone: "warning",
    to: "/catalog/issues",
    hint: "查看缺成本与数据异常",
  },
  {
    label: "今日导入",
    value: "3",
    tone: "neutral",
    to: "/catalog/imports",
    hint: "回看最新导入批次",
  },
  {
    label: "AI 草案",
    value: "5",
    tone: "accent",
    to: "/ai",
    hint: "打开生成工作台",
  },
] as const;

const recentSolutions = [
  { id: 1088, name: "政企机房基础方案", scene: "机房", totalCost: "298,000", pending: 2 },
  { id: 1086, name: "KA 渠道补货方案", scene: "零售", totalCost: "86,400", pending: 0 },
  { id: 1083, name: "洗护礼盒组合方案", scene: "商超", totalCost: "152,800", pending: 4 },
];

const recentAlerts = [
  "商品导入预检发现 40 组重复条码，建议优先清洗。",
  "状态数据缺映射已压到 0，但仍有 19 条占位引用被忽略。",
  "两条方案明细待人工确认，建议先处理后再生成 PPT。",
];

const quickActions = [
  {
    title: "新建商品",
    description: "进入商品列表并维护基础信息",
    meta: "主数据维护",
    to: "/catalog",
  },
  {
    title: "临时核价",
    description: "粘贴商品清单，直接看匹配来源和真实成本",
    meta: "快速报价",
    to: "/catalog/pricing",
  },
  {
    title: "上传方案",
    description: "导入 `.xlsx` 或 `.csv` 并查看解析状态",
    meta: "方案入口",
    to: "/solutions/import",
  },
  {
    title: "打开 AI 生成",
    description: "输入需求并直接产出方案草案",
    meta: "智能工作台",
    to: "/ai",
  },
  {
    title: "查看待确认项",
    description: "处理低置信度匹配和未确认明细",
    meta: "人工复核",
    to: "/solutions/review",
  },
] as const;

export function DashboardPage() {
  return (
    <div className="page-grid">
      <section className="card card--hero dashboard-hero">
        <div className="dashboard-hero__intro">
          <div className="dashboard-hero__masthead">
            <div className="eyebrow">今日总览</div>
            <span className="dashboard-hero__stamp">Enterprise Desk</span>
          </div>
          <h2 className="hero-title">把商品、成本、方案和 AI 放进同一条稳定的业务主线里。</h2>
          <p className="hero-copy">
            首页不堆报表和装饰，只保留今天最需要处理的待办、快捷入口和最近业务，让商品、采购、售前和方案人员更快进入工作状态。
          </p>
          <div className="dashboard-command-strip">
            <article className="dashboard-command-strip__item">
              <span>业务原则</span>
              <strong>先处理待确认，再出方案和 PPT</strong>
            </article>
            <article className="dashboard-command-strip__item">
              <span>数据口径</span>
              <strong>真实成本、真实映射、真实商品主数据</strong>
            </article>
            <article className="dashboard-command-strip__item">
              <span>当前目标</span>
              <strong>让核价、方案和 AI 使用同一条数据主线</strong>
            </article>
          </div>
          <div className="dashboard-hero__actions">
            <Link className="hero-action hero-action--primary" to="/solutions/review">
              处理待确认匹配
            </Link>
            <Link className="hero-action hero-action--secondary" to="/catalog/issues">
              查看待补成本
            </Link>
          </div>
          <div className="dashboard-hero__signals">
            <article className="dashboard-signal">
              <span>今日重心</span>
              <strong>先处理待确认与缺成本，再出方案</strong>
            </article>
            <article className="dashboard-signal">
              <span>工作方式</span>
              <strong>不堆报表，优先跳到能直接处理的页面</strong>
            </article>
            <article className="dashboard-signal">
              <span>统一口径</span>
              <strong>真实成本、真实匹配、真实方案记录</strong>
            </article>
          </div>
        </div>

        <div className="dashboard-hero__panel">
          <div className="dashboard-hero__panel-head">
            <span>今日工作台</span>
            <strong>4 个关键入口</strong>
          </div>
          <div className="summary-grid summary-grid--interactive">
            {summaryCards.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`summary-card summary-card--${item.tone} summary-card--link`}
              >
                <span className="summary-card__label">{item.label}</span>
                <strong className="summary-card__value">{item.value}</strong>
                <span className="summary-card__hint">{item.hint}</span>
                <span className="summary-card__arrow">↗</span>
              </Link>
            ))}
          </div>
          <div className="dashboard-hero__rail">
            {recentAlerts.slice(0, 2).map((item) => (
              <article key={item} className="dashboard-hero__railItem">
                <span className="dashboard-hero__railDot" />
                <span>{item}</span>
              </article>
            ))}
          </div>
          <div className="dashboard-hero__footnote">
            先把数据口径收稳，再继续往方案与 AI 生成链路推进。
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h3>快捷入口</h3>
            <p>只保留今天最常用、最接近处理动作的入口。</p>
          </div>
        </div>
        <div className="quick-actions">
          {quickActions.map((item, index) => (
            <Link
              className={`quick-action ${index === 0 ? "quick-action--featured" : ""}`}
              key={item.title}
              to={item.to}
            >
              <span className="quick-action__meta">{item.meta}</span>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="dashboard-secondary-grid">
        <section className="card">
          <div className="section-head">
            <div>
              <h3>最近方案</h3>
              <p>优先展示总成本和待确认条数，方便快速回看。</p>
            </div>
            <Link className="text-link" to="/solutions">
              查看全部
            </Link>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>方案</th>
                  <th>场景</th>
                  <th>总成本</th>
                  <th>待确认</th>
                </tr>
              </thead>
              <tbody>
                {recentSolutions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link className="table-title table-title--link" to={`/solutions/${item.id}`}>
                        {item.name}
                      </Link>
                      <div className="table-subtle">ID {item.id}</div>
                    </td>
                    <td>{item.scene}</td>
                    <td>{item.totalCost}</td>
                    <td>
                      <span className={`tag ${item.pending ? "tag--warning" : "tag--success"}`}>
                        {item.pending}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card card--tint">
          <div className="section-head">
            <div>
              <h3>近期提醒</h3>
              <p>把会影响业务质量的数据问题直接放在首页。</p>
            </div>
          </div>
          <div className="alert-list">
            {recentAlerts.map((item) => (
              <article key={item} className="alert-item">
                <span className="alert-item__dot" />
                <span>{item}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
