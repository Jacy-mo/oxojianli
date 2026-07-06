import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "oxo简历",
  description: "上传、解析、编辑并导出结构化简历"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
