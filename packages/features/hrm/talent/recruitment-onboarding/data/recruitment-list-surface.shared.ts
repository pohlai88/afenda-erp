import "server-only"

export const RECRUITMENT_READ_PERMISSION = {
  module: "hrm" as const,
  object: "recruitment" as const,
  function: "read" as const,
}

export const RECRUITMENT_PIPELINE_STAT_SURFACE_KEY =
  "hrm:recruitment:pipeline-summary" as const

export function recruitmentListHeader(columnsId: string) {
  return { title: columnsId }
}
