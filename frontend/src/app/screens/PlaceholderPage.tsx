type PlaceholderPageProps = {
  kind: string;
};

export function PlaceholderPage({ kind }: PlaceholderPageProps) {
  return (
    <div className="page-grid">
      <section className="card card--placeholder">
        <div className="eyebrow">Feature Slot</div>
        <h2 className="placeholder-title">{kind} 页面正在接入正式实现</h2>
        <p className="placeholder-copy">
          这一页的统一后台壳子、路由和样式已经准备好。对应业务页面会由各模块工程师补进来，再统一接入真实接口。
        </p>
        <div className="placeholder-checklist">
          <div className="placeholder-checklist__item">统一的左侧导航和顶部页头已就绪</div>
          <div className="placeholder-checklist__item">页面信息架构已按 V1 规划落定</div>
          <div className="placeholder-checklist__item">后续将替换为真实业务表格、详情和抽屉编辑</div>
        </div>
      </section>
    </div>
  );
}
