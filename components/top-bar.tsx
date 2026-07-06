"use client"

import { Download, FileJson, RotateCcw, Sparkles } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { UploadButton } from "@/components/upload-button"
import { useResumeStore } from "@/store/resume-store"

export function TopBar() {
  const title = useResumeStore((state) => state.resume.title)
  const parseStatus = useResumeStore((state) => state.parseStatus)
  const parseMessage = useResumeStore((state) => state.parseMessage)
  const updateTitle = useResumeStore((state) => state.updateTitle)
  const resetResume = useResumeStore((state) => state.resetResume)
  const resume = useResumeStore((state) => state.resume)

  return (
    <header className="no-print sticky top-0 z-40 flex h-[100px] items-center justify-between border-b border-line bg-[#fbfaf7]/95 px-8 backdrop-blur">
      <div className="flex items-center gap-4">
        <BrandLogo />
        <div className="inline-flex h-8 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 text-xs font-medium text-amber-700">
          <Sparkles className="h-3.5 w-3.5" />
          {parseStatus === "success" ? parseMessage : "本地自动保存"}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={title}
          onChange={(event) => updateTitle(event.target.value)}
          className="h-12 w-[300px] rounded-[8px] border border-line bg-white px-4 text-sm font-medium outline-none transition focus:border-ink"
          aria-label="简历标题"
        />
        <UploadButton />
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-line bg-white text-ink transition hover:border-ink"
          title="备份草稿 JSON"
          onClick={() => {
            const blob = new Blob([JSON.stringify(resume, null, 2)], {
              type: "application/json;charset=utf-8"
            })
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement("a")
            anchor.href = url
            anchor.download = `${resume.title || "oxo-resume-draft"}.json`
            anchor.click()
            URL.revokeObjectURL(url)
          }}
        >
          <FileJson className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-line bg-white text-ink transition hover:border-ink"
          title="重置示例"
          onClick={() => {
            if (window.confirm("确认重置当前简历内容吗？")) {
              resetResume()
            }
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-12 items-center gap-2 rounded-[12px] bg-ink px-5 text-sm font-bold text-white transition hover:bg-black"
          onClick={() => window.print()}
        >
          <Download className="h-4 w-4" />
          导出 PDF
        </button>
      </div>
    </header>
  )
}
