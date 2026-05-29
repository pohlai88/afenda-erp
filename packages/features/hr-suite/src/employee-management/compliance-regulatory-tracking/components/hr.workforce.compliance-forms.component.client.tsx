"use client";

import { type ActionResult } from "@afenda/governed-surface/schemas";
import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  createHrComplianceExceptionAction,
  ensureHrWorkAuthorizationDocumentsAction,
  ensureHrWorkEligibilityTrackingAction,
  syncHrEmployeeLaborLawRequirementsAction,
  syncHrEmployeePolicyAcknowledgementsAction,
  syncHrComplianceFilingsAction,
  syncHrEmployeeSafetyTrainingRequirementsAction,
  syncHrEmployeeWorkplaceSafetyRequirementsAction,
  upsertHrComplianceObligationAction,
} from "../actions/hr.workforce.compliance.actions.server";
import { HRM_COMPLIANCE_OBLIGATION_KINDS } from "../data/hr.workforce.compliance-obligation.shared";
import {
  HRM_COMPLIANCE_AREAS,
  HRM_COMPLIANCE_EXCEPTION_SEVERITIES,
} from "../data/hr.workforce.compliance-status.shared";
import {
  COMPLIANCE_NATIVE_SELECT_CLASS,
  formatComplianceEnumLabel,
} from "../schemas/hr.workforce.compliance-form.shared";
import { hrComplianceUiCopy } from "../surface/hr.workforce.compliance-ui.copy.shared";

function ComplianceFormShell({
  action,
  children,
  submitLabel,
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-surface-md">
      <FieldGroup className="grid gap-surface-md @md/field-group:grid-cols-2">
        {children}
        <Field className="@md/field-group:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            {submitLabel}
          </Button>
        </Field>
      </FieldGroup>
      <ActionFormErrors result={state} />
    </form>
  );
}

