import OpenAI from "openai"
import { normalizeResume } from "@/lib/resume-factory"
import { repairResumeStructure } from "@/lib/resume-repair"
import type { Resume } from "@/types/resume"

const systemPrompt = `你是一个严谨的中文简历结构化解析器。
把用户上传简历的原始文本转换成 JSON。只输出 JSON，不要包裹 Markdown 代码块；字符串字段内部允许使用 Markdown。
要求：
1. 尽量保留原简历信息，不要编造。
2. sections 只使用这些 type：education, work, project, skills, summary, advantages, custom。
3. 严格保持原简历从上到下的顺序，section 顺序和 item 顺序都不能打乱。
4. 经历类必须按“每一段教育/每一家公司/每一个项目”拆成独立 items，不要把多个项目合并到一个 item。
5. 项目经历中，项目名称放 title，角色放 role，时间放 startDate/endDate，技术栈放 tags，不要把这些字段重复塞进 bullets。
6. 如果原始文本中包含 Markdown 加粗（例如 **关键词**），必须保留在 content 或 bullets 中。
7. 对“业务痛点：”“工程优化：”“交付成果：”“985 逻辑底蕴：”这类段内小标题，使用 Markdown 加粗小标题，例如 **业务痛点：** 正文。
8. bullets 只放职责、动作、成果、业务痛点、工程优化、交付成果等正文要点，保持原文顺序。
9. 不确定的内容放入 custom 模块。
10. 日期保持原文本格式。`

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

  return repairResumeStructure(normalizeResume({
    ...JSON.parse(content),
    sourceText: rawText
  }))
}
