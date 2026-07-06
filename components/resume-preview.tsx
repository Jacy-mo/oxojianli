"use client"

import {
  BriefcaseBusiness,
  CalendarDays,
  Copy,
  Download,
  Eye,
  Home,
  LayoutTemplate,
  Mail,
  MapPin,
  Palette,
  Phone,
  SlidersHorizontal
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useMemo, useState } from "react"
import type { BasicInfo, Resume, ResumeItem, ResumeSection } from "@/types/resume"
import type { ResumeTemplate } from "@/types/template"
import { getTemplateById } from "@/lib/resume-templates"
import { TemplateSwitcher } from "@/components/template-switcher"
import { useResumeStore } from "@/store/resume-store"

export function ResumePreview() {
  const resume = useResumeStore((state) => state.resume)
  const selectedTemplateId = useResumeStore((state) => state.selectedTemplateId)
  const customTemplates = useResumeStore((state) => state.customTemplates)
  const template = useMemo(
    () => getTemplateById(selectedTemplateId, customTemplates),
    [customTemplates, selectedTemplateId]
  )
  const visibleSections = useMemo(
    () => resume.sections.filter((section) => section.visible).sort((a, b) => a.order - b.order),
    [resume.sections]
  )

  return (
    <section className="relative overflow-hidden bg-[#ecebea] print:overflow-visible print:bg-white print:p-0">
      <FloatingToolbar template={template} />
      <div className="h-full overflow-auto px-4 pb-5 pt-[76px] print:overflow-visible print:p-0">
        <ResumePaper resume={resume} sections={visibleSections} template={template} />
      </div>
    </section>
  )
}

function ResumePaper({
  resume,
  sections,
  template
}: {
  resume: Resume
  sections: ResumeSection[]
  template: ResumeTemplate
}) {
  const baseStyle = {
    ["--accent-color" as string]: resume.theme.accentColor,
    fontFamily: normalizePreviewFont(resume.theme.fontFamily),
    fontVariantNumeric: "lining-nums tabular-nums",
    fontFeatureSettings: "\"lnum\" 1, \"tnum\" 1",
    fontSize: `${resume.theme.fontSize}px`,
    lineHeight: resume.theme.lineHeight,
    padding: template.layout === "sidebar" ? 0 : `${resume.theme.pageMargin}px`
  }
  const paperClass =
    "print-surface mx-auto min-h-[1123px] w-[794px] bg-white text-[#222] shadow-soft print:shadow-none"

  if (template.layout === "sidebar") {
    return (
      <div className={paperClass} style={baseStyle}>
        <SidebarTemplate resume={resume} sections={sections} template={template} />
      </div>
    )
  }

  if (template.layout === "executive") {
    return (
      <div className={paperClass} style={baseStyle}>
        <ExecutiveTemplate resume={resume} sections={sections} template={template} />
      </div>
    )
  }

  return (
    <div className={paperClass} style={baseStyle}>
      <StandardTemplate resume={resume} sections={sections} template={template} />
    </div>
  )
}

function normalizePreviewFont(fontFamily: string) {
  if (fontFamily.toLowerCase().includes("georgia")) {
    return "'Times New Roman', SimSun, serif"
  }

  return fontFamily
}

function StandardTemplate({
  resume,
  sections,
  template
}: {
  resume: Resume
  sections: ResumeSection[]
  template: ResumeTemplate
}) {
  const compact = template.layout === "compact" || template.layout === "ats"

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <StandardHeader basic={resume.basic} template={template} />
      <div className={compact ? "space-y-2.5" : "space-y-4"}>
        {sections.map((section) => (
          <PreviewSection key={section.id} section={section} template={template} />
        ))}
      </div>
    </div>
  )
}

function ExecutiveTemplate({
  resume,
  sections,
  template
}: {
  resume: Resume
  sections: ResumeSection[]
  template: ResumeTemplate
}) {
  return (
    <div>
      <div className="bg-[#111827] px-8 py-7 text-white">
        <StandardHeader basic={resume.basic} template={template} inverted />
      </div>
      <div className="space-y-4 px-8 py-6">
        {sections.map((section) => (
          <PreviewSection key={section.id} section={section} template={template} />
        ))}
      </div>
    </div>
  )
}

