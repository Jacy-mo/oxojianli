"use client"

import { ChangeEvent, useRef } from "react"
import { FileUp, Loader2 } from "lucide-react"
import { useResumeStore } from "@/store/resume-store"
import type { ParseResumeResponse } from "@/types/resume"

export function UploadButton() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const parseStatus = useResumeStore((state) => state.parseStatus)
  const setResume = useResumeStore((state) => state.setResume)
  const setParseStatus = useResumeStore((state) => state.setParseStatus)
  const isParsing = parseStatus === "parsing"

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    setParseStatus("parsing", "正在解析简历...")

    try {
      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "上传解析失败")
      }

      const result = data as ParseResumeResponse
      const message =
        result.mode === "ai" ? "AI 已完成结构化解析" : "已使用本地规则完成基础拆解"
      setResume(result.resume, message)
    } catch (error) {
      setParseStatus("error", error instanceof Error ? error.message : "上传解析失败")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-line bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:border-ink disabled:opacity-60"
        disabled={isParsing}
        onClick={() => inputRef.current?.click()}
      >
        {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
        上传简历
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleFileChange}
      />
    </>
  )
}
