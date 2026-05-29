import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import type { OnboardingContractRow } from "./onboarding.queries.server"
import { ONBOARDING_LIST_SURFACE_IDS } from "./onboarding-surface-metadata.shared"

function formatChecklist(value: unknown): string {
  if (!value || typeof value !== "object") return "—"
  const completedSteps = (value as { completedSteps?: unknown }).completedSteps
  if (!Array.isArray(completedSteps) || completedSteps.length === 0) {
    return "—"
  }
  return completedSteps.map(String).join(", ")
}

type OnboardingListCopy = {
  empty: string
  colEmployee: string
  colCompleted: string
  readOnlyUpdateReason: string
}

type OnboardingListContext = {
  canUpdate: boolean
}

export function buildOnboardingListSurfaceConfiguration(
  rows: readonly OnboardingContractRow[],
  orgSlug: string,
  copy: OnboardingListCopy,
  context: OnboardingListContext,
  columnsId: string = ONBOARDING_LIST_SURFACE_IDS.contracts
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "hrm",
      object: "onboarding",
      function: "read",
    },
    surface: {
      header: { title: columnsId },
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "completed", header: copy.colCompleted },
    ],
    rows: rows.map((row) => ({
      id: row.contractId,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.legalName,
        completed: formatChecklist(row.onboardingChecklist),
      },
      trailingAction: resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: context.canUpdate,
        disabledReason: copy.readOnlyUpdateReason,
        descriptor: {
          id: "hrm.onboarding.record_step",
          label: "Record step",
          intent: "default",
        },
      }),
    })),
  })
}