function SidebarTemplate({
  resume,
  sections,
  template
}: {
  resume: Resume
  sections: ResumeSection[]
  template: ResumeTemplate
}) {
  const sidebarTypes = new Set(template.sidebarSections)
  const sidebarSections = sections.filter((section) => sidebarTypes.has(section.type))
  const mainSections = sections.filter((section) => !sidebarTypes.has(section.type))

  return (
    <div className="grid min-h-[1123px] grid-cols-[235px_1fr]">
      <aside className="bg-[#f1f4f2] px-6 py-7">
        <AvatarBlock basic={resume.basic} template={template} large />
        <div className="mt-5 space-y-2 text-[13px] font-semibold text-[#1f2937]">
          <InfoLine icon={<Mail className="h-4 w-4" />} value={resume.basic.email} />
          <InfoLine icon={<Phone className="h-4 w-4" />} value={resume.basic.phone} />
          <InfoLine icon={<MapPin className="h-4 w-4" />} value={resume.basic.city} />
          <InfoLine icon={<CalendarDays className="h-4 w-4" />} value={resume.basic.birthday} />
        </div>
        <div className="mt-7 space-y-5">
          {sidebarSections.map((section) => (
            <PreviewSection key={section.id} section={section} template={template} compact />
          ))}
        </div>
      </aside>
      <main className="px-8 py-8">
        <div className="mb-5">
          <h1 className="text-[31px] font-black leading-none tracking-normal text-[#111827]">
            {resume.basic.name || "未命名"}
          </h1>
          {resume.basic.title ? (
            <div className="mt-2 text-[17px] font-bold text-[var(--accent-color)]">
              {resume.basic.title}
            </div>
          ) : null}
          {resume.basic.status ? (
            <div className="mt-1 text-sm font-semibold text-neutral-500">{resume.basic.status}</div>
          ) : null}
        </div>
        <div className="space-y-4">
          {mainSections.map((section) => (
            <PreviewSection key={section.id} section={section} template={template} />
          ))}
        </div>
      </main>
    </div>
  )
}

function StandardHeader({
  basic,
  template,
  inverted = false
}: {
  basic: BasicInfo
  template: ResumeTemplate
  inverted?: boolean
}) {
  const ats = template.layout === "ats"
  const modern = template.layout === "modern"
  const compact = template.layout === "compact" || ats
  const textColor = inverted ? "text-white" : "text-[#101211]"
  const mutedColor = inverted ? "text-white/75" : "text-[#333]"

  if (ats) {
    return (
      <header className="border-b border-[#222] pb-2 text-center">
        <h1 className="text-[25px] font-black leading-tight tracking-normal text-[#111]">
          {basic.name || "未命名"}
        </h1>
        <div className="mt-1 text-[13px] font-semibold text-[#333]">
          {[basic.title, basic.status, basic.email, basic.phone, basic.city].filter(Boolean).join(" | ")}
        </div>
      </header>
    )
  }

  return (
    <header
      className={`flex gap-7 ${modern ? "rounded-[8px] bg-[#f5f8ff] p-5" : ""} ${
        compact ? "mb-2" : "mb-4"
      }`}
    >
      <AvatarBlock basic={basic} template={template} />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-end gap-4">
          <h1 className={`text-[30px] font-black leading-none tracking-normal ${textColor}`}>
            {basic.name || "未命名"}
          </h1>
          {basic.status ? (
            <span className={`inline-flex items-center gap-1 pb-0.5 text-sm font-bold ${mutedColor}`}>
              <BriefcaseBusiness className="h-4 w-4" />
              {basic.status}
            </span>
          ) : null}
        </div>
        {basic.title ? (
          <div className={`mb-3 max-w-[420px] text-[17px] font-semibold leading-7 ${mutedColor}`}>
            {basic.title}
          </div>
        ) : null}
        <div className={`grid grid-cols-2 gap-x-8 gap-y-2 text-[14px] ${mutedColor}`}>
          <InfoLine icon={<Mail className="h-4 w-4" />} value={basic.email} />
          <InfoLine icon={<CalendarDays className="h-4 w-4" />} value={basic.birthday} />
          <InfoLine icon={<MapPin className="h-4 w-4" />} value={basic.city} />
          <InfoLine icon={<Phone className="h-4 w-4" />} value={basic.phone} />
        </div>
      </div>
    </header>
  )
}

