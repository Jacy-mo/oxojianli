import type { ResumeSectionType, ResumeTheme } from "@/types/resume"

export type ResumeTemplateLayout =
  | "classic"
  | "compact"
  | "sidebar"
  | "modern"
  | "executive"
  | "ats"

export type ResumeTemplate = {
  id: string
  name: string
  description: string
  layout: ResumeTemplateLayout
  theme: ResumeTheme
  showAvatar: boolean
  showTags: boolean
  sidebarSections: ResumeSectionType[]
  heading: "line" | "block" | "plain" | "capsule"
  source: "built-in" | "custom"
  createdAt?: string
}
