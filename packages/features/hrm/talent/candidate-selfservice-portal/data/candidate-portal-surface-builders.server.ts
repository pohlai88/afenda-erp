import "server-only"

import {
  buildGovernedListSurface,
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"
import {
  candidatePortalCareersApplyPath,
  candidatePortalCareersDetailPath,
} from "@afenda/platform/portal"

import type { JobRequisitionRow } from "../../recruitment-onboarding/data/recruitment.queries.server"

import { candidatePortalListHeader } from "./candidate-portal-surface-metadata.shared"

type CareersListCopy = {
  emptyTitle: string
  colTitle: string
  colDepartment: string
  colHeadcount: string
  colStatus: string
  statusOpen: string
}

export function buildCandidateCareersListSurfaceConfiguration(
  rows: readonly JobRequisitionRow[],
  portalSlug: string,
  copy: CareersListCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId = "cssp-careers"
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: { tableDensity: "comfortable" },
    surface: {
      header: candidatePortalListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
      },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "department", header: copy.colDepartment },
      { id: "headcount", header: copy.colHeadcount, align: "end" },
      { id: "status", header: copy.colStatus, align: "center" },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      linkColumnId: "title",
      rowHref: candidatePortalCareersDetailPath(portalSlug, row.id),
      cells: {
        title: row.title,
        department: row.departmentName ?? "—",
        headcount: row.headcount,
        status: copy.statusOpen,
      },
    })),
  })
}

type ApplicationStatusCopy = {
  requisitionTitle: string
  stageLabel: string
}

export function buildCandidateApplicationStatusStatConfiguration(
  copy: ApplicationStatusCopy
): StatCardConfigurationInput {
  return buildGovernedStatGrid({
    presentationProfile: "erp-executive-summary",
    dataNature: "snapshot-summary",
    stats: [
      {
        label: copy.requisitionTitle,
        value: copy.stageLabel,
        delta: "Current stage",
        tone: "default",
      },
    ],
  })
}

type CareersDetailCopy = {
  title: string
  department: string
  headcount: string
  skills: string
}

export function buildCandidateCareersDetailStatConfiguration(
  row: JobRequisitionRow,
  copy: CareersDetailCopy
): StatCardConfigurationInput {
  const skills =
    row.requiredSkillCodes.length > 0
      ? row.requiredSkillCodes.join(", ")
      : copy.skills

  return buildGovernedStatGrid({
    presentationProfile: "erp-executive-summary",
    dataNature: "snapshot-summary",
    stats: [
      {
        label: copy.department,
        value: row.title,
        delta: `${copy.headcount}: ${row.headcount}`,
        tone: "default",
      },
      {
        label: "Skills",
        value: skills,
        delta: "Self-declare on apply",
        tone: "attention",
      },
    ],
  })
}

export function candidateCareersApplyHref(
  portalSlug: string,
  requisitionId: string
): string {
  return candidatePortalCareersApplyPath(portalSlug, requisitionId)
}
