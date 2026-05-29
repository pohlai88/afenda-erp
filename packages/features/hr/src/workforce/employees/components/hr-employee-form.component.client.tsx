"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
} from "@afenda/ui";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { hrWorkforceRoutes } from "../../../contracts/hr-workforce-routes.shared";
import type {
  HrEmployeeFormOptions,
  HrEmployeeFormValues,
} from "../contracts/hr-employee-form.contract";
import { hrEmployeesUiCopy } from "../surface/hr-employees-ui.copy.shared";

function emptyOptionLabel(label: string) {
  return `${label} (none)`;
}

function HrEmployeeFormFields({
  options,
  values,
  employeeId,
}: {
  options: HrEmployeeFormOptions;
  values?: HrEmployeeFormValues;
  employeeId?: string;
}) {
  const formCopy = hrEmployeesUiCopy.form;

  return (
    <>
      {employeeId ? (
        <input type="hidden" name="employeeId" value={employeeId} />
      ) : null}
      <Field>
        <FieldLabel htmlFor="employeeNumber">{formCopy.employeeNumberLabel}</FieldLabel>
        <Input
          id="employeeNumber"
          name="employeeNumber"
          required
          minLength={1}
          maxLength={64}
          defaultValue={values?.employeeNumber ?? ""}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="legalName">{formCopy.legalNameLabel}</FieldLabel>
        <Input
          id="legalName"
          name="legalName"
          required
          minLength={1}
          maxLength={256}
          defaultValue={values?.legalName ?? ""}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="preferredName">{formCopy.preferredNameLabel}</FieldLabel>
        <Input
          id="preferredName"
          name="preferredName"
          maxLength={256}
          defaultValue={values?.preferredName ?? ""}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">{formCopy.emailLabel}</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={values?.email ?? ""}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="currentDepartmentId">
          {formCopy.departmentLabel}
        </FieldLabel>
        <NativeSelect
          id="currentDepartmentId"
          name="currentDepartmentId"
          defaultValue={values?.currentDepartmentId ?? ""}
        >
          <option value="">{emptyOptionLabel(formCopy.departmentLabel)}</option>
          {options.departments.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor="currentPositionId">{formCopy.positionLabel}</FieldLabel>
        <NativeSelect
          id="currentPositionId"
          name="currentPositionId"
          defaultValue={values?.currentPositionId ?? ""}
        >
          <option value="">{emptyOptionLabel(formCopy.positionLabel)}</option>
          {options.positions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor="managerEmployeeId">{formCopy.managerLabel}</FieldLabel>
        <NativeSelect
          id="managerEmployeeId"
          name="managerEmployeeId"
          defaultValue={values?.managerEmployeeId ?? ""}
        >
          <option value="">{emptyOptionLabel(formCopy.managerLabel)}</option>
          {options.managers.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </>
  );
}

export function HrEmployeeCreateForm({
  options,
  createAction,
}: {
  options: HrEmployeeFormOptions;
  createAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ employeeId: string }>>;
}) {
  const formCopy = hrEmployeesUiCopy.form;
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ employeeId: string }> | undefined,
      formData: FormData,
    ) => {
      const result = await createAction(formData);
      if (result.ok && result.data?.employeeId) {
        router.push(hrWorkforceRoutes.employeeDetail(result.data.employeeId));
      }
      return result;
    },
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <HrEmployeeFormFields options={options} />
        <div className="@md:col-span-2 flex flex-col gap-surface-sm">
          <Button type="submit" disabled={pending}>
            {pending ? formCopy.createPendingLabel : formCopy.createSubmitLabel}
          </Button>
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}

export function HrEmployeeEditForm({
  options,
  values,
  employeeId,
  updateAction,
}: {
  options: HrEmployeeFormOptions;
  values: HrEmployeeFormValues;
  employeeId: string;
  updateAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ employeeId: string; changedFields: string[] }>>;
}) {
  const formCopy = hrEmployeesUiCopy.form;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ employeeId: string; changedFields: string[] }> | undefined,
      formData: FormData,
    ) => updateAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <HrEmployeeFormFields
          options={options}
          values={values}
          employeeId={employeeId}
        />
        <div className="@md:col-span-2 flex flex-col gap-surface-sm">
          <Button type="submit" disabled={pending}>
            {pending ? formCopy.updatePendingLabel : formCopy.updateSubmitLabel}
          </Button>
          {state?.ok ? (
            <p className="type-caption text-muted">{formCopy.updateSuccessLabel}</p>
          ) : null}
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}

export function HrEmployeeArchiveButton({
  employeeId,
  archiveAction,
}: {
  employeeId: string;
  archiveAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ employeeId: string }>>;
}) {
  const formCopy = hrEmployeesUiCopy.form;
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ employeeId: string }> | undefined,
      formData: FormData,
    ) => {
      const result = await archiveAction(formData);
      if (result.ok) {
        router.push(hrWorkforceRoutes.employees);
      }
      return result;
    },
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      <input type="hidden" name="employeeId" value={employeeId} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? formCopy.archivePendingLabel : formCopy.archiveSubmitLabel}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}
