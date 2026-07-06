import { NextResponse } from "next/server"
import mammoth from "mammoth"
import { fallbackParseResume } from "@/lib/fallback-parser"
import { parseResumeWithAi } from "@/lib/ai-parser"
import type { ParseResumeResponse } from "@/types/resume"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传 PDF 或 DOCX 简历文件" }, { status: 400 })
    }

    const rawText = await extractText(file)
    if (!rawText.trim()) {
      return NextResponse.json({ error: "没有从文件中提取到有效文本" }, { status: 422 })
    }

    try {
      const resume = await parseResumeWithAi(rawText, file.name)
      const response: ParseResumeResponse = {
        resume,
        rawText,
        mode: "ai"
      }

      return NextResponse.json(response)
    } catch (error) {
      const resume = fallbackParseResume(rawText, file.name)
      const response: ParseResumeResponse = {
        resume,
        rawText,
        mode: "fallback",
        warning: error instanceof Error ? error.message : "AI 解析失败，已使用规则兜底"
      }

      return NextResponse.json(response)
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "解析失败"
      },
      { status: 500 }
    )
  }
}

async function extractText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdfParse = (await import("pdf-parse")).default
    const result = await pdfParse(buffer)
    return normalizeWhitespace(result.text)
  }

  if (
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer })
    return normalizeWhitespace(result.value)
  }

  if (name.endsWith(".txt") || file.type.startsWith("text/")) {
    return normalizeWhitespace(buffer.toString("utf-8"))
  }

  throw new Error("暂只支持 PDF、DOCX 和 TXT 文件")
}

function normalizeWhitespace(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
