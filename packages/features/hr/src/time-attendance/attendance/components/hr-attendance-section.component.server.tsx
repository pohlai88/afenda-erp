import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import {
  recordHrAttendancePunchAction,
  voidHrAttendancePunchAction,
} from "../actions/hr-attendance.actions.server";
import type { HrAttendanceRecordWindow } from "../contracts/hr-attendance.contract";
import {
  buildHrAttendanceListSurface,
  hrAttendanceSurfaceKey,
} from "../surface/hr-attendance-list.surface";
import { hrAttendanceUiCopy } from "../surface/hr-attendance-ui.copy.shared";
import {
  HrAttendanceRecordPunchForm,
  HrAttendanceVoidPunchForm,
} from "./hr-attendance-forms.component.client";

export function HrAttendanceSection({
  window,
  searchValue,
  canWrite,
  employees,
}: {
  window: HrAttendanceRecordWindow;
  searchValue?: string;
  canWrite: boolean;
  employees: ReadonlyArray<{ id: string; label: string }>;
}) {
  const activeRecords = window.rows.map((row) => ({
    id: row.id,
    label: `${row.employeeNumber} — ${row.punchType} @ ${row.punchedAt.toISOString().slice(0, 16)}`,
  }));

  return (
    <div className="flex flex-col gap-surface-2xl">
      {canWrite ? (
        <>
          <SectionPanel
            title={hrAttendanceUiCopy.record.title}
            description={hrAttendanceUiCopy.record.description}
          >
            <HrAttendanceRecordPunchForm
              employees={employees}
              recordAction={recordHrAttendancePunchAction}
            />
          </SectionPanel>
          {activeRecords.length > 0 ? (
            <SectionPanel
              title={hrAttendanceUiCopy.void.title}
              description={hrAttendanceUiCopy.void.description}
            >
              <HrAttendanceVoidPunchForm
                activeRecords={activeRecords}
                voidAction={voidHrAttendancePunchAction}
              />
            </SectionPanel>
          ) : null}
        </>
      ) : null}
      <GovernedPatternCListSection
        title={hrAttendanceUiCopy.section.title}
        description={hrAttendanceUiCopy.section.description}
        surfaceKey={hrAttendanceSurfaceKey}
        listConfiguration={buildHrAttendanceListSurface({ window, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function HrAttendanceAccessDenied() {
  const denied = hrAttendanceUiCopy.accessDenied;

  return (
    <SectionPanel title={denied.title}>
      <p className="type-muted">{denied.description}</p>
    </SectionPanel>
  );
}
