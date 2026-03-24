import React from "react";

import {
  fetchPricingPptTaskStatus,
  fetchPricingPptTemplates,
  generatePricingPpt,
  type PricingPptPanelItem,
  type PricingPptTaskView,
  type PricingPptTemplateOption,
} from "./pptApi";
import { SectionCard } from "./ui";
import { StatePanel } from "../../shared/ui/StatePanel";
import "./styles.css";

export type PptGenerationPanelProps = {
  items: PricingPptPanelItem[];
  quotePoints: number | null;
  defaultTitle?: string;
  defaultCustomerName?: string;
  onTaskCreated?: (task: PricingPptTaskView) => void;
};

export function PptGenerationPanel({
  items,
  quotePoints,
  defaultTitle = "临时核价报价单",
  defaultCustomerName = "",
  onTaskCreated,
}: PptGenerationPanelProps) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [customerName, setCustomerName] = React.useState(defaultCustomerName);
  const [templates, setTemplates] = React.useState<PricingPptTemplateOption[]>([]);
  const [recommendedTemplateKey, setRecommendedTemplateKey] = React.useState<string | null>(null);
  const [recommendationTags, setRecommendationTags] = React.useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("default");
  const [loadingTemplates, setLoadingTemplates] = React.useState(true);
  const [templateError, setTemplateError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [task, setTask] = React.useState<PricingPptTaskView | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadTemplates() {
      setLoadingTemplates(true);
      setTemplateError(null);

      try {
        const nextTemplateView = await fetchPricingPptTemplates(controller.signal);
        if (!isActive) {
          return;
        }
        setTemplates(nextTemplateView.templates);
        setRecommendedTemplateKey(nextTemplateView.recommendedTemplateKey);
        setRecommendationTags(nextTemplateView.reasonTags);
        setSelectedTemplateId((current) =>
          nextTemplateView.templates.some((template) => template.templateId === current)
            ? current
            : nextTemplateView.templates.find((template) => template.templateKey === nextTemplateView.recommendedTemplateKey)?.templateId ??
              nextTemplateView.templates[0]?.templateId ??
              "default",
        );
      } catch (error_) {
        if (!isActive) {
          return;
        }
        setTemplateError(error_ instanceof Error ? error_.message : "加载 PPT 模板失败");
        setTemplates([]);
        setRecommendedTemplateKey(null);
        setRecommendationTags([]);
      } finally {
        if (isActive) {
          setLoadingTemplates(false);
        }
      }
    }

    loadTemplates();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  const selectedTemplate = templates.find((template) => template.templateId === selectedTemplateId) ?? null;
  const recommendedTemplate =
    recommendedTemplateKey == null ? null : templates.find((template) => template.templateKey === recommendedTemplateKey) ?? null;
  const itemCount = items.length;
  const warningCount = items.reduce((sum, item) => sum + (item.warnings?.length ?? 0), 0);
  const statusMeta = getTaskStatusMeta(task?.status ?? null);

  async function handleGenerate() {
    if (items.length === 0) {
      setError("当前还没有核价结果，暂时不能生成 PPT。");
      return;
    }
    if (!title.trim()) {
      setError("请先填写 PPT 标题。");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const nextTask = await generatePricingPpt({
        title: title.trim(),
        customerName: customerName.trim(),
        templatePath: selectedTemplate?.templatePath ?? null,
        quotePoints,
        items,
      });
      setTask(nextTask);
      setSuccessMessage("PPT 生成任务已提交，可以继续刷新状态或直接下载。");
      onTaskCreated?.(nextTask);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "提交 PPT 生成任务失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefreshStatus() {
    if (!task?.taskId) {
      return;
    }

    setStatusLoading(true);
    setError(null);

    try {
      const nextTask = await fetchPricingPptTaskStatus(task.taskId);
      setTask(nextTask);
      onTaskCreated?.(nextTask);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "刷新 PPT 状态失败");
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <SectionCard
      title="PPT 生成"
      description="基于当前临时核价结果生成报价 PPT，可直接选择模板、提交任务、查看状态并下载。"
    >
      <div className="pc-ppt-panel">
        <div className="pc-ppt-panel__summary">
          <div className="pc-pill">
            <span>核价条目</span>
            <strong>{itemCount}</strong>
          </div>
          <div className="pc-pill">
            <span>报价点数</span>
            <strong>{formatQuotePoints(quotePoints)}</strong>
          </div>
          <div className="pc-pill">
            <span>风险提醒</span>
            <strong>{warningCount}</strong>
          </div>
        </div>

        {itemCount === 0 ? (
          <StatePanel
            title="等待核价结果"
            description="先完成一次临时核价，这里才会基于当前结果生成报价 PPT。"
            tone="neutral"
          />
        ) : null}

        {warningCount > 0 ? (
          <div className="pc-ppt-panel__hint">
            当前结果里有 {warningCount} 条提醒项，生成 PPT 时会按现有核价结果和提示一起导出。
          </div>
        ) : null}

        <div className="pc-ppt-panel__form">
          <label className="pc-field">
            <span>标题</span>
            <input className="pc-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：华东 KA 客户临时报价单" />
          </label>
          <label className="pc-field">
            <span>客户名</span>
            <input className="pc-input" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="例如：上海某 KA 客户" />
          </label>
          <label className="pc-field">
            <span>模板</span>
            <select
              className="pc-select"
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
              disabled={loadingTemplates || templates.length === 0}
            >
              {loadingTemplates ? <option value="default">模板加载中...</option> : null}
              {!loadingTemplates && templates.length === 0 ? <option value="default">暂无模板</option> : null}
              {templates.map((template) => (
                <option key={template.templateId} value={template.templateId}>
                  {template.name}
                  {template.templateKey === recommendedTemplateKey ? "（推荐）" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="pc-field">
            <span>报价点数</span>
            <div className="pc-ppt-panel__readonly">{formatQuotePoints(quotePoints)}</div>
          </label>
        </div>

        {recommendedTemplate ? (
          <div className="pc-ppt-panel__recommendation">
            <div className="pc-ppt-panel__recommendation-copy">
              <span className="pc-ppt-panel__recommendation-label">推荐模板</span>
              <strong>{recommendedTemplate.name}</strong>
              {recommendationTags.length > 0 ? (
                <div className="pc-ppt-panel__tags">
                  {recommendationTags.map((tag) => (
                    <span key={tag} className="pc-badge pc-badge--neutral">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            {selectedTemplate?.templateId === recommendedTemplate.templateId ? (
              <span className="pc-badge pc-badge--accent">当前已采用推荐模板</span>
            ) : (
              <button className="pc-button pc-button--secondary" type="button" onClick={() => setSelectedTemplateId(recommendedTemplate.templateId)}>
                使用推荐模板
              </button>
            )}
          </div>
        ) : null}

        {selectedTemplate ? (
          <div className="pc-ppt-panel__template-note">
            <strong>{selectedTemplate.name}</strong>
            <span>{selectedTemplate.description}</span>
            {selectedTemplate.templateKey === recommendedTemplateKey ? (
              <div className="pc-ppt-panel__template-meta">
                <span className="pc-badge pc-badge--accent">推荐模板</span>
              </div>
            ) : null}
          </div>
        ) : !loadingTemplates && !templateError ? (
          <div className="pc-ppt-panel__template-note">
            <strong>系统默认模板</strong>
            <span>当前没有可选模板，提交后会直接使用系统默认模板生成 PPT。</span>
          </div>
        ) : null}

        {loadingTemplates ? <div className="pc-ppt-panel__hint">正在读取 PPT 模板列表…</div> : null}
        {templateError ? <div className="pc-pricing-feedback pc-pricing-feedback--danger">{templateError}</div> : null}
        {error ? <div className="pc-pricing-feedback pc-pricing-feedback--danger">{error}</div> : null}
        {successMessage ? <div className="pc-pricing-feedback pc-pricing-feedback--success">{successMessage}</div> : null}

        <div className="pc-ppt-panel__actions">
          <button className="pc-button pc-button--primary" type="button" onClick={handleGenerate} disabled={submitting || items.length === 0}>
            {submitting ? "生成中..." : "生成 PPT"}
          </button>
          <button className="pc-button pc-button--secondary" type="button" onClick={handleRefreshStatus} disabled={statusLoading || !task?.taskId}>
            {statusLoading ? "刷新中..." : "刷新状态"}
          </button>
          {task?.downloadFileUrl ? (
            <a className="pc-button pc-button--ghost pc-ppt-panel__download" href={task.downloadFileUrl} target="_blank" rel="noreferrer">
              下载 PPT
            </a>
          ) : (
            <button className="pc-button pc-button--ghost" type="button" disabled>
              下载 PPT
            </button>
          )}
        </div>

        {task && !task.downloadFileUrl ? (
          <div className="pc-ppt-panel__hint">任务完成后会开放下载按钮；如果仍在处理中，可以先刷新状态。</div>
        ) : null}

        {task ? (
          <div className="pc-ppt-panel__status">
            <div className="pc-kv">
              <span>任务状态</span>
              <strong>{statusMeta.label}</strong>
            </div>
            <div className="pc-kv">
              <span>任务 ID</span>
              <strong>{task.taskId}</strong>
            </div>
            <div className="pc-kv">
              <span>详情</span>
              <strong>{task.detail || "-"}</strong>
            </div>
            <div className={`pc-ppt-panel__status-note pc-ppt-panel__status-note--${statusMeta.tone}`}>{statusMeta.description}</div>
          </div>
        ) : (
          <StatePanel
            title="等待生成"
            description="当前面板还没有提交 PPT 任务。填写标题、客户名并选择模板后，即可基于这次核价结果生成报价 PPT。"
            tone="neutral"
          />
        )}
      </div>
    </SectionCard>
  );
}

function formatQuotePoints(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "--";
  }
  return `${value.toLocaleString("zh-CN", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}%`;
}

function getTaskStatusMeta(status: string | null): { label: string; description: string; tone: "neutral" | "success" | "danger" } {
  const normalized = status?.toLowerCase().trim() ?? "";

  if (!normalized) {
    return {
      label: "--",
      description: "提交任务后，这里会显示最新的生成状态。",
      tone: "neutral",
    };
  }

  if (["success", "completed", "done", "finished"].includes(normalized)) {
    return {
      label: "已完成",
      description: "PPT 已生成完成，可以直接下载或继续刷新确认最新状态。",
      tone: "success",
    };
  }

  if (["failed", "error"].includes(normalized)) {
    return {
      label: "生成失败",
      description: "本次任务没有成功完成，请检查详情文案后重新提交。",
      tone: "danger",
    };
  }

  if (["processing", "running", "pending", "queued"].includes(normalized)) {
    return {
      label: "生成中",
      description: "任务已提交到后端，通常等待几秒后刷新状态即可看到结果。",
      tone: "neutral",
    };
  }

  return {
    label: status ?? "--",
    description: "任务状态已返回，若有变化可继续刷新确认最新结果。",
    tone: "neutral",
  };
}
