"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type {
  BasicInfo,
  Resume,
  ResumeItem,
  ResumeSection,
  ResumeSectionType,
  ResumeTheme
} from "@/types/resume"
import type { ResumeTemplate } from "@/types/template"
import { createEmptyItem, createSampleResume, createSection } from "@/lib/resume-factory"
import { defaultTemplateId, getTemplateById } from "@/lib/resume-templates"
import { createId } from "@/lib/id"

type ParseStatus = "idle" | "parsing" | "success" | "error"

type ResumeState = {
  resume: Resume
  activeSectionId: string
  selectedTemplateId: string
  customTemplates: ResumeTemplate[]
  parseStatus: ParseStatus
  parseMessage: string
  setResume: (resume: Resume, message?: string) => void
  setParseStatus: (status: ParseStatus, message?: string) => void
  updateTitle: (title: string) => void
  updateBasic: (patch: Partial<BasicInfo>) => void
  updateTheme: (patch: Partial<ResumeTheme>) => void
  selectTemplate: (templateId: string) => void
  saveCurrentTemplate: (name: string) => void
  importTemplate: (template: ResumeTemplate) => void
  removeCustomTemplate: (templateId: string) => void
  selectSection: (sectionId: string) => void
  addSection: (type: ResumeSectionType) => void
  updateSection: (sectionId: string, patch: Partial<ResumeSection>) => void
  removeSection: (sectionId: string) => void
  toggleSection: (sectionId: string) => void
  reorderSections: (sectionIds: string[]) => void
  reorderItems: (sectionId: string, itemIds: string[]) => void
  addItem: (sectionId: string) => void
  updateItem: (sectionId: string, itemId: string, patch: Partial<ResumeItem>) => void
  removeItem: (sectionId: string, itemId: string) => void
  resetResume: () => void
}

