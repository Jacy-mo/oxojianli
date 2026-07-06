import { z } from "zod"

export const basicInfoSchema = z.object({
  name: z.string().default("未命名"),
  avatar: z.string().optional().default(""),
  title: z.string().optional().default(""),
  status: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  city: z.string().optional().default(""),
  birthday: z.string().optional().default(""),
  links: z.array(z.string()).optional().default([])
})

export const resumeItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  role: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  location: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  content: z.string().optional().default(""),
  bullets: z.array(z.string()).optional().default([]),
  metadata: z.record(z.unknown()).optional().default({})
})

export const resumeSectionSchema = z.object({
  id: z.string().optional(),
  type: z
    .enum([
      "basic",
      "education",
      "work",
      "project",
      "skills",
      "summary",
      "advantages",
      "custom"
    ])
    .default("custom"),
  title: z.string().default("自定义模块"),
  icon: z.string().optional().default("✨"),
  visible: z.boolean().optional().default(true),
  order: z.number().optional().default(0),
  items: z.array(resumeItemSchema).optional().default([])
})

export const resumeThemeSchema = z.object({
  accentColor: z.string().default("#0f9f9a"),
  fontFamily: z.string().default("system-ui"),
  fontSize: z.number().default(14),
  lineHeight: z.number().default(1.55),
  pageMargin: z.number().default(28)
})

export const resumeSchema = z.object({
  id: z.string().optional(),
  title: z.string().default("我的简历"),
  basic: basicInfoSchema.default({
    name: "未命名",
    avatar: "",
    title: "",
    status: "",
    email: "",
    phone: "",
    city: "",
    birthday: "",
    links: []
  }),
  sections: z.array(resumeSectionSchema).default([]),
  theme: resumeThemeSchema.default({
    accentColor: "#0f9f9a",
    fontFamily: "system-ui",
    fontSize: 14,
    lineHeight: 1.55,
    pageMargin: 28
  }),
  sourceText: z.string().optional().default(""),
  updatedAt: z.string().optional()
})

export type ResumeSchemaInput = z.input<typeof resumeSchema>
