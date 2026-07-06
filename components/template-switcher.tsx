"use client"

import { ChangeEvent, useMemo, useRef, useState } from "react"
import {
  Check,
  Download,
  FileUp,
  Save,
  Trash2,
  X
} from "lucide-react"
import type { ResumeTemplate } from "@/types/template"
import {
  builtInTemplates,
  downloadTemplate,
  getTemplateById,
  normalizeImportedTemplate
} from "@/lib/resume-templates"
import { useResumeStore } from "@/store/resume-store"

export function TemplateSwitcher({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [message, setMessage] = useState("")
  const selectedTemplateId = useResumeStore((state) => state.selectedTemplateId)
  const customTemplates = useResumeStore((state) => state.customTemplates)
  const selectTemplate = useResumeStore((state) => state.selectTemplate)
  const saveCurrentTemplate = useResumeStore((state) => state.saveCurrentTemplate)
  const importTemplate = useResumeStore((state) => state.importTemplate)
  const removeCustomTemplate = useResumeStore((state) => state.removeCustomTemplate)
  const selectedTemplate = useMemo(
    () => getTemplateById(selectedTemplateId, customTemplates),
    [customTemplates, selectedTemplateId]
  )

  function handleSaveCurrent() {
    const name = window.prompt("给当前模板起个名字", `${selectedTemplate.name} 副本`)
    if (!name?.trim()) {
      return
    }

    saveCurrentTemplate(name.trim())
    setMessage("已保存为自定义模板")
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const content = await file.text()
      const template = normalizeImportedTemplate(JSON.parse(content))
      importTemplate(template)
      setMessage("模板已导入并应用")
      onClose()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "模板导入失败")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <div
      className="no-print absolute inset-0 z-40 bg-[#ecebea]/80 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="ml-auto flex h-full max-w-[920px] flex-col overflow-hidden rounded-[12px] bg-[#fbfaf7] shadow-soft">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-line px-7">
          <div>
            <h2 className="text-2xl font-black text-ink">切换模板</h2>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              模板只改变排版和样式，上传解析出来的简历内容会自动适配。
            </p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-line bg-white text-ink hover:border-ink"
            title="关闭"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-white px-7 py-4">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-ink px-4 text-sm font-bold text-white"
            onClick={handleSaveCurrent}
          >
            <Save className="h-4 w-4" />
            保存当前模板
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-line bg-white px-4 text-sm font-bold text-ink hover:border-ink"
            onClick={() => inputRef.current?.click()}
          >
            <FileUp className="h-4 w-4" />
            导入模板
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-line bg-white px-4 text-sm font-bold text-ink hover:border-ink"
            onClick={() => downloadTemplate(selectedTemplate)}
          >
            <Download className="h-4 w-4" />
            导出当前模板
          </button>
          {message ? <span className="text-sm font-semibold text-accent">{message}</span> : null}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".json,.oxo-template.json,application/json"
            onChange={handleImport}
          />
        </div>

        <div className="overflow-y-auto px-7 py-6">
          <TemplateSection
            title="内置模板"
            templates={builtInTemplates}
            selectedTemplateId={selectedTemplateId}
            onSelect={(templateId) => {
              selectTemplate(templateId)
              onClose()
            }}
          />
          <TemplateSection
            title="我的模板"
            templates={customTemplates}
            selectedTemplateId={selectedTemplateId}
            onSelect={(templateId) => {
              selectTemplate(templateId)
              onClose()
            }}
            onRemove={removeCustomTemplate}
          />
        </div>
      </div>
    </div>
  )
}

function TemplateSection({
  title,
  templates,
  selectedTemplateId,
  onSelect,
  onRemove
}: {
  title: string
  templates: ResumeTemplate[]
  selectedTemplateId: string
  onSelect: (templateId: string) => void
  onRemove?: (templateId: string) => void
}) {
  if (templates.length === 0) {
    return (
      <section className="mb-8">
        <h3 className="mb-4 text-lg font-black text-ink">{title}</h3>
        <div className="rounded-[8px] border border-dashed border-neutral-300 bg-white px-5 py-8 text-sm font-semibold text-neutral-500">
          暂无自定义模板，可以先保存当前模板或导入模板文件。
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h3 className="mb-4 text-lg font-black text-ink">{title}</h3>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {templates.map((template) => {
          const selected = template.id === selectedTemplateId

          return (
            <div
              key={template.id}
              className={`group relative rounded-[8px] border bg-white shadow-sm transition hover:border-ink ${
                selected ? "border-ink ring-2 ring-ink/10" : "border-line"
              }`}
            >
              <button
                type="button"
                className="block w-full p-3 text-left"
                onClick={() => onSelect(template.id)}
              >
                <TemplateThumbnail template={template} />
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-ink">{template.name}</div>
                    <div className="mt-1 line-clamp-2 min-h-[36px] text-xs font-medium leading-[18px] text-neutral-500">
                      {template.description}
                    </div>
                  </div>
                  {selected ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
              </button>
              {onRemove ? (
                <button
                  type="button"
                  className="absolute right-3 top-3 hidden h-8 w-8 items-center justify-center rounded-[8px] bg-white text-red-500 shadow-sm group-hover:flex"
                  title="删除模板"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemove(template.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TemplateThumbnail({ template }: { template: ResumeTemplate }) {
  const accent = template.theme.accentColor
  const dark = template.layout === "executive"
  const sidebar = template.layout === "sidebar"
  const compact = template.layout === "compact" || template.layout === "ats"

  return (
    <div className="h-[178px] overflow-hidden rounded-[6px] border border-line bg-[#f2f1ed] p-2">
      <div className="h-full rounded-[4px] bg-white shadow-sm">
        {dark ? <div className="h-11 rounded-t-[4px] bg-[#111827]" /> : null}
        <div className={`flex h-full gap-2 p-3 ${dark ? "-mt-11 pt-5" : ""}`}>
          {sidebar ? (
            <div className="h-full w-[32%] rounded-[4px]" style={{ backgroundColor: accent }} />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              {template.showAvatar ? (
                <div
                  className={`h-9 w-8 shrink-0 rounded-[3px] ${dark ? "bg-white/85" : "bg-neutral-200"}`}
                />
              ) : null}
              <div className="flex-1 space-y-1">
                <div
                  className={`h-3 rounded-full ${dark ? "bg-white" : "bg-neutral-900"}`}
                  style={{ width: compact ? "48%" : "62%" }}
                />
                <div className="h-2 rounded-full bg-neutral-300" style={{ width: "72%" }} />
              </div>
            </div>
            {Array.from({ length: compact ? 7 : 5 }).map((_, index) => (
              <div key={index} className="mb-3">
                <div
                  className="mb-1 h-2.5 rounded-full"
                  style={{ backgroundColor: index % 2 === 0 ? accent : "#d4d4d4", width: "36%" }}
                />
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-neutral-300" />
                  <div className="h-1.5 rounded-full bg-neutral-200" style={{ width: "88%" }} />
                  <div className="h-1.5 rounded-full bg-neutral-200" style={{ width: "68%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
