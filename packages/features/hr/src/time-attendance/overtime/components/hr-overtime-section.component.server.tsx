import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import {
  approveHrOvertimeRequestAction,
  cancelHrOvertimeRequestAction,
  rejectHrOvertimeRequestAction,
  submitHrOvertimeRequestAction,
} from "../actions/hr-overtime.actions.server";
import type { HrOvertimeRequestWindow } from "../contracts/hr-overtime.contract";
import {
  buildHrOvertimeListSurface,
  hrOvertimeSurfaceKey,
} from "../surface/hr-overtime-list.surface";
import { hrOvertimeUiCopy } from "../surface/hr-overtime-ui.copy.shared";
import {
  HrOvertimeApproveForm,
  HrOvertimeCancelForm,
  HrOvertimeRejectForm,
  HrOvertimeSubmitForm,
} from "./hr-overtime-forms.component.client";

export function HrOvertimeSection({
  window,
  pendingWindow,
  searchValue,
  canWrite,
  employees,
}: {
  window: HrOvertimeRequestWindow;
  pendingWindow: HrOvertimeRequestWindow;
  searchValue?: string;
  canWrite: boolean;
  employees: ReadonlyArray<{ id: string; label: string }>;
}) {
  const pendingOptions = pendingWindow.rows.map((row) => ({
    id: row.id,
    label: `${row.employeeNumber} — ${row.overtimeType} (${row.workDate.toISOString().slice(0, 10)}, ${row.hours}h)`,
  }));

  return (
    <div className="flex flex-col gap-surface-2xl">
      {canWrite ? (
        <>
          <SectionPanel
            title={hrOvertimeUiCopy.submit.title}
            description={hrOvertimeUiCopy.submit.description}
          >
            <HrOvertimeSubmitForm
              employees={employees}
              submitAction={submitHrOvertimeRequestAction}
            />
          </SectionPanel>
          {pendingOptions.length > 0 ? (
            <>
              <SectionPanel
                title={hrOvertimeUiCopy.approve.title}
                description={hrOvertimeUiCopy.approve.description}
              >
                <HrOvertimeApproveForm
                  pendingRequests={pendingOptions}
                  approveAction={approveHrOvertimeRequestAction}
                />
              </SectionPanel>
              <SectionPanel
                title={hrOvertimeUiCopy.reject.title}
                description={hrOvertimeUiCopy.reject.description}
              >
                <HrOvertimeRejectForm
                  pendingRequests={pendingOptions}
                  rejectAction={rejectHrOvertimeRequestAction}
                />
              </SectionPanel>
              <SectionPanel
                title={hrOvertimeUiCopy.cancel.title}
                description={hrOvertimeUiCopy.cancel.description}
              >
                <HrOvertimeCancelForm
                  pendingRequests={pendingOptions}
                  cancelAction={cancelHrOvertimeRequestAction}
                />
              </SectionPanel>
            </>
          ) : null}
        </>
      ) : null}
      <GovernedPatternCListSection
        title={hrOvertimeUiCopy.section.title}
        description={hrOvertimeUiCopy.section.description}
        surfaceKey={hrOvertimeSurfaceKey}
        listConfiguration={buildHrOvertimeListSurface({ window, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function HrOvertimeAccessDenied() {
  const denied = hrOvertimeUiCopy.accessDenied;

  return (
    <SectionPanel title={denied.title}>
      <p className="type-muted">{denied.description}</p>
    </SectionPanel>
  );
}