const now = () => new Date().toISOString()

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resume: createSampleResume(),
      activeSectionId: "basic",
      selectedTemplateId: defaultTemplateId,
      customTemplates: [],
      parseStatus: "idle",
      parseMessage: "",
      setResume: (resume, message) =>
        set({
          resume: { ...resume, updatedAt: now() },
          activeSectionId: "basic",
          parseStatus: message ? "success" : "idle",
          parseMessage: message || ""
        }),
      setParseStatus: (status, message = "") =>
        set({
          parseStatus: status,
          parseMessage: message
        }),
      updateTitle: (title) =>
        set((state) => ({
          resume: { ...state.resume, title, updatedAt: now() }
        })),
      updateBasic: (patch) =>
        set((state) => ({
          resume: {
            ...state.resume,
            basic: { ...state.resume.basic, ...patch },
            updatedAt: now()
          }
        })),
      updateTheme: (patch) =>
        set((state) => ({
          resume: {
            ...state.resume,
            theme: { ...state.resume.theme, ...patch },
            updatedAt: now()
          }
        })),
      selectTemplate: (templateId) =>
        set((state) => {
          const template = getTemplateById(templateId, state.customTemplates)

          return {
            selectedTemplateId: template.id,
            resume: {
              ...state.resume,
              theme: template.theme,
              updatedAt: now()
            }
          }
        }),
      saveCurrentTemplate: (name) =>
        set((state) => {
          const baseTemplate = getTemplateById(state.selectedTemplateId, state.customTemplates)
          const template: ResumeTemplate = {
            ...baseTemplate,
            id: createId("custom-template"),
            name,
            description: "从当前页面样式保存的自定义模板",
            theme: state.resume.theme,
            source: "custom",
            createdAt: now()
          }

          return {
            selectedTemplateId: template.id,
            customTemplates: [...state.customTemplates, template]
          }
        }),
      importTemplate: (template) =>
        set((state) => ({
          selectedTemplateId: template.id,
          customTemplates: [
            ...state.customTemplates.filter((current) => current.id !== template.id),
            template
          ],
          resume: {
            ...state.resume,
            theme: template.theme,
            updatedAt: now()
          }
        })),
      removeCustomTemplate: (templateId) =>
        set((state) => {
          const customTemplates = state.customTemplates.filter((template) => template.id !== templateId)
          const selectedTemplateId =
            state.selectedTemplateId === templateId ? defaultTemplateId : state.selectedTemplateId
          const template = getTemplateById(selectedTemplateId, customTemplates)

          return {
            customTemplates,
            selectedTemplateId,
            resume:
              state.selectedTemplateId === templateId
                ? { ...state.resume, theme: template.theme, updatedAt: now() }
                : state.resume
          }
        }),
      selectSection: (sectionId) => set({ activeSectionId: sectionId }),
      addSection: (type) =>
        set((state) => {
          const section = createSection(type, state.resume.sections.length)

          return {
            resume: {
              ...state.resume,
              sections: [...state.resume.sections, section],
              updatedAt: now()
            },
            activeSectionId: section.id
          }
        }),
      updateSection: (sectionId, patch) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) =>
              section.id === sectionId ? { ...section, ...patch } : section
            ),
            updatedAt: now()
          }
        })),
      removeSection: (sectionId) =>
        set((state) => {
          const sections = state.resume.sections.filter((section) => section.id !== sectionId)
          const nextActive =
            state.activeSectionId === sectionId ? sections[0]?.id || "basic" : state.activeSectionId

          return {
            resume: { ...state.resume, sections, updatedAt: now() },
            activeSectionId: nextActive
          }
        }),
      toggleSection: (sectionId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) =>
              section.id === sectionId ? { ...section, visible: !section.visible } : section
            ),
            updatedAt: now()
          }
        })),
      reorderSections: (sectionIds) =>
        set((state) => {
          const sectionMap = new Map(state.resume.sections.map((section) => [section.id, section]))
          const ordered = sectionIds
            .map((id, order) => {
              const section = sectionMap.get(id)
              return section ? { ...section, order } : null
            })
            .filter((section): section is ResumeSection => Boolean(section))

          return {
            resume: {
              ...state.resume,
              sections: ordered,
              updatedAt: now()
            }
          }
        }),
      reorderItems: (sectionId, itemIds) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) => {
              if (section.id !== sectionId) {
                return section
              }

              const itemMap = new Map(section.items.map((item) => [item.id, item]))
              return {
                ...section,
                items: itemIds
                  .map((id) => itemMap.get(id))
                  .filter((item): item is ResumeItem => Boolean(item))
              }
            }),
            updatedAt: now()
          }
        })),
      addItem: (sectionId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) =>
              section.id === sectionId
                ? { ...section, items: [...section.items, createEmptyItem(section.type)] }
                : section
            ),
            updatedAt: now()
          }
        })),
      updateItem: (sectionId, itemId, patch) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    items: section.items.map((item) =>
                      item.id === itemId ? { ...item, ...patch } : item
                    )
                  }
                : section
            ),
            updatedAt: now()
          }
        })),
      removeItem: (sectionId, itemId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((section) =>
              section.id === sectionId
                ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
                : section
            ),
            updatedAt: now()
          }
        })),
      resetResume: () =>
        set({
          resume: createSampleResume(),
          activeSectionId: "basic",
          selectedTemplateId: defaultTemplateId,
          parseStatus: "idle",
          parseMessage: ""
        })
    }),
    {
      name: "oxo-resume-builder-v1",
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        resume: state.resume,
        activeSectionId: state.activeSectionId,
        selectedTemplateId: state.selectedTemplateId,
        customTemplates: state.customTemplates
      })
    }
  )
)

export function useActiveSection() {
  return useResumeStore((state) => {
    if (state.activeSectionId === "basic") {
      return null
    }

    return state.resume.sections.find((section) => section.id === state.activeSectionId) || null
  })
}
