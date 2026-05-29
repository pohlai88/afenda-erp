"use client";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";

import {
  archiveHrComplianceObligationAction,
  assignHrComplianceCorrectiveActionAction,
  resolveHrComplianceExceptionAction,
  updateHrComplianceCorrectiveActionProgressAction,
  updateHrEmployeeLaborLawRequirementAction,
  updateHrWorkEligibilityAction,
  waiveHrComplianceExceptionAction,
} from "../actions/hr.workforce.compliance.actions.server";
import { HRM_COMPLIANCE_REQUIREMENT_STATUSES } from "../data/hr.workforce.compliance-status.shared";
import { HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES } from "../data/hr.workforce.compliance-work-eligibility.shared";
import type { ComplianceTrailingActionConfig } from "./hr.workforce.compliance-list-trailing.config.shared";
import {
  ComplianceTrailingActionFields,
  ComplianceTrailingActionForm,
  ComplianceTrailingHiddenRowId,
} from "./hr.workforce.compliance-list-trailing-form.component.client";
import { hrComplianceUiCopy } from "../surface/hr.workforce.compliance-ui.copy.shared";

function buildExceptionTrailingActions(
  copy: (typeof hrComplianceUiCopy)["exceptions"],
): ComplianceTrailingActionConfig[] {
  return [
    {
      submitLabel: copy.trailingAssignLabel,
      buttonVariant: "default",
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "correctiveActionDescription",
          label: copy.trailingAssignLabel,
          required: true,
          placeholder: copy.trailingCorrectiveDescriptionPlaceholder,
        },
        {
          kind: "datetime-local",
          name: "correctiveActionDueDate",
          label: copy.colDue,
          required: true,
          placeholder: copy.trailingCorrectiveDuePlaceholder,
        },
      ],
    },
    {
      submitLabel: copy.trailingProgressLabel,
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "progressNote",
          label: copy.trailingProgressLabel,
          required: true,
          placeholder: copy.trailingProgressPlaceholder,
        },
      ],
    },
    {
      submitLabel: copy.trailingResolveLabel,
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "resolutionNote",
          label: copy.trailingResolveLabel,
          placeholder: copy.trailingResolutionPlaceholder,
        },
      ],
    },
    {
      submitLabel: copy.trailingWaiveLabel,
      buttonVariant: "outline",
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "waiverReason",
          label: copy.trailingWaiverReasonPlaceholder,
          required: true,
          placeholder: copy.trailingWaiverReasonPlaceholder,
        },
        {
          kind: "text",
          name: "approvalReference",
          label: copy.trailingApprovalReferencePlaceholder,
          required: true,
          placeholder: copy.trailingApprovalReferencePlaceholder,
        },
      ],
    },
  ];
}

const EXCEPTION_TRAILING_SERVER_ACTIONS = [
  assignHrComplianceCorrectiveActionAction,
  updateHrComplianceCorrectiveActionProgressAction,
  resolveHrComplianceExceptionAction,
  waiveHrComplianceExceptionAction,
] as const;

export function HrComplianceObligationsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.obligations;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={archiveHrComplianceObligationAction}
        submitLabel={copy.trailingArchiveLabel}
        buttonVariant="secondary"
        hiddenFields={
          <ComplianceTrailingHiddenRowId name="obligationId" rowId={row.id} />
        }
      />
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceExceptionsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.exceptions;
  const actionConfigs = buildExceptionTrailingActions(copy);

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex min-w-56 flex-col gap-surface-md">
        {actionConfigs.map((config, index) => (
          <ComplianceTrailingActionForm
            key={config.submitLabel}
            action={EXCEPTION_TRAILING_SERVER_ACTIONS[index]!}
            submitLabel={config.submitLabel}
            buttonVariant={config.buttonVariant}
            hiddenFields={
              <ComplianceTrailingHiddenRowId
                name={config.hiddenFieldName}
                rowId={row.id}
              />
            }
          >
            <ComplianceTrailingActionFields row={row} fields={config.fields} />
          </ComplianceTrailingActionForm>
        ))}
      </div>
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceLaborLawRequirementsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.laborLaw;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={updateHrEmployeeLaborLawRequirementAction}
        submitLabel={copy.trailingMarkCompliantLabel}
        hiddenFields={
          <ComplianceTrailingHiddenRowId name="requirementId" rowId={row.id} />
        }
      >
        <ComplianceTrailingActionFields
          row={row}
          fields={[
            {
              kind: "select",
              name: "status",
              label: copy.trailingUpdateStatusLabel,
              options: HRM_COMPLIANCE_REQUIREMENT_STATUSES,
              defaultValue: "compliant",
            },
            {
              kind: "text",
              name: "reviewNotes",
              label: copy.trailingReviewNotesPlaceholder,
              placeholder: copy.trailingReviewNotesPlaceholder,
            },
          ]}
        />
      </ComplianceTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceWorkEligibilityTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.workEligibility;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={updateHrWorkEligibilityAction}
        submitLabel={copy.trailingUpdateActionLabel}
        hiddenFields={
          <ComplianceTrailingHiddenRowId
            name="workEligibilityId"
            rowId={row.id}
          />
        }
      >
        <ComplianceTrailingActionFields
          row={row}
          fields={[
            {
              kind: "select",
              name: "status",
              label: copy.trailingUpdateStatusLabel,
              options: HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES,
              defaultFromCell: "statusValue",
              defaultValue: "pending_verification",
            },
            {
              kind: "datetime-local",
              name: "expiresAt",
              label: copy.trailingExpiresPlaceholder,
              defaultFromCell: "expiresAtInput",
              placeholder: copy.trailingExpiresPlaceholder,
            },
            {
              kind: "text",
              name: "reviewNotes",
              label: copy.trailingReviewNotesPlaceholder,
              placeholder: copy.trailingReviewNotesPlaceholder,
            },
          ]}
        />
      </ComplianceTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}
