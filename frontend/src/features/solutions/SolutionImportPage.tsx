import React from "react";

import { solutionImportRecords, solutionImportSteps } from "./mock";
import {
  AppSurface,
  Badge,
  Card,
  DefinitionList,
  Grid,
  SummaryCard,
  Timeline,
  actionButtonStyle,
  secondaryButtonStyle,
  tertiaryButtonStyle,
  Table,
} from "./ui";

export function SolutionImportPage() {
  const successCount = solutionImportRecords.reduce((sum, item) => sum + item.successCount, 0);
  const failedCount = solutionImportRecords.reduce((sum, item) => sum + item.failedCount, 0);
  const activeProcessing = solutionImportRecords.find((item) => item.status === "处理中");

  return (
    <AppSurface
      eyebrow="Solution Import"
      title="方案导入"
      subtitle="上传 xlsx / csv 文件后，先完成字段解析、商品匹配和预检，再进入方案入库和待确认处理。"
      actions={
        <>
          <button type="button" style={secondaryButtonStyle}>
            查看导入记录
          </button>
          <button type="button" style={actionButtonStyle}>
            开始解析
          </button>
        </>
      }
    >
      <Grid>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="导入批次" value={String(solutionImportRecords.length)} hint="最近几次方案导入" tone="neutral" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="成功条目" value={String(successCount)} hint="成功识别并入库的明细" tone="success" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="待修正" value={String(failedCount)} hint="解析失败或需要复核的条目" tone="warning" />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <SummaryCard label="当前处理" value={activeProcessing ? activeProcessing.fileName : "无任务"} hint="解析中的导入批次" tone="accent" />
        </div>

        <div style={{ gridColumn: "span 7" }}>
          <Card title="导入表单" subtitle="静态原型阶段先完成文件选择、导入元信息和操作入口。">
            <div style={uploadPanelStyle}>
              <div style={uploadTitleStyle}>拖拽文件到这里，或点击选择文件</div>
              <div style={uploadHintStyle}>支持 `.xlsx` 与 `.csv`，后续可扩展 PDF / 图片 / OCR。</div>
              <div style={uploadMetaStyle}>
                <Badge tone="neutral">建议模板导入</Badge>
                <Badge tone="warning">解析前先做预检</Badge>
                <Badge tone="success">支持批次追踪</Badge>
              </div>
            </div>

            <div style={formGridStyle}>
              <label style={fieldStyle}>
                <span style={fieldLabelStyle}>方案名称</span>
                <input style={inputStyle} defaultValue="政企机房标准方案 V2" />
              </label>
              <label style={fieldStyle}>
                <span style={fieldLabelStyle}>场景</span>
                <input style={inputStyle} defaultValue="机房" />
              </label>
              <label style={fieldStyle}>
                <span style={fieldLabelStyle}>行业</span>
                <input style={inputStyle} defaultValue="政企" />
              </label>
              <label style={fieldStyle}>
                <span style={fieldLabelStyle}>创建人</span>
                <input style={inputStyle} defaultValue="售前一组" />
              </label>
              <label style={fieldStyle}>
                <span style={fieldLabelStyle}>导入方式</span>
                <select style={inputStyle} defaultValue="标准导入">
                  <option>标准导入</option>
                  <option>仅预检</option>
                  <option>AI 辅助导入</option>
                </select>
              </label>
              <label style={fieldStyle}>
                <span style={fieldLabelStyle}>文件类型</span>
                <select style={inputStyle} defaultValue="xlsx">
                  <option value="xlsx">xlsx</option>
                  <option value="csv">csv</option>
                </select>
              </label>
            </div>

            <div style={actionRowStyle}>
              <button type="button" style={secondaryButtonStyle}>
                保存草稿
              </button>
              <button type="button" style={tertiaryButtonStyle}>
                仅预检
              </button>
              <button type="button" style={actionButtonStyle}>
                上传并解析
              </button>
            </div>
          </Card>

          <Card title="解析流程" subtitle="把导入拆成可追踪的阶段，比直接给结果更接近真实后台的业务视角。">
            <Timeline items={solutionImportSteps} />
          </Card>
        </div>

        <div style={{ gridColumn: "span 5" }}>
          <Grid gap={16}>
            <div style={{ gridColumn: "span 12" }}>
              <Card title="导入结果摘要" subtitle="用于快速判断本批次是否进入待确认和重算阶段。">
                <DefinitionList
                  items={[
                    {
                      label: "当前批次",
                      value: activeProcessing ? activeProcessing.fileName : "无进行中批次",
                      hint: activeProcessing ? activeProcessing.summary : "暂无新的导入任务。",
                    },
                    {
                      label: "错误报告",
                      value: solutionImportRecords.find((item) => item.status === "失败" && item.errorReport)?.errorReport ?? "暂无",
                      hint: "失败批次结束后可以直接下载错误报告。",
                    },
                    {
                      label: "处理建议",
                      value: "先看解析 -> 再看待确认 -> 再进入方案详情重算",
                      hint: "这是正式后台最常用的导入处理路径。",
                    },
                  ]}
                />
              </Card>
            </div>

            <div style={{ gridColumn: "span 12" }}>
              <Card title="导入记录" subtitle="最近导入批次与结果概览。">
                <Table
                  columns={["文件名", "状态", "成功/失败", "负责人"]}
                  rows={solutionImportRecords.map((item) => (
                    <tr key={item.importId}>
                      <td style={tdStyle}>
                        <div style={fileNameStyle}>{item.fileName}</div>
                        <div style={fileMetaStyle}>{item.importedAt}</div>
                      </td>
                      <td style={tdStyle}>
                        <Badge tone={badgeToneByImport(item.status)}>{item.status}</Badge>
                      </td>
                      <td style={tdStyle}>
                        {item.successCount}/{item.failedCount}
                      </td>
                      <td style={tdStyle}>{item.owner}</td>
                    </tr>
                  ))}
                />
              </Card>
            </div>
          </Grid>
        </div>
      </Grid>
    </AppSurface>
  );
}

function badgeToneByImport(status: string) {
  if (status === "成功") {
    return "success" as const;
  }

  if (status === "失败") {
    return "danger" as const;
  }

  return "warning" as const;
}

const uploadPanelStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px dashed #cfd8e3",
  textAlign: "center",
};

const uploadTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
};

const uploadHintStyle: React.CSSProperties = {
  marginTop: 8,
  color: "#667085",
  lineHeight: 1.7,
};

const uploadMetaStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  justifyContent: "center",
  marginTop: 14,
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
  marginTop: 16,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const fieldLabelStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid #dbe4ef",
  padding: "12px 14px",
  font: "inherit",
  background: "#fff",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 16,
};

const fileNameStyle: React.CSSProperties = {
  fontWeight: 700,
};

const fileMetaStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#667085",
  fontSize: 13,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #edf2f7",
  verticalAlign: "top",
};
