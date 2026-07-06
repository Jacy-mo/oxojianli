import { normalizeResume } from "@/lib/resume-factory"
import { repairResumeStructure } from "@/lib/resume-repair"
import type { Resume, ResumeSectionType } from "@/types/resume"

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const phonePattern = /(?:\+?86[-\s]?)?1[3-9]\d{9}/

const headingMap: Array<[RegExp, ResumeSectionType, string, string]> = [
  [/教育经历|教育背景|学历/i, "education", "教育经历", "🎓"],
  [/工作经历|工作经验|实习经历|职业经历/i, "work", "工作经验", "💼"],
  [/项目经历|项目经验|项目/i, "project", "项目经历", "🚀"],
  [/专业技能|技能|技能清单/i, "skills", "专业技能", "⚡"],
  [/核心优势|个人优势|优势/i, "advantages", "核心优势", "💬"],
  [/自我评价|个人评价|个人总结|总结/i, "summary", "自我评价", "✦"]
]

export function fallbackParseResume(rawText: string, fileName?: string): Resume {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const firstUsefulLine = lines.find((line) => line.length <= 16 && !emailPattern.test(line)) || "未命名"
  const email = rawText.match(emailPattern)?.[0] || ""
  const phone = rawText.match(phonePattern)?.[0] || ""
  const sections = splitSections(lines)

  return repairResumeStructure(normalizeResume({
    title: fileName?.replace(/\.(pdf|docx|doc|txt)$/i, "") || `${firstUsefulLine}的简历`,
    basic: {
      name: firstUsefulLine,
      email,
      phone,
      title: guessTitle(lines),
      city: guessCity(lines)
    },
    sections,
    sourceText: rawText
  }))
}

function splitSections(lines: string[]) {
  const buckets: Array<{
    type: ResumeSectionType
    title: string
    icon: string
    lines: string[]
  }> = []

  let current: (typeof buckets)[number] | null = null
  const consumedHeaderIndexes = new Set<number>()

  lines.forEach((line, index) => {
    const matched = headingMap.find(([pattern]) => pattern.test(line) && line.length <= 20)
    if (matched) {
      const [, type, title, icon] = matched
      current = { type, title, icon, lines: [] }
      buckets.push(current)
      consumedHeaderIndexes.add(index)
      return
    }

    if (current && !consumedHeaderIndexes.has(index)) {
      current.lines.push(line)
    }
  })

  if (buckets.length === 0) {
    return [
      {
        type: "custom" as const,
        title: "原简历内容",
        icon: "✨",
        order: 0,
        visible: true,
        items: [{ content: lines.join("\n") }]
      }
    ]
  }

  return buckets.map((bucket, order) => ({
    type: bucket.type,
    title: bucket.title,
    icon: bucket.icon,
    order,
    visible: true,
    items: buildItems(bucket.type, bucket.lines)
  }))
}

function buildItems(type: ResumeSectionType, lines: string[]) {
  if (type === "skills" || type === "summary" || type === "advantages") {
    return [{ content: lines.join("\n") }]
  }

  const chunks: string[][] = []
  let current: string[] = []

  lines.forEach((line) => {
    const looksLikeTitle =
      /^(项目名称|项目名|公司|学校)[：:]/.test(line) ||
      (/(\d{4}[./-]\d{1,2}|\d{4}|至今|present)/i.test(line) &&
        line.length < 90 &&
        !/^(业务痛点|工程优化|交付成果|技术栈|角色)[：:]/.test(line)) ||
      (current.length === 0 && line.length < 50 && !line.startsWith("-") && !line.startsWith("•"))

    if (looksLikeTitle && current.length > 1) {
      chunks.push(current)
      current = [line]
    } else {
      current.push(line)
    }
  })

  if (current.length > 0) {
    chunks.push(current)
  }

  return chunks.map((chunk) => ({
    title: chunk[0] || "",
    bullets: chunk.slice(1).filter(Boolean),
    content: ""
  }))
}

function guessTitle(lines: string[]) {
  return lines.find((line) => /负责人|运营|工程师|设计师|经理|产品|开发|数据|AI/i.test(line)) || ""
}

function guessCity(lines: string[]) {
  return (
    lines
      .join(" ")
      .match(/[一-龥]{2,8}(市|区|县)/)?.[0] || ""
  )
}
