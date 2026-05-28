import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceHeader,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { PayrollPeriodTraceability } from "./payroll-engine.server"

const PAYROLL_READ_PERMISSION = {
  module: "hrm" as const,
  object: "payroll" as const,
  function: "read" as const,
}

type PayrollTraceabilityListCopy = {
  empty: string
  colQuestion: string
  colValue: string
  colStatus: string
  rows: readonly {
    id: string
    question: string
    value: string
    ok: boolean
    okLabel: string
    notOkLabel: string
  }[]
}

export function buildPayrollTraceabilityListSurfaceConfiguration(
  copy: PayrollTraceabilityListCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId = "hrm-payroll-traceability"
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-audit-ledger",
    requiresErpPermission: PAYROLL_READ_PERMISSION,
    presentation: {
      primaryColumnId: "question",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "payrollTraceSearch",
          label: "Search traceability",
          placeholder: "Search question, value, or status",
        },
        filters: [
          {
            id: "traceability-status",
            label: copy.colStatus,
            param: "payrollTraceStatus",
            options: [
              { label: copy.rows[0]?.okLabel ?? "Complete", value: "ok" },
              {
                label: copy.rows[0]?.notOkLabel ?? "Needs review",
                value: "gap",
              },
            ],
          },
        ],
        sort: {
          label: "Sort",
          param: "payrollTraceSort",
          options: [
            {
              label: copy.colQuestion,
              value: "question-asc",
              columnId: "question",
              direction: "asc",
            },
            {
              label: copy.colStatus,
              value: "status-asc",
              columnId: "status",
              direction: "asc",
            },
          ],
        },
        savedView: {
          label: "Traceability view",
          activeLabel: "Payroll evidence",
          href: "?payrollTraceStatus=gap",
        },
      },
      decisionLedger: { enabled: true, label: "Traceability evidence" },
    },
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "question",
        header: copy.colQuestion,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 260,
        resizable: true,
      },
      {
        id: "value",
        header: copy.colValue,
        priority: "secondary",
        wrap: true,
        resizable: true,
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: copy.rows.map((row) => ({
      id: row.id,
      rowTone: row.ok ? "default" : "attention",
      cells: {
        question: row.question,
        value: row.value,
        status: row.ok ? row.okLabel : row.notOkLabel,
      },
      decisionLedger: {
        reason: row.question,
        policyLabel: "Payroll traceability",
        actorLabel: "Payroll engine",
        riskTone: row.ok ? "positive" : "attention",
        nextActionLabel: row.ok ? row.okLabel : row.notOkLabel,
      },
    })),
  })
}

export function payrollTraceabilityListRows(
  traceability: PayrollPeriodTraceability,
  copy: {
    q1: string
    q2: string
    q3: string
    q4: string
    q5: string
    q6: string
    q7: string
    q8: string
    complete: string
    missing: string
    pending: string
    notPinned: string
  }
) {
  return [
    {
      id: "q1",
      question: copy.q1,
      value: String(traceability.employeeCount),
      ok: traceability.employeeCount > 0,
      okLabel: copy.complete,
      notOkLabel: copy.missing,
    },
    {
      id: "q2",
      question: copy.q2,
      value: traceability.allContractsSnapshotted
        ? copy.complete
        : copy.missing,
      ok: traceability.allContractsSnapshotted,
      okLabel: copy.complete,
      notOkLabel: copy.missing,
    },
    {
      id: "q3",
      question: copy.q3,
      value: traceability.allProfilesSnapshotted ? copy.complete : copy.missing,
      ok: traceability.allProfilesSnapshotted,
      okLabel: copy.complete,
      notOkLabel: copy.missing,
    },
    {
      id: "q4",
      question: copy.q4,
      value: traceability.attendanceComplete ? copy.complete : copy.pending,
      ok: traceability.attendanceComplete,
      okLabel: copy.complete,
      notOkLabel: copy.pending,
    },
    {
      id: "q5",
      question: copy.q5,
      value: traceability.rulePackVersion ?? copy.notPinned,
      ok: traceability.rulePackVersion !== null,
      okLabel: copy.complete,
      notOkLabel: copy.notPinned,
    },
    {
      id: "q6",
      question: copy.q6,
      value: String(traceability.runsWithBlockers),
      ok: traceability.runsWithBlockers === 0,
      okLabel: copy.complete,
      notOkLabel: copy.missing,
    },
    {
      id: "q7",
      question: copy.q7,
      value: traceability.approvalExists ? copy.complete : copy.missing,
      ok: traceability.approvalExists,
      okLabel: copy.complete,
      notOkLabel: copy.missing,
    },
    {
      id: "q8",
      question: copy.q8,
      value: String(traceability.approvedUnpaidClaimCount),
      ok: true,
      okLabel: copy.complete,
      notOkLabel: copy.missing,
    },
  ] as const
}
