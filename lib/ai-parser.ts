import OpenAI from "openai"
import { normalizeResume } from "@/lib/resume-factory"
import type { Resume } from "@/types/resume"

const systemPrompt = `你是一个严谨的中文简历结构化解析器。
把用户上传简历的原始文本转换成 JSON。只输出 JSON，不要 Markdown。
要求：
1. 尽量保留原简历信息，不要编造。
2. sections 只使用这些 type：education, work, project, skills, summary, advantages, custom。
3. 经历类内容拆成多条 items，文字说明放在 bullets 或 content。
4. 不确定的内容放入 custom 模块。
5. 日期保持原文本格式。`

export async function parseResumeWithAi(rawText: string, fileName?: string): Promise<Resume> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const openai = new OpenAI({ apiKey })
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_RESUME_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `文件名：${fileName || "未知"}\n\n原始文本：\n${rawText.slice(0, 24000)}\n\n请输出：{ "title": string, "basic": object, "sections": array, "theme": object }`
      }
    ],
    temperature: 0.1
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error("AI parser returned empty content")
  }

  return normalizeResume({
    ...JSON.parse(content),
    sourceText: rawText
  })
}
