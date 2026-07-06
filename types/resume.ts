export type ResumeSectionType =
  | "basic"
  | "education"
  | "work"
  | "project"
  | "skills"
  | "summary"
  | "advantages"
  | "custom"

export type BasicInfo = {
  name: string
  avatar?: string
  title?: string
  status?: string
  email?: string
  phone?: string
  city?: string
  birthday?: string
  links?: string[]
}

export type ResumeItem = {
  id: string
  title?: string
  subtitle?: string
  role?: string
  startDate?: string
  endDate?: string
  location?: string
  tags?: string[]
  content?: string
  bullets?: string[]
  metadata?: Record<string, unknown>
}

export type ResumeSection = {
  id: string
  type: ResumeSectionType
  title: string
  icon?: string
  visible: boolean
  order: number
  items: ResumeItem[]
}

export type ResumeTheme = {
  accentColor: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  pageMargin: number
}

export type Resume = {
  id: string
  title: string
  basic: BasicInfo
  sections: ResumeSection[]
  theme: ResumeTheme
  sourceText?: string
  updatedAt: string
}

export type ParseResumeResponse = {
  resume: Resume
  rawText: string
  mode: "ai" | "fallback"
  warning?: string
}
