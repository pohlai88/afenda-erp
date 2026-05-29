import { z } from "zod"

import type { HrmEngagementAnonymityMode } from "./engagement-workflow.shared"

/** Frozen on schedule; `employeeIds` used for slice 3 invitations only. */
export const ENGAGEMENT_AUDIENCE_SNAPSHOT_VERSION = 1 as const

export const engagementAudienceFilterSchema = z.object({
  legalEntityCodes: z.array(z.string().trim().min(1).max(64)).optional(),
  departmentIds: z.array(z.string().uuid()).optional(),
  workLocationCodes: z.array(z.string().trim().min(1).max(64)).optional(),
  managerEmployeeIds: z.array(z.string().uuid()).optional(),
  jobGradeIds: z.array(z.string().uuid()).optional(),
  employmentTypes: z.array(z.string().trim().min(1).max(64)).optional(),
  workerCategories: z.array(z.string().trim().min(1).max(64)).optional(),
  minTenureMonths: z.number().int().min(0).max(600).nullable().optional(),
})

export type EngagementAudienceFilter = z.infer<
  typeof engagementAudienceFilterSchema
>

export type EngagementAudienceSegmentPreviewRow = {
  readonly dimension: "department"
  readonly segmentId: string
  readonly label: string
  readonly responseCount: number
  readonly suppressed: boolean
}

export type EngagementAudienceSnapshot = {
  readonly version: typeof ENGAGEMENT_AUDIENCE_SNAPSHOT_VERSION
  readonly filter: EngagementAudienceFilter
  readonly resolvedCount: number
  readonly employeeIds: readonly string[]
  readonly segmentPreview: readonly EngagementAudienceSegmentPreviewRow[]
}

export const engagementAudienceSnapshotSchema = z.object({
  version: z.literal(ENGAGEMENT_AUDIENCE_SNAPSHOT_VERSION),
  filter: engagementAudienceFilterSchema,
  resolvedCount: z.number().int().min(0),
  employeeIds: z.array(z.string().uuid()),
  segmentPreview: z.array(
    z.object({
      dimension: z.literal("department"),
      segmentId: z.string(),
      label: z.string(),
      responseCount: z.number().int().min(0),
      suppressed: z.boolean(),
    })
  ),
})

/** Single parser for JSONB `audienceSnapshot` — used by publish, config, and distribution loaders. */
export function parseEngagementAudienceSnapshot(
  raw: unknown
): EngagementAudienceSnapshot | null {
  const parsed = engagementAudienceSnapshotSchema.safeParse(raw)
  if (parsed.success) return parsed.data

  if (!raw || typeof raw !== "object") return null
  const record = raw as Record<string, unknown>
  if (record.version !== ENGAGEMENT_AUDIENCE_SNAPSHOT_VERSION) return null

  const filterRaw = record.filter ?? record
  const filterParsed = engagementAudienceFilterSchema.safeParse(filterRaw)
  const filter = filterParsed.success ? filterParsed.data : {}

  const employeeIds = Array.isArray(record.employeeIds)
    ? record.employeeIds.filter((id): id is string => typeof id === "string")
    : []

  const resolvedCount =
    typeof record.resolvedCount === "number"
      ? record.resolvedCount
      : employeeIds.length

  const segmentPreview = Array.isArray(record.segmentPreview)
    ? (record.segmentPreview as EngagementAudienceSnapshot["segmentPreview"])
    : []

  return {
    version: ENGAGEMENT_AUDIENCE_SNAPSHOT_VERSION,
    filter,
    resolvedCount,
    employeeIds,
    segmentPreview,
  }
}

export function isEngagementAudienceFilterEmpty(
  filter: EngagementAudienceFilter
): boolean {
  return (
    !(filter.legalEntityCodes?.length ?? 0) &&
    !(filter.departmentIds?.length ?? 0) &&
    !(filter.workLocationCodes?.length ?? 0) &&
    !(filter.managerEmployeeIds?.length ?? 0) &&
    !(filter.jobGradeIds?.length ?? 0) &&
    !(filter.employmentTypes?.length ?? 0) &&
    !(filter.workerCategories?.length ?? 0) &&
    filter.minTenureMonths == null
  )
}

/** Empty filter means all active employees in the org. */
export function engagementAudienceFilterIncludesAllEmployees(
  filter: EngagementAudienceFilter
): boolean {
  return isEngagementAudienceFilterEmpty(filter)
}

export function parseEngagementAudienceFilterFromFormData(
  formData: FormData
): EngagementAudienceFilter {
  const minTenureRaw = formData.get("minTenureMonths")
  const minTenureMonths =
    minTenureRaw === null || minTenureRaw === "" ? null : Number(minTenureRaw)

  return engagementAudienceFilterSchema.parse({
    legalEntityCodes: parseMultiStringField(formData, "legalEntityCodes"),
    departmentIds: parseMultiStringField(formData, "departmentIds"),
    workLocationCodes: parseMultiStringField(formData, "workLocationCodes"),
    managerEmployeeIds: parseMultiStringField(formData, "managerEmployeeIds"),
    jobGradeIds: parseMultiStringField(formData, "jobGradeIds"),
    employmentTypes: parseMultiStringField(formData, "employmentTypes"),
    workerCategories: parseMultiStringField(formData, "workerCategories"),
    minTenureMonths:
      minTenureMonths === null || Number.isNaN(minTenureMonths)
        ? null
        : minTenureMonths,
  })
}

function parseMultiStringField(
  formData: FormData,
  name: string
): string[] | undefined {
  const values = formData
    .getAll(name)
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
  return values.length > 0 ? values : undefined
}

export function buildEngagementAudienceSnapshot(input: {
  filter: EngagementAudienceFilter
  employeeIds: readonly string[]
  segmentPreview: readonly EngagementAudienceSegmentPreviewRow[]
}): EngagementAudienceSnapshot {
  return {
    version: ENGAGEMENT_AUDIENCE_SNAPSHOT_VERSION,
    filter: input.filter,
    resolvedCount: input.employeeIds.length,
    employeeIds: [...input.employeeIds],
    segmentPreview: input.segmentPreview,
  }
}

type DepartmentSegmentEmployee = {
  readonly id: string
  readonly currentDepartmentId: string | null
}

/** HRM-ENG-032 — department-level preview with anonymous suppression flags. */
export function buildDepartmentSegmentPreview(input: {
  employees: readonly DepartmentSegmentEmployee[]
  employeeIds: readonly string[]
  departmentLabels: ReadonlyMap<string, string>
  anonymityMode: HrmEngagementAnonymityMode
  minSegmentResponses: number
}): EngagementAudienceSegmentPreviewRow[] {
  const idSet = new Set(input.employeeIds)
  const counts = new Map<string, number>()

  for (const employee of input.employees) {
    if (!idSet.has(employee.id)) continue
    const deptId = employee.currentDepartmentId ?? "__unassigned__"
    counts.set(deptId, (counts.get(deptId) ?? 0) + 1)
  }

  const minThreshold =
    input.anonymityMode === "anonymous"
      ? Math.max(1, input.minSegmentResponses)
      : null

  return [...counts.entries()]
    .map(([segmentId, responseCount]) => ({
      dimension: "department" as const,
      segmentId,
      label:
        segmentId === "__unassigned__"
          ? "Unassigned"
          : (input.departmentLabels.get(segmentId) ?? segmentId),
      responseCount,
      suppressed:
        input.anonymityMode === "anonymous" && minThreshold != null
          ? responseCount < minThreshold
          : false,
    }))
    .sort((a, b) => b.responseCount - a.responseCount)
}
