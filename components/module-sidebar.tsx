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
import { Eye, EyeOff, GripVertical, LayoutPanelLeft, Plus, Trash2, User } from "lucide-react"
import { useMemo, useState } from "react"
import type { ResumeSection, ResumeSectionType } from "@/types/resume"
import { sectionTypeLabels } from "@/lib/resume-factory"
import { useResumeStore } from "@/store/resume-store"

const addableTypes: ResumeSectionType[] = [
  "education",
  "advantages",
  "project",
  "work",
  "skills",
  "summary",
  "custom"
]

export function ModuleSidebar() {
  const resume = useResumeStore((state) => state.resume)
  const activeSectionId = useResumeStore((state) => state.activeSectionId)
  const selectSection = useResumeStore((state) => state.selectSection)
  const addSection = useResumeStore((state) => state.addSection)
  const reorderSections = useResumeStore((state) => state.reorderSections)
  const [newType, setNewType] = useState<ResumeSectionType>("project")
  const sortedSections = useMemo(
    () => [...resume.sections].sort((a, b) => a.order - b.order),
    [resume.sections]
  )
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedSections.findIndex((section) => section.id === active.id)
    const newIndex = sortedSections.findIndex((section) => section.id === over.id)
    const nextSections = arrayMove(sortedSections, oldIndex, newIndex)
    reorderSections(nextSections.map((section) => section.id))
  }

  return (
    <aside className="no-print overflow-y-auto border-r border-line bg-[#fbfaf7] px-5 py-5">
      <div className="mb-5 flex items-center gap-3 text-xl font-bold text-ink">
        <LayoutPanelLeft className="h-5 w-5" />
        布局
      </div>

      <button
        type="button"
        className={`mb-5 flex h-[68px] w-full items-center gap-4 rounded-[8px] border bg-white px-4 text-left transition ${
          activeSectionId === "basic" ? "border-ink shadow-sm" : "border-line hover:border-neutral-400"
        }`}
        onClick={() => selectSection("basic")}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <User className="h-4 w-4" />
        </span>
        <span className="text-base font-semibold">基本信息</span>
      </button>

      <DndContext
        id="resume-section-sort"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSections.map((section) => section.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sortedSections.map((section) => (
              <SortableModuleItem key={section.id} section={section} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-5 rounded-[8px] border border-dashed border-neutral-300 bg-white p-3">
        <div className="flex gap-2">
          <select
            value={newType}
            onChange={(event) => setNewType(event.target.value as ResumeSectionType)}
            className="h-10 min-w-0 flex-1 rounded-[8px] border border-line bg-white px-3 text-sm outline-none focus:border-ink"
            aria-label="新增模块类型"
          >
            {addableTypes.map((type) => (
              <option key={type} value={type}>
                {sectionTypeLabels[type]}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-ink px-3 text-sm font-bold text-white"
            onClick={() => addSection(newType)}
          >
            <Plus className="h-4 w-4" />
            添加
          </button>
        </div>
      </div>
    </aside>
  )
}

function SortableModuleItem({ section }: { section: ResumeSection }) {
  const activeSectionId = useResumeStore((state) => state.activeSectionId)
  const selectSection = useResumeStore((state) => state.selectSection)
  const toggleSection = useResumeStore((state) => state.toggleSection)
  const removeSection = useResumeStore((state) => state.removeSection)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex h-[76px] items-center gap-2 rounded-[8px] border bg-white px-3 transition ${
        activeSectionId === section.id ? "border-ink shadow-sm" : "border-line hover:border-neutral-400"
      } ${isDragging ? "opacity-70" : ""}`}
    >
      <button
        type="button"
        className="flex h-9 w-7 items-center justify-center rounded-[6px] text-neutral-500 hover:bg-neutral-100"
        title="拖拽排序"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => selectSection(section.id)}
      >
        <span className="mr-3 text-xl" aria-hidden>
          {section.icon}
        </span>
        <span className="text-base font-semibold text-ink">{section.title}</span>
      </button>
      <button
        type="button"
        className="flex h-9 w-8 items-center justify-center rounded-[6px] text-neutral-700 hover:bg-neutral-100"
        title={section.visible ? "隐藏模块" : "显示模块"}
        onClick={() => toggleSection(section.id)}
      >
        {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      <button
        type="button"
        className="flex h-9 w-8 items-center justify-center rounded-[6px] text-red-500 hover:bg-red-50"
        title="删除模块"
        onClick={() => {
          if (window.confirm(`确认删除「${section.title}」吗？`)) {
            removeSection(section.id)
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
