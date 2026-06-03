"use client";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";

import {
  archiveHrComplianceObligationAction,
  assignHrComplianceCorrectiveActionAction,
  decideHrComplianceReviewQueueItemAction,
  linkHrComplianceEvidenceAction,
  resolveHrComplianceExceptionAction,
  unlinkHrComplianceEvidenceAction,
  updateHrComplianceCorrectiveActionProgressAction,
  updateHrComplianceEvidenceSubmissionStateAction,
  updateHrEmployeeLaborLawRequirementAction,
  updateHrEmployeeStatutoryRequirementAction,
  updateHrEmployeePolicyAcknowledgementAction,
  updateHrComplianceFilingAction,
  updateHrEmployeeSafetyTrainingRequirementAction,
  updateHrEmployeeWorkplaceSafetyRequirementAction,
  updateHrWorkAuthorizationDocumentAction,
  updateHrWorkEligibilityAction,
  waiveHrComplianceExceptionAction,
} from "./hr.workforce.compliance.actions.server";
import { HRM_COMPLIANCE_FILING_STORED_STATUSES } from "./hr.workforce.compliance-filing.shared";
import { HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES } from "./hr.workforce.compliance-status.shared";
import { HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES } from "./hr.workforce.compliance-work-eligibility.shared";
import { HRM_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES } from "./hr.workforce.compliance-work-auth-documents.shared";
import {
  HRM_COMPLIANCE_EVIDENCE_STORED_SUBMISSION_STATES,
  type HrComplianceDocumentPickerOption,
  type HrComplianceEvidenceRecordKind,
} from "./hr.workforce.compliance-evidence-links.shared";
import {
  buildCertificationRequirementTrailingFields,
  buildEvidenceLinksTrailingActions,
  buildExceptionTrailingActions,
  buildLinkEvidenceTrailingFields,
} from "./hr.workforce.compliance-list-trailing.config.shared";
import {
  ComplianceEvidenceDocumentPickerEmpty,
} from "./hr.workforce.compliance-forms.component.client";
import {
  ComplianceTrailingActionFields,
  ComplianceTrailingActionForm,
  ComplianceTrailingHiddenRowId,
} from "./hr.workforce.compliance-list-trailing-form.component.client";
import { useHrComplianceTrailingPickers } from "./hr.workforce.compliance.trailing-pickers.component.client";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

const EXCEPTION_TRAILING_SERVER_ACTIONS = {
  assign: assignHrComplianceCorrectiveActionAction,
  progress: updateHrComplianceCorrectiveActionProgressAction,
  resolve: resolveHrComplianceExceptionAction,
  waive: waiveHrComplianceExceptionAction,
} as const;

const EVIDENCE_LINKS_TRAILING_SERVER_ACTIONS = [
  updateHrComplianceEvidenceSubmissionStateAction,
  unlinkHrComplianceEvidenceAction,
] as const;

