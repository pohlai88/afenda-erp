import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import type { HrmLmsCertificateRow } from "./lms.types.shared"
import {
  LMS_CERTIFICATES_LIST_COLUMNS_ID,
  lmsListHeader,
} from "../lms-list-surface.shared"

const LMS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "read" as const,
}

export type LmsCertificatesListCopy = {
  boardTitle: string
  boardDescription: string
  empty: string
  colEmployee: string
  colTarget: string
  colStatus: string
  colRef: string
  colIssued: string
  colExpires: string
  colRenewal: string
  renew: string
  formatStatus: (status: string) => string
  formatDate: (value: Date | null) => string
}

export function buildLmsCertificatesListSurfaceConfiguration(
  certificates: readonly HrmLmsCertificateRow[],
  orgSlug: string,
  copy: LmsCertificatesListCopy,
  options?: { showTrailing?: boolean }
): ListSurfaceRendererConfigurationInput {
  const showTrailing = options?.showTrailing ?? false

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LMS_READ_PERMISSION,
    presentation: {
      primaryColumnId: "employee",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "lmsCertificateSearch",
          label: "Search certificates",
          placeholder: "Search employee, target, status, or reference",
        },
        filters: [
          {
            id: "lms-certificate-status",
            label: copy.colStatus,
            param: "lmsCertificateStatus",
            options:
              certificates.length > 0
                ? Array.from(new Set(certificates.map((row) => row.status)))
                    .sort()
                    .map((value) => ({
                      label: copy.formatStatus(value),
                      value,
                    }))
                : [{ label: "All statuses", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "lmsCertificateSort",
          options: [
            {
              label: copy.colExpires,
              value: "expires-asc",
              columnId: "expires",
              direction: "asc",
            },
            {
              label: copy.colIssued,
              value: "issued-desc",
              columnId: "issued",
              direction: "desc",
            },
          ],
        },
        savedView: {
          label: "Certificate view",
          activeLabel: copy.boardTitle,
          href: "?lmsCertificateSort=expires-asc",
        },
        bulkActions: [
          {
            actionId: "erp.hrm.lms.certificate.renew-selected",
            label: copy.renew,
            disabledReason: "Select certificates before starting renewal.",
          },
        ],
      },
      selection: {
        mode: "multiple",
        label: "Select certificates",
        bulkScopeLabel: "selected certificates",
      },
      decisionLedger: { enabled: true, label: "Certificate evidence" },
    },
    surface: {
      header: lmsListHeader(LMS_CERTIFICATES_LIST_COLUMNS_ID),
      columnsId: LMS_CERTIFICATES_LIST_COLUMNS_ID,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      { id: "target", header: copy.colTarget },
      { id: "status", header: copy.colStatus },
      { id: "ref", header: copy.colRef },
      { id: "issued", header: copy.colIssued },
      { id: "expires", header: copy.colExpires },
      { id: "renewal", header: copy.colRenewal },
    ],
    rows: certificates.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: `${row.employeeNumber} — ${row.employeeName}`,
        target: row.targetLabel,
        status: copy.formatStatus(row.status),
        ref: row.certificateRef ?? "—",
        issued: copy.formatDate(row.issuedAt),
        expires: copy.formatDate(row.expiresAt),
        renewal: copy.formatDate(row.renewalDueAt),
      },
      decisionLedger: {
        reason: row.targetLabel,
        policyLabel: "Certification validity",
        actorLabel: row.employeeName,
        occurredAt:
          row.renewalDueAt?.toISOString() ?? row.issuedAt.toISOString(),
        riskTone: row.renewalDueAt ? "attention" : "default",
        nextActionLabel: row.renewalDueAt
          ? copy.renew
          : copy.formatStatus(row.status),
      },
      trailingAction: showTrailing
        ? { state: "ready" as const }
        : { state: "hidden" as const },
    })),
  })
}
