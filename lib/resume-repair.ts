import type { Resume, ResumeItem, ResumeSection, ResumeSectionType } from "@/types/resume"

const dateRangePattern =
  /((?:19|20)\d{2}(?:[./-]\d{1,2})?|至今|Present|present)\s*(?:[-–—~至]\s*((?:19|20)\d{2}(?:[./-]\d{1,2})?|至今|Present|present))?/i

const fieldLabels = [
  "项目名称",
  "项目名",
  "项目",
  "角色",
  "职位",
  "公司",
  "学校",
  "专业",
  "学历",
  "技术栈",
  "技术",
  "地点",
  "业务痛点",
  "工程优化",
  "交付成果",
  "项目描述",
  "工作内容"
]

const titleOnlyLabels = new Set(["项目名称", "项目名", "项目", "公司", "学校"])
const roleLabels = new Set(["角色", "职位"])
const subtitleLabels = new Set(["专业", "学历"])
const tagLabels = new Set(["技术栈", "技术"])
const keepAsBulletLabels = new Set(["业务痛点", "工程优化", "交付成果", "项目描述", "工作内容"])
const richTextLabels = [
  "985 逻辑底蕴",
  "全链路 AI 实战",
  "业务+技术双向视角",
  "业务痛点",
  "工程优化",
  "交付成果",
  "项目描述",
  "工作内容",
  "亮点",
  "难点",
  "结果",
  "成果",
  "职责"
]

export function repairResumeStructure(resume: Resume): Resume {
  return {
    ...resume,
    sections: resume.sections.map((section) => repairSection(section))
  }
}

function repairSection(section: ResumeSection): ResumeSection {
  if (["skills", "summary", "advantages", "custom"].includes(section.type)) {
    return {
      ...section,
      items: section.items.map((item) => ({
        ...item,
        content: repairRichText(item.content || ""),
        bullets: (item.bullets || []).map(formatRichTextLine)
      }))
    }
  }

  if (!["education", "work", "project"].includes(section.type)) {
    return section
  }

  return {
    ...section,
    items: section.items.flatMap((item) => repairExperienceItem(section.type, item))
  }
}

function repairExperienceItem(type: ResumeSectionType, item: ResumeItem): ResumeItem[] {
  const splitItems = splitMergedItems(item)

  return splitItems.map((current) => {
    const lines = collectLines(current)
    const fields = collectFields(lines)
    const dateRange = extractDateRange([current.startDate, current.endDate, current.title, ...lines].join(" "))
    const title = pickTitle(type, current, fields)
    const role = pickRole(type, current, fields)
    const subtitle = pickSubtitle(type, current, fields)
    const tags = [...(current.tags || []), ...splitTags(readFirst(fields, tagLabels))]
    const bullets = buildBullets(lines, fields)

    return {
      ...current,
      title: cleanTitle(title, role),
      role: type === "project" || type === "work" ? role : current.role,
      subtitle: type === "education" ? subtitle : current.subtitle || subtitle,
      startDate: current.startDate || dateRange.startDate,
      endDate: current.endDate || dateRange.endDate,
      tags: unique(tags),
      content: repairRichText(cleanContent(current.content || "")),
      bullets: bullets.map(formatRichTextLine)
    }
  })
}

function splitMergedItems(item: ResumeItem) {
  const bullets = item.bullets || []
  const startIndexes = bullets
    .map((line, index) => (isNewItemLine(line) ? index : -1))
    .filter((index) => index > 0)

  if (startIndexes.length === 0) {
    return [item]
  }

  const ranges = [0, ...startIndexes, bullets.length]
  return ranges.slice(0, -1).map((start, index) => {
    const end = ranges[index + 1]
    const chunk = bullets.slice(start, end)
    return {
      ...item,
      id: `${item.id}-${index}`,
      title: index === 0 ? item.title : inferTitleFromLine(chunk[0]) || item.title,
      bullets: index === 0 ? chunk : chunk.slice(1)
    }
  })
}

function isNewItemLine(line: string) {
  const text = cleanLine(line)
  if (/^(项目名称|项目名|公司|学校)[：:]/.test(text)) {
    return true
  }

  return dateRangePattern.test(text) && text.length <= 90 && !/^(业务痛点|工程优化|交付成果|技术栈|角色)[：:]/.test(text)
}

function inferTitleFromLine(line: string) {
  const fields = parseLabeledSegments(line)
  return fields.get("项目名称") || fields.get("项目名") || fields.get("项目") || fields.get("公司") || fields.get("学校") || cleanLine(line)
}

function collectLines(item: ResumeItem) {
  return [
    item.subtitle || "",
    item.role || "",
    item.content || "",
    ...(item.bullets || [])
  ]
    .flatMap((line) => line.split(/\r?\n/))
    .map(cleanLine)
    .filter(Boolean)
}

function collectFields(lines: string[]) {
  const fields = new Map<string, string[]>()

  lines.forEach((line) => {
    parseLabeledSegments(line).forEach((value, label) => {
      const current = fields.get(label) || []
      fields.set(label, [...current, value])
    })
  })

  return fields
}

