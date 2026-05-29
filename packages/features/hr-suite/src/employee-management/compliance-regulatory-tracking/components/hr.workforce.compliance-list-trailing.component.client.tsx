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
  updateHrEmployeePolicyAcknowledgementAction,
  updateHrComplianceFilingAction,
  updateHrEmployeeSafetyTrainingRequirementAction,
  updateHrEmployeeWorkplaceSafetyRequirementAction,
  updateHrWorkAuthorizationDocumentAction,
  updateHrWorkEligibilityAction,
  waiveHrComplianceExceptionAction,
} from "../actions/hr.workforce.compliance.actions.server";
import { HRM_COMPLIANCE_FILING_STORED_STATUSES } from "../data/hr.workforce.compliance-filing.shared";
import { HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES } from "../data/hr.workforce.compliance-status.shared";
import { HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES } from "../data/hr.workforce.compliance-work-eligibility.shared";
import { HRM_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES } from "../data/hr.workforce.compliance-work-auth-documents.shared";
import {
  buildCertificationRequirementTrailingFields,
  buildExceptionTrailingActions,
} from "./hr.workforce.compliance-list-trailing.config.shared";
import {
  ComplianceTrailingActionFields,
  ComplianceTrailingActionForm,
  ComplianceTrailingHiddenRowId,
} from "./hr.workforce.compliance-list-trailing-form.component.client";
import { hrComplianceUiCopy } from "../surface/hr.workforce.compliance-ui.copy.shared";

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
              options: HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES,
              defaultFromCell: "trailingStatusValue",
              defaultValue: "pending",
            },
            {
              kind: "text",
              name: "reviewNotes",
              label: copy.trailingReviewNotesPlaceholder,
              placeholder: copy.trailingReviewNotesPlaceholder,
              defaultFromCell: "reviewNotesValue",
            },
          ]}
        />
      </ComplianceTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}

export function HrCompliancePolicyAcknowledgementsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.policyAcknowledgement;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={updateHrEmployeePolicyAcknowledgementAction}
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
              options: HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES,
              defaultFromCell: "trailingStatusValue",
              defaultValue: "pending",
            },
            {
              kind: "text",
              name: "reviewNotes",
              label: copy.trailingReviewNotesPlaceholder,
              placeholder: copy.trailingReviewNotesPlaceholder,
              defaultFromCell: "reviewNotesValue",
            },
          ]}
        />
      </ComplianceTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceFilingsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.filing;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={updateHrComplianceFilingAction}
        submitLabel={copy.trailingUpdateActionLabel}
        hiddenFields={
          <ComplianceTrailingHiddenRowId name="filingId" rowId={row.id} />
        }
      >
        <ComplianceTrailingActionFields
          row={row}
          fields={[
            {
              kind: "select",
              name: "status",
              label: copy.trailingUpdateStatusLabel,
              options: HRM_COMPLIANCE_FILING_STORED_STATUSES,
              defaultFromCell: "trailingStatusValue",
              defaultValue: "pending",
            },
            {
              kind: "datetime-local",
              name: "filingDeadline",
              label: copy.trailingDeadlineLabel,
              defaultFromCell: "filingDeadlineInput",
              placeholder: copy.trailingDeadlinePlaceholder,
            },
            {
              kind: "text",
              name: "reviewNotes",
              label: copy.trailingReviewNotesPlaceholder,
              placeholder: copy.trailingReviewNotesPlaceholder,
              defaultFromCell: "reviewNotesValue",
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
              defaultFromCell: "trailingStatusValue",
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
              defaultFromCell: "reviewNotesValue",
            },
          ]}
        />
      </ComplianceTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceWorkplaceSafetyRequirementsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.workplaceSafety;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={updateHrEmployeeWorkplaceSafetyRequirementAction}
        submitLabel={copy.trailingMarkCompliantLabel}
        hiddenFields={
          <ComplianceTrailingHiddenRowId name="requirementId" rowId={row.id} />
        }
      >
        <ComplianceTrailingActionFields
          row={row}
          fields={buildCertificationRequirementTrailingFields(
            copy,
            HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES,
          )}
        />
      </ComplianceTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceSafetyTrainingRequirementsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.safetyTraining;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={updateHrEmployeeSafetyTrainingRequirementAction}
        submitLabel={copy.trailingMarkCompliantLabel}
        hiddenFields={
          <ComplianceTrailingHiddenRowId name="requirementId" rowId={row.id} />
        }
      >
        <ComplianceTrailingActionFields
          row={row}
          fields={buildCertificationRequirementTrailingFields(
            copy,
            HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES,
          )}
        />
      </ComplianceTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceWorkAuthDocumentsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.workAuthDocuments;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={updateHrWorkAuthorizationDocumentAction}
        submitLabel={copy.trailingUpdateActionLabel}
        hiddenFields={
          <ComplianceTrailingHiddenRowId
            name="workAuthDocumentId"
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
              options: HRM_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES,
              defaultFromCell: "trailingStatusValue",
              defaultValue: "missing",
            },
            {
              kind: "text",
              name: "documentNumber",
              label: copy.trailingDocumentNumberPlaceholder,
              placeholder: copy.trailingDocumentNumberPlaceholder,
              defaultFromCell: "documentNumberValue",
            },
            {
              kind: "datetime-local",
              name: "issuedAt",
              label: copy.trailingIssuedPlaceholder,
              defaultFromCell: "issuedAtInput",
              placeholder: copy.trailingIssuedPlaceholder,
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
              defaultFromCell: "reviewNotesValue",
            },
          ]}
        />
      </ComplianceTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}
