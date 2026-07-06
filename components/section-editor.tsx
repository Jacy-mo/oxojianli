"use client"

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Trash2
} from "lucide-react"
import { ChangeEvent, useMemo, useState } from "react"
import type { ResumeItem, ResumeSection } from "@/types/resume"
import { createAvatarDataUrl } from "@/lib/avatar"
import { useActiveSection, useResumeStore } from "@/store/resume-store"

export function SectionEditor() {
  const activeSectionId = useResumeStore((state) => state.activeSectionId)

  return (
    <section className="no-print overflow-y-auto border-r border-line bg-[#f8f7f3] px-5 py-5">
      {activeSectionId === "basic" ? <BasicInfoEditor /> : <ContentSectionEditor />}
    </section>
  )
}

function BasicInfoEditor() {
  const [avatarStatus, setAvatarStatus] = useState("")
  const basic = useResumeStore((state) => state.resume.basic)
  const updateBasic = useResumeStore((state) => state.updateBasic)

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setAvatarStatus("uploading")
    try {
      const avatar = await createAvatarDataUrl(file)
      updateBasic({ avatar })
      setAvatarStatus("done")
      window.setTimeout(() => setAvatarStatus(""), 1200)
    } catch (error) {
      setAvatarStatus(error instanceof Error ? error.message : "头像上传失败")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <EditorHeader icon="👤" title="基本信息" />
      <div className="rounded-[8px] border border-line bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-24 w-20 items-center justify-center overflow-hidden rounded-[4px] border border-line bg-neutral-100">
            {basic.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={basic.avatar} alt={basic.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-neutral-500">{basic.name.slice(0, 1)}</span>
            )}
          </div>
          <label className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-line bg-white px-3 text-sm font-semibold transition hover:border-ink">
            {avatarStatus === "uploading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {avatarStatus === "uploading" ? "处理中" : "上传头像"}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
          {avatarStatus && avatarStatus !== "uploading" && avatarStatus !== "done" ? (
            <div className="text-sm font-semibold text-red-500">{avatarStatus}</div>
          ) : null}
          {avatarStatus === "done" ? (
            <div className="text-sm font-semibold text-accent">头像已更新</div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="姓名" value={basic.name} onChange={(value) => updateBasic({ name: value })} />
          <Field label="求职状态" value={basic.status || ""} onChange={(value) => updateBasic({ status: value })} />
          <Field
            label="岗位方向"
            value={basic.title || ""}
            onChange={(value) => updateBasic({ title: value })}
            className="col-span-2"
          />
          <Field label="邮箱" value={basic.email || ""} onChange={(value) => updateBasic({ email: value })} />
          <Field label="电话" value={basic.phone || ""} onChange={(value) => updateBasic({ phone: value })} />
          <Field label="城市" value={basic.city || ""} onChange={(value) => updateBasic({ city: value })} />
          <Field
            label="生日"
            value={basic.birthday || ""}
            onChange={(value) => updateBasic({ birthday: value })}
          />
        </div>
      </div>
    </div>
  )
}

function ContentSectionEditor() {
  const section = useActiveSection()
  const updateSection = useResumeStore((state) => state.updateSection)
  const addItem = useResumeStore((state) => state.addItem)
  const reorderItems = useResumeStore((state) => state.reorderItems)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  const items = useMemo(() => section?.items || [], [section?.items])

  if (!section) {
    return (
      <div className="rounded-[8px] border border-line bg-white p-6 text-sm font-medium text-neutral-500">
        请选择一个模块。
      </div>
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!section || !over || active.id === over.id) {
      return
    }

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    reorderItems(
      section.id,
      arrayMove(items, oldIndex, newIndex).map((item) => item.id)
    )
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <div className="mb-8 rounded-[8px] border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <input
            value={section.icon || ""}
            onChange={(event) => updateSection(section.id, { icon: event.target.value })}
            className="h-12 w-14 rounded-[8px] border border-line bg-white text-center text-xl outline-none focus:border-ink"
            aria-label="模块图标"
          />
          <input
            value={section.title}
            onChange={(event) => updateSection(section.id, { title: event.target.value })}
            className="h-12 min-w-0 flex-1 rounded-[8px] border border-line bg-white px-3 text-xl font-bold outline-none focus:border-ink"
            aria-label="模块标题"
          />
        </div>
      </div>

      <DndContext
        id="resume-item-sort"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {items.map((item, index) => (
              <SortableItemEditor key={item.id} section={section} item={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink text-sm font-bold text-white transition hover:bg-black"
        onClick={() => addItem(section.id)}
      >
        <Plus className="h-4 w-4" />
        添加内容
      </button>
    </div>
  )
}

function SortableItemEditor({
  section,
  item,
  index
}: {
  section: ResumeSection
  item: ResumeItem
  index: number
}) {
  const [open, setOpen] = useState(true)
  const updateItem = useResumeStore((state) => state.updateItem)
  const removeItem = useResumeStore((state) => state.removeItem)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-[8px] border border-line bg-white shadow-sm ${isDragging ? "opacity-70" : ""}`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-line px-4">
        <button
          type="button"
          className="flex h-9 w-7 items-center justify-center rounded-[6px] text-neutral-500 hover:bg-neutral-100"
          title="拖拽排序"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-ink">
            {item.title || `${section.title} ${index + 1}`}
          </div>
          <div className="truncate text-xs font-medium text-neutral-500">
            {item.role || item.subtitle || "点击展开编辑内容"}
          </div>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-[6px] text-neutral-700 hover:bg-neutral-100"
          title={open ? "折叠" : "展开"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-[6px] text-red-500 hover:bg-red-50"
          title="删除内容"
          onClick={() => {
            if (window.confirm("确认删除这条内容吗？")) {
              removeItem(section.id, item.id)
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div className="grid grid-cols-2 gap-4 p-4">
          <Field
            label={section.type === "education" ? "学校 / 机构" : "标题"}
            value={item.title || ""}
            onChange={(value) => updateItem(section.id, item.id, { title: value })}
          />
          <Field
            label={section.type === "project" ? "角色" : "副标题"}
            value={item.role || item.subtitle || ""}
            onChange={(value) =>
              updateItem(
                section.id,
                item.id,
                section.type === "project" || section.type === "work"
                  ? { role: value }
                  : { subtitle: value }
              )
            }
          />
          <Field
            label="开始时间"
            value={item.startDate || ""}
            icon={<Calendar className="h-4 w-4" />}
            onChange={(value) => updateItem(section.id, item.id, { startDate: value })}
          />
          <Field
            label="结束时间"
            value={item.endDate || ""}
            icon={<Calendar className="h-4 w-4" />}
            onChange={(value) => updateItem(section.id, item.id, { endDate: value })}
          />
          <Field
            label="地点"
            value={item.location || ""}
            icon={<MapPin className="h-4 w-4" />}
            onChange={(value) => updateItem(section.id, item.id, { location: value })}
          />
          <Field
            label="标签"
            value={(item.tags || []).join("，")}
            onChange={(value) =>
              updateItem(section.id, item.id, {
                tags: value
                  .split(/[，,]/)
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              })
            }
          />
          <TextArea
            label="正文"
            value={item.content || ""}
            onChange={(value) => updateItem(section.id, item.id, { content: value })}
            className="col-span-2"
          />
          <TextArea
            label="要点"
            value={(item.bullets || []).join("\n")}
            onChange={(value) =>
              updateItem(section.id, item.id, {
                bullets: value
                  .split(/\r?\n/)
                  .map((line) => line.trim())
                  .filter(Boolean)
              })
            }
            className="col-span-2"
          />
        </div>
      ) : null}
    </article>
  )
}

function EditorHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="mb-8 rounded-[8px] border border-line bg-white p-5 shadow-sm">
      <div className="flex h-10 items-center gap-3 text-xl font-bold text-ink">
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
        {title}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  icon,
  className = ""
}: {
  label: string
  value: string
  onChange: (value: string) => void
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-bold text-neutral-500">{label}</span>
      <span className="flex h-11 items-center gap-2 rounded-[8px] border border-line bg-white px-3 transition focus-within:border-ink">
        {icon ? <span className="text-neutral-400">{icon}</span> : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
        />
      </span>
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  className = ""
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-bold text-neutral-500">{label}</span>
      <textarea
        value={value}
        rows={5}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-[8px] border border-line bg-white px-3 py-2 text-sm font-medium leading-6 outline-none transition focus:border-ink"
      />
    </label>
  )
}