function AvatarBlock({
  basic,
  template,
  large = false
}: {
  basic: BasicInfo
  template: ResumeTemplate
  large?: boolean
}) {
  if (!template.showAvatar) {
    return null
  }

  const initials = basic.name.slice(0, 1) || "简"
  const size = large ? "h-[128px] w-[104px]" : "h-[136px] w-[104px]"

  return (
    <div className={`${size} shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100`}>
      {basic.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={basic.avatar} alt={basic.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#e8efed] text-4xl font-black text-[var(--accent-color)]">
          {initials}
        </div>
      )}
    </div>
  )
}

function InfoLine({ icon, value }: { icon: React.ReactNode; value?: string }) {
  if (!value) {
    return null
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 truncate">{value}</span>
    </div>
  )
}

function PreviewSection({
  section,
  template,
  compact = false
}: {
  section: ResumeSection
  template: ResumeTemplate
  compact?: boolean
}) {
  if (section.items.length === 0) {
    return null
  }

  const titleClass = getHeadingClass(template, compact)

  return (
    <section>
      <h2 className={titleClass}>{section.title}</h2>
      <div className={compact ? "space-y-2" : "space-y-3"}>
        {section.items.map((item) => (
          <PreviewItem key={item.id} section={section} item={item} template={template} compact={compact} />
        ))}
      </div>
    </section>
  )
}

function getHeadingClass(template: ResumeTemplate, compact: boolean) {
  const base = compact
    ? "mb-1.5 text-[14px] font-black tracking-normal"
    : "mb-2 text-[18px] font-black tracking-normal"

  if (template.heading === "plain") {
    return `${base} border-b border-[#222] pb-1 text-[#111]`
  }

  if (template.heading === "block") {
    return `${base} border-l-4 border-[var(--accent-color)] bg-[#f4f7f7] px-2 py-1 text-[#111]`
  }

  if (template.heading === "capsule") {
    return `${base} inline-flex rounded-full bg-[var(--accent-color)] px-3 py-1 text-white`
  }

  return `${base} border-b border-[var(--accent-color)] pb-1 text-[var(--accent-color)]`
}

function PreviewItem({
  section,
  item,
  template,
  compact = false
}: {
  section: ResumeSection
  item: ResumeItem
  template: ResumeTemplate
  compact?: boolean
}) {
  const dateRange = [item.startDate, item.endDate].filter(Boolean).join(" - ")
  const subtitle = item.subtitle || item.role
  const isTextOnly = section.type === "skills" || section.type === "summary" || section.type === "advantages"
  const ats = template.layout === "ats"

  return (
    <article className={`break-inside-avoid ${compact || ats ? "text-[13px]" : "text-[15px]"} leading-[1.55]`}>
      {!isTextOnly ? (
        <div className={ats ? "mb-0.5 flex justify-between gap-4" : "mb-1 grid grid-cols-[1fr_auto] gap-4"}>
          <div className="min-w-0">
            {item.title ? <div className="font-black text-[#222]">{item.title}</div> : null}
            {subtitle ? <div className="font-semibold text-[#444]">{subtitle}</div> : null}
          </div>
          {dateRange ? <div className="whitespace-nowrap font-medium text-[#333]">{dateRange}</div> : null}
        </div>
      ) : null}

      {item.location ? <div className="mb-1 text-[13px] font-medium text-[#555]">{item.location}</div> : null}
      {template.showTags && item.tags && item.tags.length > 0 ? (
        <div className="mb-1 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[4px] bg-[#eef7f6] px-1.5 py-0.5 text-[12px] font-bold text-[var(--accent-color)]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {item.content ? <MarkdownBlock content={item.content} /> : null}
      {item.bullets && item.bullets.length > 0 ? (
        <BulletBlock bullets={item.bullets} compact={compact || ats} />
      ) : null}
    </article>
  )
}

function BulletBlock({ bullets, compact }: { bullets: string[]; compact: boolean }) {
  const content = bullets.join("\n")
  const hasMarkdownStructure = bullets.length === 1 && /(^|\n)\s*(-|\*|\d+\.)\s+/.test(content)

  if (hasMarkdownStructure) {
    return <MarkdownBlock content={content} compact={compact} />
  }

  return (
    <ul className={`ml-5 list-disc ${compact ? "space-y-0" : "space-y-0.5"}`}>
      {bullets.map((bullet) => (
        <li key={bullet} className="pl-1 font-medium text-[#333]">
          <InlineMarkdown content={bullet} />
        </li>
      ))}
    </ul>
  )
}

function MarkdownBlock({ content, compact = false }: { content: string; compact?: boolean }) {
  return (
    <div
      key={content}
      className={`font-medium text-[#333] [&_li]:pl-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:my-1 [&_strong]:font-black [&_strong]:text-[#222] [&_ul]:ml-5 [&_ul]:list-disc ${
        compact ? "[&_li]:my-0" : "[&_li]:my-0.5"
      }`}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

function InlineMarkdown({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={`${part}-${index}`} className="font-black text-[#222]">
              {part.slice(2, -2)}
            </strong>
          )
        }

        return <span key={`${part}-${index}`}>{part}</span>
      })}
    </span>
  )
}

