const maxAvatarWidth = 480
const maxAvatarHeight = 640

export async function createAvatarDataUrl(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片文件")
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(maxAvatarWidth / bitmap.width, maxAvatarHeight / bitmap.height, 1)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")

  if (!context) {
    bitmap.close()
    throw new Error("头像处理失败")
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return canvas.toDataURL("image/jpeg", 0.86)
}
