import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import {
  approveHrLeaveRequestAction,
  cancelHrLeaveRequestAction,
  rejectHrLeaveRequestAction,
  submitHrLeaveRequestAction,
} from "../actions/hr-leave.actions.server";
import type { HrLeaveRequestWindow } from "../contracts/hr-leave.contract";
import {
  buildHrLeaveListSurface,
  hrLeaveSurfaceKey,
} from "../surface/hr-leave-list.surface";
import { hrLeaveUiCopy } from "../surface/hr-leave-ui.copy.shared";
import {
  HrLeaveApproveForm,
  HrLeaveCancelForm,
  HrLeaveRejectForm,
  HrLeaveSubmitForm,
} from "./hr-leave-forms.component.client";

export function HrLeaveSection({
  window,
  pendingWindow,
  searchValue,
  canWrite,
  employees,
}: {
  window: HrLeaveRequestWindow;
  pendingWindow: HrLeaveRequestWindow;
  searchValue?: string;
  canWrite: boolean;
  employees: ReadonlyArray<{ id: string; label: string }>;
}) {
  const pendingOptions = pendingWindow.rows.map((row) => ({
    id: row.id,
    label: `${row.employeeNumber} — ${row.leaveType} (${row.startAt.toISOString().slice(0, 10)})`,
  }));

  return (
    <div className="flex flex-col gap-surface-2xl">
      {canWrite ? (
        <>
          <SectionPanel
            title={hrLeaveUiCopy.submit.title}
            description={hrLeaveUiCopy.submit.description}
          >
            <HrLeaveSubmitForm
              employees={employees}
              submitAction={submitHrLeaveRequestAction}
            />
          </SectionPanel>
          {pendingOptions.length > 0 ? (
            <>
              <SectionPanel
                title={hrLeaveUiCopy.approve.title}
                description={hrLeaveUiCopy.approve.description}
              >
                <HrLeaveApproveForm
                  pendingRequests={pendingOptions}
                  approveAction={approveHrLeaveRequestAction}
                />
              </SectionPanel>
              <SectionPanel
                title={hrLeaveUiCopy.reject.title}
                description={hrLeaveUiCopy.reject.description}
              >
                <HrLeaveRejectForm
                  pendingRequests={pendingOptions}
                  rejectAction={rejectHrLeaveRequestAction}
                />
              </SectionPanel>
              <SectionPanel
                title={hrLeaveUiCopy.cancel.title}
                description={hrLeaveUiCopy.cancel.description}
              >
                <HrLeaveCancelForm
                  pendingRequests={pendingOptions}
                  cancelAction={cancelHrLeaveRequestAction}
                />
              </SectionPanel>
            </>
          ) : null}
        </>
      ) : null}
      <GovernedPatternCListSection
        title={hrLeaveUiCopy.section.title}
        description={hrLeaveUiCopy.section.description}
        surfaceKey={hrLeaveSurfaceKey}
        listConfiguration={buildHrLeaveListSurface({ window, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function HrLeaveAccessDenied() {
  const denied = hrLeaveUiCopy.accessDenied;

  return (
    <SectionPanel title={denied.title}>
      <p className="type-muted">{denied.description}</p>
    </SectionPanel>
  );
}