function ComplianceNoFieldActionForm({
  action,
  submitLabel,
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-surface-md">
      <Button type="submit" size="sm" disabled={pending}>
        {submitLabel}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function HrComplianceObligationUpsertForm({
  departments = [],
}: {
  departments?: ReadonlyArray<{ id: string; name: string }>;
}) {
  const copy = hrComplianceUiCopy.obligations;

  return (
    <ComplianceFormShell
      action={upsertHrComplianceObligationAction}
      submitLabel={copy.formSubmitLabel}
    >
      <Field>
        <FieldLabel htmlFor="obligation-code">{copy.formFieldCode}</FieldLabel>
        <Input id="obligation-code" name="code" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-title">{copy.formFieldTitle}</FieldLabel>
        <Input id="obligation-title" name="title" required />
      </Field>
      <Field className="@md/field-group:col-span-2">
        <FieldLabel htmlFor="obligation-description">
          {copy.formFieldDescription}
        </FieldLabel>
        <Input id="obligation-description" name="description" />
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-kind">
          {copy.formFieldRequirementKind}
        </FieldLabel>
        <select
          id="obligation-kind"
          name="requirementKind"
          required
          className={COMPLIANCE_NATIVE_SELECT_CLASS}
          defaultValue={HRM_COMPLIANCE_OBLIGATION_KINDS[0]}
        >
          {HRM_COMPLIANCE_OBLIGATION_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {formatComplianceEnumLabel(kind)}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-area">
          {copy.formFieldComplianceArea}
        </FieldLabel>
        <select
          id="obligation-area"
          name="complianceArea"
          required
          className={COMPLIANCE_NATIVE_SELECT_CLASS}
          defaultValue={HRM_COMPLIANCE_AREAS[0]}
        >
          {HRM_COMPLIANCE_AREAS.map((area) => (
            <option key={area} value={area}>
              {formatComplianceEnumLabel(area)}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-country">{copy.formFieldCountry}</FieldLabel>
        <Input
          id="obligation-country"
          name="countryCode"
          placeholder={copy.formFieldCountryPlaceholder}
          maxLength={2}
          className="uppercase"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-entity">
          {copy.formFieldLegalEntity}
        </FieldLabel>
        <Input id="obligation-entity" name="legalEntityCode" />
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-department">
          {copy.formFieldDepartment}
        </FieldLabel>
        <select
          id="obligation-department"
          name="departmentId"
          className={COMPLIANCE_NATIVE_SELECT_CLASS}
          defaultValue=""
        >
          <option value="">{copy.formFieldDepartmentAll}</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-location">
          {copy.formFieldWorkLocation}
        </FieldLabel>
        <Input id="obligation-location" name="workLocationCode" />
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-employment-type">
          {copy.formFieldEmploymentType}
        </FieldLabel>
        <Input id="obligation-employment-type" name="employmentType" />
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-worker-category">
          {copy.formFieldWorkerCategory}
        </FieldLabel>
        <Input id="obligation-worker-category" name="workerCategory" />
      </Field>
      <Field>
        <FieldLabel htmlFor="obligation-due">{copy.formFieldDueDate}</FieldLabel>
        <Input id="obligation-due" name="dueDate" type="datetime-local" />
      </Field>
    </ComplianceFormShell>
  );
}

export function HrComplianceExceptionCreateForm() {
  const copy = hrComplianceUiCopy.exceptions;

  return (
    <ComplianceFormShell
      action={createHrComplianceExceptionAction}
      submitLabel={copy.formSubmitLabel}
    >
      <Field>
        <FieldLabel htmlFor="exception-title">{copy.formFieldTitle}</FieldLabel>
        <Input id="exception-title" name="title" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="exception-type">{copy.formFieldItemType}</FieldLabel>
        <Input id="exception-type" name="itemType" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="exception-area">{copy.formFieldArea}</FieldLabel>
        <select
          id="exception-area"
          name="complianceArea"
          required
          className={COMPLIANCE_NATIVE_SELECT_CLASS}
          defaultValue={HRM_COMPLIANCE_AREAS[0]}
        >
          {HRM_COMPLIANCE_AREAS.map((area) => (
            <option key={area} value={area}>
              {formatComplianceEnumLabel(area)}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="exception-severity">
          {copy.formFieldSeverity}
        </FieldLabel>
        <select
          id="exception-severity"
          name="severity"
          className={COMPLIANCE_NATIVE_SELECT_CLASS}
          defaultValue={HRM_COMPLIANCE_EXCEPTION_SEVERITIES[1]}
        >
          {HRM_COMPLIANCE_EXCEPTION_SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {formatComplianceEnumLabel(severity)}
            </option>
          ))}
        </select>
      </Field>
    </ComplianceFormShell>
  );
}

export function HrComplianceLaborLawSyncForm() {
  const copy = hrComplianceUiCopy.laborLaw;

  return (
    <ComplianceNoFieldActionForm
      action={syncHrEmployeeLaborLawRequirementsAction}
      submitLabel={copy.syncActionLabel}
    />
  );
}

export function HrCompliancePolicyAcknowledgementSyncForm() {
  const copy = hrComplianceUiCopy.policyAcknowledgement;

  return (
    <ComplianceNoFieldActionForm
      action={syncHrEmployeePolicyAcknowledgementsAction}
      submitLabel={copy.syncActionLabel}
    />
  );
}

export function HrComplianceFilingSyncForm() {
  const copy = hrComplianceUiCopy.filing;

  return (
    <ComplianceNoFieldActionForm
      action={syncHrComplianceFilingsAction}
      submitLabel={copy.syncActionLabel}
    />
  );
}

export function HrComplianceWorkplaceSafetySyncForm() {
  const copy = hrComplianceUiCopy.workplaceSafety;

  return (
    <ComplianceNoFieldActionForm
      action={syncHrEmployeeWorkplaceSafetyRequirementsAction}
      submitLabel={copy.syncActionLabel}
    />
  );
}

export function HrComplianceSafetyTrainingSyncForm() {
  const copy = hrComplianceUiCopy.safetyTraining;

  return (
    <ComplianceNoFieldActionForm
      action={syncHrEmployeeSafetyTrainingRequirementsAction}
      submitLabel={copy.syncActionLabel}
    />
  );
}

export function HrComplianceWorkEligibilityEnsureForm() {
  const copy = hrComplianceUiCopy.workEligibility;

  return (
    <ComplianceNoFieldActionForm
      action={ensureHrWorkEligibilityTrackingAction}
      submitLabel={copy.ensureActionLabel}
    />
  );
}

export function HrComplianceWorkAuthDocumentsEnsureForm() {
  const copy = hrComplianceUiCopy.workAuthDocuments;

  return (
    <ComplianceNoFieldActionForm
      action={ensureHrWorkAuthorizationDocumentsAction}
      submitLabel={copy.ensureActionLabel}
    />
  );
}
