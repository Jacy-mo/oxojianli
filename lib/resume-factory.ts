import type {
  BasicInfo,
  Resume,
  ResumeItem,
  ResumeSection,
  ResumeSectionType
} from "@/types/resume"
import { createId } from "@/lib/id"
import { resumeSchema, type ResumeSchemaInput } from "@/lib/resume-schema"

const sectionIcons: Record<ResumeSectionType, string> = {
  basic: "👤",
  education: "🎓",
  work: "💼",
  project: "🚀",
  skills: "⚡",
  summary: "✦",
  advantages: "💬",
  custom: "✨"
}

export const sectionTypeLabels: Record<ResumeSectionType, string> = {
  basic: "基本信息",
  education: "教育经历",
  work: "工作经验",
  project: "项目经历",
  skills: "专业技能",
  summary: "自我评价",
  advantages: "核心优势",
  custom: "自定义模块"
}

export function createEmptyItem(type: ResumeSectionType): ResumeItem {
  if (type === "education") {
    return {
      id: createId("item"),
      title: "学校名称",
      subtitle: "专业 / 学历",
      startDate: "",
      endDate: "",
      bullets: ["补充主修课程、荣誉或校园经历"]
    }
  }

  if (type === "work" || type === "project") {
    return {
      id: createId("item"),
      title: type === "work" ? "公司名称" : "项目名称",
      role: type === "work" ? "职位" : "角色",
      startDate: "",
      endDate: "",
      content: "",
      bullets: ["描述你的职责、动作和可量化成果"]
    }
  }

  return {
    id: createId("item"),
    title: "",
    content: "在这里补充内容",
    bullets: []
  }
}

export function createSection(type: ResumeSectionType, order: number): ResumeSection {
  return {
    id: createId("section"),
    type,
    title: sectionTypeLabels[type],
    icon: sectionIcons[type],
    visible: true,
    order,
    items: type === "basic" ? [] : [createEmptyItem(type)]
  }
}

export function normalizeResume(input: ResumeSchemaInput): Resume {
  const parsed = resumeSchema.parse(input)
  const now = new Date().toISOString()

  const sections = parsed.sections.map((section, index) => ({
    ...section,
    id: section.id || createId("section"),
    icon: section.icon || sectionIcons[section.type],
    order: section.order ?? index,
    items: section.items.map((item) => ({
      ...item,
      id: item.id || createId("item"),
      tags: item.tags ?? [],
      bullets: item.bullets ?? []
    }))
  }))

  return {
    id: parsed.id || createId("resume"),
    title: parsed.title || `${parsed.basic.name || "我的"}的简历`,
    basic: parsed.basic as BasicInfo,
    sections: sections.sort((a, b) => a.order - b.order),
    theme: parsed.theme,
    sourceText: parsed.sourceText,
    updatedAt: parsed.updatedAt || now
  }
}

export function createSampleResume(): Resume {
  return normalizeResume({
    title: "oxo示例简历",
    basic: {
      name: "林嘉禾",
      title: "AI 产品经理 / 自动化运营",
      status: "在职看机会",
      email: "demo@oxo-resume.com",
      phone: "13800138000",
      city: "杭州市西湖区",
      birthday: "1998-08-18"
    },
    sections: [
      {
        type: "education",
        title: "教育经历",
        icon: "🎓",
        order: 0,
        items: [
          {
            title: "浙江大学",
            subtitle: "信息管理与信息系统 · 本科",
            startDate: "2017/09",
            endDate: "2021/06"
          }
        ]
      },
      {
        type: "advantages",
        title: "核心优势",
        icon: "💬",
        order: 1,
        items: [
          {
            content:
              "产品拆解能力：能够把模糊业务诉求转成清晰的用户路径、字段模型和迭代计划。\n\nAI 工具实战：熟悉大模型 API、知识库、RAG、工作流编排和自动化工具，能快速完成原型验证。\n\n运营视角：理解内容、客服、销售和数据团队的协作流程，擅长用低成本自动化方案提升执行效率。"
          }
        ]
      },
      {
        type: "project",
        title: "项目经历",
        icon: "🚀",
        order: 2,
        items: [
          {
            title: "智能简历解析与编辑平台",
            role: "产品负责人",
            startDate: "2024/03",
            endDate: "2025/12",
            subtitle: "上传简历后自动拆解为可编辑模块，并实时生成新版预览",
            tags: ["Next.js", "AI Parsing", "RAG", "PDF", "DOCX", "Workflow"],
            bullets: [
              "设计简历上传、文本提取、AI 结构化和三栏编辑的完整产品链路。",
              "将基本信息、教育经历、项目经历等内容统一抽象为可排序、可隐藏的模块。",
              "通过实时预览和主题配置降低用户反复排版成本。"
            ]
          }
        ]
      },
      {
        type: "work",
        title: "工作经验",
        icon: "💼",
        order: 3,
        items: [
          {
            title: "某智能协作产品公司",
            role: "AI 产品经理",
            startDate: "2021/07",
            endDate: "至今",
            bullets: [
              "负责 AI 辅助编辑、文档解析和自动化工作流相关功能规划。",
              "联动研发、设计和运营团队完成需求拆解、版本验收和数据复盘。"
            ]
          }
        ]
      },
      {
        type: "skills",
        title: "专业技能",
        icon: "⚡",
        order: 4,
        items: [
          {
            content:
              "产品能力：需求分析、用户路径、信息架构、PRD、数据复盘\nAI 能力：Prompt 设计、结构化抽取、知识库、RAG、工作流编排\n技术协作：Next.js、API 对接、PDF/DOCX 解析、自动化工具"
          }
        ]
      },
      {
        type: "summary",
        title: "自我评价",
        icon: "✦",
        order: 5,
        items: [
          {
            content:
              "关注 AI 工具如何真正进入日常工作流，偏好用清晰的数据结构和稳定的交互体验解决复杂内容编辑问题。"
          }
        ]
      }
    ]
  })
}