function parseLabeledSegments(line: string) {
  const fields = new Map<string, string>()
  const normalized = line.replace(/\*\*([^*：:]{1,24}[：:])\*\*/g, "$1")
  const matches = [...normalized.matchAll(new RegExp(`(${fieldLabels.join("|")})[：:]`, "g"))]

  matches.forEach((match, index) => {
    const label = match[1]
    const start = (match.index || 0) + match[0].length
    const end = matches[index + 1]?.index ?? normalized.length
    const value = normalized.slice(start, end).replace(/^\*\*\s*/, "").trim()

    if (value) {
      fields.set(label, value)
    }
  })

  return fields
}

function pickTitle(type: ResumeSectionType, item: ResumeItem, fields: Map<string, string[]>) {
  const fieldTitle = readFirst(fields, titleOnlyLabels)
  if (fieldTitle) {
    return fieldTitle
  }

  if (item.title) {
    return stripDate(item.title)
  }

  return type === "education" ? "教育经历" : type === "work" ? "工作经历" : "项目经历"
}

function pickRole(type: ResumeSectionType, item: ResumeItem, fields: Map<string, string[]>) {
  if (type !== "project" && type !== "work") {
    return item.role || ""
  }

  return readFirst(fields, roleLabels) || item.role || ""
}

function pickSubtitle(type: ResumeSectionType, item: ResumeItem, fields: Map<string, string[]>) {
  if (type !== "education") {
    return item.subtitle || ""
  }

  return [readFirst(fields, subtitleLabels), item.subtitle].filter(Boolean).join(" · ")
}

function buildBullets(lines: string[], fields: Map<string, string[]>) {
  const fieldValues = new Set(
    [...fields.entries()]
      .filter(([label]) => !keepAsBulletLabels.has(label))
      .flatMap(([, values]) => values)
      .map(cleanLine)
  )

  const bullets = lines
    .map((line) => {
      const labeled = parseLabeledSegments(line)
      const kept = [...labeled.entries()]
        .filter(([label]) => keepAsBulletLabels.has(label))
        .map(([label, value]) => `**${label}：** ${value}`)

      if (kept.length > 0) {
        return kept.join("；")
      }

      return line
    })
    .filter((line) => !fieldValues.has(cleanLine(line)))
    .filter((line) => !/^(项目名称|项目名|项目|角色|职位|公司|学校|专业|学历|技术栈|技术|地点)[：:]/.test(line))
    .filter(Boolean)

  return unique(bullets)
}

function readFirst(fields: Map<string, string[]>, labels: Set<string>) {
  for (const label of labels) {
    const value = fields.get(label)?.[0]
    if (value) {
      return value
    }
  }

  return ""
}

function extractDateRange(text: string) {
  const match = text.match(dateRangePattern)

  return {
    startDate: match?.[1] || "",
    endDate: match?.[2] || ""
  }
}

function stripDate(text: string) {
  return cleanLine(text.replace(dateRangePattern, ""))
}

function cleanTitle(title: string, role: string) {
  let value = stripDate(title)
  if (role && value.endsWith(role)) {
    value = value.slice(0, -role.length).trim()
  }

  return value
}

function cleanContent(content: string) {
  return content
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => !/^(项目名称|项目名|项目|角色|职位|公司|学校|专业|学历|技术栈|技术|地点)[：:]/.test(line))
    .join("\n")
}

function repairRichText(content: string) {
  return content
    .split(/\r?\n/)
    .flatMap(splitDenseRichTextLine)
    .map(formatRichTextLine)
    .filter(Boolean)
    .join("\n\n")
}

function splitDenseRichTextLine(line: string) {
  const text = cleanLine(line)
  if (!text) {
    return []
  }

  const labelPattern = new RegExp(`(${richTextLabels.map(escapeRegExp).join("|")})[：:]`, "g")
  const matches = [...text.matchAll(labelPattern)]

  if (matches.length <= 1) {
    return [text]
  }

  return matches.map((match, index) => {
    const start = match.index || 0
    const end = matches[index + 1]?.index ?? text.length
    return text.slice(start, end).trim()
  })
}

function formatRichTextLine(line: string) {
  const text = cleanLine(line)
  if (!text) {
    return ""
  }

  if (/^\*\*.+?\*\*/.test(text)) {
    return text
  }

  const knownLabel = richTextLabels.find((label) => text.startsWith(`${label}：`) || text.startsWith(`${label}:`))
  if (knownLabel) {
    return text.replace(new RegExp(`^${escapeRegExp(knownLabel)}[：:]\\s*`), `**${knownLabel}：** `)
  }

  const generic = text.match(/^([\u4e00-\u9fa5A-Za-z0-9+ /]{2,18})[：:]\s*(.+)$/)
  if (generic) {
    return `**${generic[1].trim()}：** ${generic[2].trim()}`
  }

  return text
}

function cleanLine(line: string) {
  return line.replace(/^[\s\-•·●]+/, "").replace(/\s+/g, " ").trim()
}

function splitTags(value: string) {
  return value
    .split(/[，,、/|；;]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function unique(values: string[]) {
  return [...new Set(values.map(cleanLine).filter(Boolean))]
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