function FloatingToolbar({ template }: { template: ResumeTemplate }) {
  const resume = useResumeStore((state) => state.resume)
  const updateTheme = useResumeStore((state) => state.updateTheme)
  const [themeOpen, setThemeOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(resume, null, 2))
  }

  return (
    <>
      <div className="no-print absolute left-4 right-4 top-4 z-30 flex justify-end">
        <div className="flex items-center gap-2 rounded-[12px] bg-white p-2 shadow-soft">
          <ToolButton title="切换模板" onClick={() => setTemplateOpen(true)}>
            <LayoutTemplate className="h-5 w-5" />
          </ToolButton>
          <ToolButton title="页面设置" onClick={() => setThemeOpen((value) => !value)}>
            <SlidersHorizontal className="h-5 w-5" />
          </ToolButton>
          <ToolButton title="主题颜色" onClick={() => setThemeOpen((value) => !value)}>
            <Palette className="h-5 w-5" />
          </ToolButton>
          <ToolButton title="复制 JSON" onClick={copyJson}>
            <Copy className="h-5 w-5" />
          </ToolButton>
          <ToolButton title="导出 PDF" onClick={() => window.print()}>
            <Download className="h-5 w-5" />
          </ToolButton>
          <ToolButton title="预览模式" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Eye className="h-5 w-5" />
          </ToolButton>
          <ToolButton title="回到顶部" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Home className="h-5 w-5" />
          </ToolButton>
        </div>

        {themeOpen ? (
          <div className="w-[260px] rounded-[12px] border border-line bg-white p-4 shadow-soft">
            <div className="mb-1 text-sm font-black text-ink">页面样式</div>
            <div className="mb-3 text-xs font-semibold text-neutral-500">当前模板：{template.name}</div>
            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-bold text-neutral-500">强调色</span>
              <input
                type="color"
                value={resume.theme.accentColor}
                onChange={(event) => updateTheme({ accentColor: event.target.value })}
                className="h-10 w-full rounded-[8px] border border-line bg-white"
              />
            </label>
            <RangeField
              label="字号"
              min={12}
              max={18}
              step={1}
              value={resume.theme.fontSize}
              onChange={(value) => updateTheme({ fontSize: value })}
            />
            <RangeField
              label="行距"
              min={1.2}
              max={1.9}
              step={0.05}
              value={resume.theme.lineHeight}
              onChange={(value) => updateTheme({ lineHeight: value })}
            />
            <RangeField
              label="页边距"
              min={template.layout === "sidebar" ? 0 : 18}
              max={44}
              step={1}
              value={resume.theme.pageMargin}
              onChange={(value) => updateTheme({ pageMargin: value })}
            />
          </div>
        ) : null}
      </div>

      {templateOpen ? (
        <TemplateSwitcher
          onClose={() => {
            setTemplateOpen(false)
          }}
        />
      ) : null}
    </>
  )
}

function ToolButton({
  title,
  children,
  onClick
}: {
  title: string
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      className="flex h-10 w-10 items-center justify-center rounded-[8px] text-ink transition hover:bg-neutral-100"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="mb-3 block last:mb-0">
      <span className="mb-1 flex items-center justify-between text-xs font-bold text-neutral-500">
        {label}
        <span>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-accent"
      />
    </label>
  )
}
