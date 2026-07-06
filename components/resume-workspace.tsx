"use client"

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { ModuleSidebar } from "@/components/module-sidebar"
import { ResumePreview } from "@/components/resume-preview"
import { SectionEditor } from "@/components/section-editor"
import { TopBar } from "@/components/top-bar"
import { useResumeStore } from "@/store/resume-store"

export function ResumeWorkspace() {
  const parseStatus = useResumeStore((state) => state.parseStatus)
  const parseMessage = useResumeStore((state) => state.parseMessage)

  return (
    <main className="min-h-screen bg-[#f3f2ef]">
      <TopBar />
      <div className="no-print border-b border-line bg-white px-8 py-2">
        <div className="flex h-8 items-center gap-2 text-sm">
          {parseStatus === "parsing" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="font-medium text-ink">{parseMessage}</span>
            </>
          ) : null}
          {parseStatus === "success" ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span className="font-medium text-ink">{parseMessage}</span>
            </>
          ) : null}
          {parseStatus === "error" ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-600">{parseMessage}</span>
            </>
          ) : null}
          {parseStatus === "idle" ? (
            <span className="font-medium text-neutral-500">
              上传原简历后，系统会自动拆成左侧模块和中间可编辑字段。
            </span>
          ) : null}
        </div>
      </div>
      <div className="print-root grid h-[calc(100vh-141px)] grid-cols-[380px_minmax(430px,1fr)_minmax(620px,48vw)] overflow-hidden">
        <ModuleSidebar />
        <SectionEditor />
        <ResumePreview />
      </div>
    </main>
  )
}
