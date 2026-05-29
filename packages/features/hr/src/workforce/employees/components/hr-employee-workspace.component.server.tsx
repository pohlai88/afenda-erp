import { SectionPanel } from "@afenda/ui";
import {
  createHrEmployeeAction,
  updateHrEmployeeAction,
  archiveHrEmployeeAction,
} from "../actions/hr-employees.actions.server";
import type { HrEmployeeDetail } from "../contracts";
import type { HrEmployeeFormOptions } from "../contracts/hr-employee-form.contract";
import { HrEmployeeLifecycleTimelinePanel } from "../../lifecycle/components/hr-employee-lifecycle-timeline.component.server";
import type { HrLifecycleEventRow } from "../../lifecycle/contracts/hr-lifecycle-event.contract";
import { hrEmployeesUiCopy } from "../surface/hr-employees-ui.copy.shared";
import { HrEmployeeDetailPanel } from "./hr-employee-detail.component.server";
import {
  HrEmployeeArchiveButton,
  HrEmployeeCreateForm,
  HrEmployeeEditForm,
} from "./hr-employee-form.component.client";

export function HrEmployeeCreateSection({
  options,
  backHref,
}: {
  options: HrEmployeeFormOptions;
  backHref: string;
}) {
  const copy = hrEmployeesUiCopy.create;

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.title}
        description={copy.description}
      >
        <a
          className="type-caption text-muted underline-offset-2 hover:underline"
          href={backHref}
        >
          {copy.backLabel}
        </a>
      </SectionPanel>
      <SectionPanel title={copy.formTitle}>
        <HrEmployeeCreateForm
          options={options}
          createAction={createHrEmployeeAction}
        />
      </SectionPanel>
    </div>
  );
}

export function HrEmployeeDetailSection({
  employee,
  options,
  canWrite,
  canViewLifecycle,
  lifecycleEvents,
  backHref,
}: {
  employee: HrEmployeeDetail;
  options: HrEmployeeFormOptions;
  canWrite: boolean;
  canViewLifecycle: boolean;
  lifecycleEvents?: readonly HrLifecycleEventRow[];
  backHref: string;
}) {
  const formCopy = hrEmployeesUiCopy.form;

  return (
    <div className="flex flex-col gap-surface-2xl">
      <HrEmployeeDetailPanel employee={employee} backHref={backHref} />
      {canViewLifecycle && lifecycleEvents ? (
        <HrEmployeeLifecycleTimelinePanel events={lifecycleEvents} />
      ) : null}
      {canWrite && employee.archivedAt === null ? (
        <>
          <SectionPanel title={formCopy.editTitle} description={formCopy.editDescription}>
            <HrEmployeeEditForm
              options={options}
              employeeId={employee.id}
              values={{
                employeeNumber: employee.employeeNumber,
                legalName: employee.legalName,
                preferredName: employee.preferredName,
                email: employee.email,
                currentDepartmentId: employee.currentDepartmentId,
                currentPositionId: employee.currentPositionId,
                managerEmployeeId: employee.managerEmployeeId,
              }}
              updateAction={updateHrEmployeeAction}
            />
          </SectionPanel>
          <SectionPanel title={formCopy.archiveTitle} description={formCopy.archiveDescription}>
            <HrEmployeeArchiveButton
              employeeId={employee.id}
              archiveAction={archiveHrEmployeeAction}
            />
          </SectionPanel>
        </>
      ) : null}
    </div>
  );
}