function ComplianceLinkEvidenceTrailingForm({
  row,
  recordKind,
  recordIdFieldName,
  documentOptions,
}: {
  row: GovernedListTrailingCellProps["row"];
  recordKind: HrComplianceEvidenceRecordKind;
  recordIdFieldName: string;
  documentOptions: readonly HrComplianceDocumentPickerOption[];
}) {
  const copy = hrComplianceUiCopy.evidenceLinks;
  const employeeId = String(row.cells.employeeIdValue ?? "").trim();
  const scopedDocumentOptions = employeeId
    ? documentOptions.filter((option) => option.employeeId === employeeId)
    : documentOptions;

  if (scopedDocumentOptions.length === 0) {
    return (
      <ComplianceEvidenceDocumentPickerEmpty employeeScoped={employeeId.length > 0} />
    );
  }

  return (
    <ComplianceTrailingActionForm
      action={linkHrComplianceEvidenceAction}
      submitLabel={copy.trailingLinkLabel}
      buttonVariant="outline"
      hiddenFields={
        <>
          <ComplianceTrailingHiddenRowId
            name={recordIdFieldName}
            rowId={row.id}
          />
          <input type="hidden" name="recordKind" value={recordKind} />
        </>
      }
    >
      <ComplianceTrailingActionFields
        row={row}
        fields={buildLinkEvidenceTrailingFields(copy, scopedDocumentOptions)}
      />
    </ComplianceTrailingActionForm>
  );
}

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
  const { employeeOptions, documentOptions } = useHrComplianceTrailingPickers();
  const actionConfigs = buildExceptionTrailingActions(copy, employeeOptions);
  const exceptionStatus = String(row.cells.statusValue ?? "");
  const visibleActions = actionConfigs.filter(
    (config) => config.showWhen?.(exceptionStatus) ?? true,
  );

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex min-w-56 flex-col gap-surface-md">
        {visibleActions.map((config) => (
          <ComplianceTrailingActionForm
            key={config.actionKey}
            action={EXCEPTION_TRAILING_SERVER_ACTIONS[config.actionKey]}
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
        <ComplianceLinkEvidenceTrailingForm
          row={row}
          recordKind="exception"
          recordIdFieldName="recordId"
          documentOptions={documentOptions}
        />
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

export function HrComplianceStatutoryRequirementsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.statutory;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ComplianceTrailingActionForm
        action={updateHrEmployeeStatutoryRequirementAction}
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
  const { documentOptions } = useHrComplianceTrailingPickers();

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex min-w-56 flex-col gap-surface-md">
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
        <ComplianceLinkEvidenceTrailingForm
          row={row}
          recordKind="filing"
          recordIdFieldName="recordId"
          documentOptions={documentOptions}
        />
      </div>
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
  const { documentOptions } = useHrComplianceTrailingPickers();

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex min-w-56 flex-col gap-surface-md">
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
        <ComplianceLinkEvidenceTrailingForm
          row={row}
          recordKind="work_auth_document"
          recordIdFieldName="recordId"
          documentOptions={documentOptions}
        />
      </div>
    </GovernedTrailingActionSlot>
  );
}

export function HrComplianceEvidenceLinksTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.evidenceLinks;
  const actionConfigs = buildEvidenceLinksTrailingActions(
    copy,
    HRM_COMPLIANCE_EVIDENCE_STORED_SUBMISSION_STATES,
  );

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex min-w-56 flex-col gap-surface-md">
        {actionConfigs.map((config, index) => (
          <ComplianceTrailingActionForm
            key={config.submitLabel}
            action={EVIDENCE_LINKS_TRAILING_SERVER_ACTIONS[index]!}
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

export function HrComplianceReviewQueueTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrComplianceUiCopy.reviewQueue;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const entryKind = String(row.cells.entryKindValue ?? "");
  const sourceRecordId = String(row.cells.sourceRecordIdValue ?? row.id);

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex min-w-48 flex-col gap-2">
        <ComplianceTrailingActionForm
          action={decideHrComplianceReviewQueueItemAction}
          submitLabel={copy.trailingApproveLabel}
          hiddenFields={
            <>
              <input type="hidden" name="entryKind" value={entryKind} />
              <input type="hidden" name="sourceRecordId" value={sourceRecordId} />
              <input type="hidden" name="decision" value="approve" />
            </>
          }
        >
          <ComplianceTrailingActionFields
            row={row}
            fields={[
              {
                kind: "text",
                name: "reviewNotes",
                label: copy.trailingReviewNotesPlaceholder,
                placeholder: copy.trailingReviewNotesPlaceholder,
              },
            ]}
          />
        </ComplianceTrailingActionForm>
        <ComplianceTrailingActionForm
          action={decideHrComplianceReviewQueueItemAction}
          submitLabel={copy.trailingRejectLabel}
          buttonVariant="outline"
          hiddenFields={
            <>
              <input type="hidden" name="entryKind" value={entryKind} />
              <input type="hidden" name="sourceRecordId" value={sourceRecordId} />
              <input type="hidden" name="decision" value="reject" />
            </>
          }
        />
      </div>
    </GovernedTrailingActionSlot>
  );
}
