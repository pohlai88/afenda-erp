import "server-only"

import { eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmMscCorrectiveAction,
  hrmMscHazardAssessment,
  hrmMscIncident,
  hrmMscSite,
} from "@afenda/platform/db/schema"

import { HRM_MSC_AUDIT } from "../msc.contract"
import { revalidateMscSurfaces } from "./msc-revalidate.server"
import type {
  HrmMscCorrectiveActionSourceKind,
  HrmMscHazardAssessmentType,
  HrmMscIncidentType,
} from "../schemas/msc-workflow-state.shared"

async function assertMscSiteInOrg(input: {
  organizationId: string
  siteId: string | null
}): Promise<{ ok: true } | { ok: false; form: string }> {
  if (!input.siteId) return { ok: true }
  const site = await db.query.hrmMscSite.findFirst({
    where: eq(hrmMscSite.id, input.siteId),
    columns: { organizationId: true },
  })
  if (!site || site.organizationId !== input.organizationId) {
    return { ok: false, form: "Site was not found." }
  }
  return { ok: true }
}

export async function createMscHazardAssessment(input: {
  organizationId: string
  userId: string
  siteId: string | null
  assessmentType: HrmMscHazardAssessmentType
  title: string
  taskDescription?: string | null
}): Promise<{ ok: true; assessmentId: string } | { ok: false; form?: string }> {
  const title = input.title.trim()
  if (!title) {
    return { ok: false, form: "Assessment title is required." }
  }

  const siteCheck = await assertMscSiteInOrg({
    organizationId: input.organizationId,
    siteId: input.siteId,
  })
  if (!siteCheck.ok) {
    return { ok: false, form: siteCheck.form }
  }

  const assessmentId = crypto.randomUUID()
  await db.insert(hrmMscHazardAssessment).values({
    id: assessmentId,
    organizationId: input.organizationId,
    siteId: input.siteId,
    assessmentType: input.assessmentType,
    title,
    taskDescription: input.taskDescription?.trim() || null,
    assessmentStatus: "draft",
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.hazardAssessmentCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_hazard",
    resourceId: assessmentId,
    metadata: { assessmentType: input.assessmentType },
  })

  revalidateMscSurfaces()
  return { ok: true, assessmentId }
}

export async function createMscIncident(input: {
  organizationId: string
  userId: string
  siteId: string | null
  employeeId: string | null
  incidentDate: string
  incidentType: HrmMscIncidentType
  severity: string | null
  description: string | null
}): Promise<{ ok: true; incidentId: string } | { ok: false; form?: string }> {
  if (!input.incidentDate.trim()) {
    return { ok: false, form: "Incident date is required." }
  }

  const siteCheck = await assertMscSiteInOrg({
    organizationId: input.organizationId,
    siteId: input.siteId,
  })
  if (!siteCheck.ok) {
    return { ok: false, form: siteCheck.form }
  }

  const incidentId = crypto.randomUUID()
  await db.insert(hrmMscIncident).values({
    id: incidentId,
    organizationId: input.organizationId,
    siteId: input.siteId,
    employeeId: input.employeeId,
    incidentDate: input.incidentDate,
    incidentType: input.incidentType,
    severity: input.severity?.trim() || null,
    description: input.description?.trim() || null,
    incidentStatus: "reported",
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.incidentReport,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_incident",
    resourceId: incidentId,
    metadata: { incidentType: input.incidentType },
  })

  revalidateMscSurfaces()
  return { ok: true, incidentId }
}

export async function createMscCorrectiveAction(input: {
  organizationId: string
  userId: string
  sourceKind: HrmMscCorrectiveActionSourceKind
  sourceId: string
  title: string
  priority: string
  dueDate: string | null
}): Promise<{ ok: true; actionId: string } | { ok: false; form?: string }> {
  const title = input.title.trim()
  if (!title) {
    return { ok: false, form: "Corrective action title is required." }
  }
  if (!input.sourceId.trim()) {
    return { ok: false, form: "Source record is required." }
  }

  const actionId = crypto.randomUUID()
  await db.insert(hrmMscCorrectiveAction).values({
    id: actionId,
    organizationId: input.organizationId,
    sourceKind: input.sourceKind,
    sourceId: input.sourceId,
    title,
    priority: input.priority,
    dueDate: input.dueDate,
    actionStatus: "open",
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.correctiveActionCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_corrective",
    resourceId: actionId,
    metadata: { sourceKind: input.sourceKind },
  })

  revalidateMscSurfaces()
  return { ok: true, actionId }
}
