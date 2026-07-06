import type { ResumeTemplate } from "@/types/template"

export const builtInTemplates: ResumeTemplate[] = [
  {
    id: "classic-teal",
    name: "经典清爽",
    description: "适合通用求职，重点突出经历和项目。",
    layout: "classic",
    theme: {
      accentColor: "#0f9f9a",
      fontFamily: "system-ui",
      fontSize: 14,
      lineHeight: 1.55,
      pageMargin: 28
    },
    showAvatar: true,
    showTags: true,
    sidebarSections: [],
    heading: "line",
    source: "built-in"
  },
  {
    id: "compact-ats",
    name: "ATS 紧凑",
    description: "少装饰、高密度，适合投递系统解析。",
    layout: "ats",
    theme: {
      accentColor: "#222222",
      fontFamily: "Arial, system-ui",
      fontSize: 13,
      lineHeight: 1.42,
      pageMargin: 24
    },
    showAvatar: true,
    showTags: false,
    sidebarSections: [],
    heading: "plain",
    source: "built-in"
  },
  {
    id: "product-modern",
    name: "产品现代",
    description: "强调个人名片和项目结果，适合产品、运营、增长岗位。",
    layout: "modern",
    theme: {
      accentColor: "#2563eb",
      fontFamily: "system-ui",
      fontSize: 14,
      lineHeight: 1.5,
      pageMargin: 30
    },
    showAvatar: true,
    showTags: true,
    sidebarSections: [],
    heading: "block",
    source: "built-in"
  },
  {
    id: "sidebar-pro",
    name: "侧栏专业",
    description: "把技能和优势放到侧栏，主栏保留经历叙事。",
    layout: "sidebar",
    theme: {
      accentColor: "#14532d",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: 13,
      lineHeight: 1.48,
      pageMargin: 0
    },
    showAvatar: true,
    showTags: true,
    sidebarSections: ["skills", "advantages", "summary"],
    heading: "capsule",
    source: "built-in"
  },
  {
    id: "executive-dark",
    name: "高管深色",
    description: "黑色抬头区，适合管理岗、负责人和顾问型简历。",
    layout: "executive",
    theme: {
      accentColor: "#111827",
      fontFamily: "system-ui",
      fontSize: 14,
      lineHeight: 1.5,
      pageMargin: 26
    },
    showAvatar: true,
    showTags: false,
    sidebarSections: [],
    heading: "block",
    source: "built-in"
  },
  {
    id: "fresh-compact",
    name: "清新单页",
    description: "更小字号和留白，适合内容较多时压缩到一页。",
    layout: "compact",
    theme: {
      accentColor: "#c2410c",
      fontFamily: "system-ui",
      fontSize: 12,
      lineHeight: 1.38,
      pageMargin: 22
    },
    showAvatar: true,
    showTags: true,
    sidebarSections: [],
    heading: "line",
    source: "built-in"
  }
]

export const defaultTemplateId = "classic-teal"

export function getTemplateById(id: string, customTemplates: ResumeTemplate[] = []) {
  return (
    [...builtInTemplates, ...customTemplates].find((template) => template.id === id) ||
    builtInTemplates[0]
  )
}

export function normalizeImportedTemplate(input: unknown): ResumeTemplate {
  if (!input || typeof input !== "object") {
    throw new Error("模板文件格式不正确")
  }

  const template = input as Partial<ResumeTemplate>
  if (!template.name || !template.layout || !template.theme) {
    throw new Error("模板文件缺少 name、layout 或 theme")
  }

  return {
    id: template.id?.startsWith("custom-")
      ? template.id
      : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: template.name,
    description: template.description || "导入的自定义模板",
    layout: template.layout,
    theme: {
      accentColor: template.theme.accentColor || "#0f9f9a",
      fontFamily: template.theme.fontFamily || "system-ui",
      fontSize: Number(template.theme.fontSize || 14),
      lineHeight: Number(template.theme.lineHeight || 1.5),
      pageMargin: Number(template.theme.pageMargin || 28)
    },
    showAvatar: template.showAvatar !== false,
    showTags: template.showTags !== false,
    sidebarSections: template.sidebarSections || [],
    heading: template.heading || "line",
    source: "custom",
    createdAt: template.createdAt || new Date().toISOString()
  }
}

export function downloadTemplate(template: ResumeTemplate) {
  const blob = new Blob([JSON.stringify(template, null, 2)], {
    type: "application/json;charset=utf-8"
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${template.name.replace(/[\\/:*?"<>|]/g, "-")}.oxo-template.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
