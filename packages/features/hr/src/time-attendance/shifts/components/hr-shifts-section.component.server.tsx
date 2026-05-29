import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import {
  archiveHrShiftTemplateAction,
  cancelHrShiftAssignmentAction,
  createHrShiftTemplateAction,
  publishHrShiftAssignmentAction,
  scheduleHrShiftAssignmentAction,
} from "../actions/hr-shifts.actions.server";
import type {
  HrShiftAssignmentWindow,
  HrShiftTemplateWindow,
} from "../contracts/hr-shifts.contract";
import {
  buildHrShiftsListSurface,
  hrShiftsSurfaceKey,
} from "../surface/hr-shifts-list.surface";
import { hrShiftsUiCopy } from "../surface/hr-shifts-ui.copy.shared";
import {
  HrShiftArchiveTemplateForm,
  HrShiftCancelForm,
  HrShiftCreateTemplateForm,
  HrShiftPublishForm,
  HrShiftScheduleForm,
} from "./hr-shifts-forms.component.client";

export function HrShiftsSection({
  assignmentWindow,
  scheduledWindow,
  cancellableWindow,
  templateWindow,
  searchValue,
  canWrite,
  employees,
}: {
  assignmentWindow: HrShiftAssignmentWindow;
  scheduledWindow: HrShiftAssignmentWindow;
  cancellableWindow: HrShiftAssignmentWindow;
  templateWindow: HrShiftTemplateWindow;
  searchValue?: string;
  canWrite: boolean;
  employees: ReadonlyArray<{ id: string; label: string }>;
}) {
  const templateOptions = templateWindow.rows.map((row) => ({
    id: row.id,
    label: `${row.code} — ${row.name} (${row.startTime}–${row.endTime})`,
  }));

  const scheduledOptions = scheduledWindow.rows.map((row) => ({
    id: row.id,
    label: `${row.employeeNumber} — ${row.templateCode} ${row.shiftDate.toISOString().slice(0, 10)}`,
  }));

  const cancellableOptions = cancellableWindow.rows.map((row) => ({
    id: row.id,
    label: `${row.employeeNumber} — ${row.templateCode} (${row.status})`,
  }));

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        title={hrShiftsUiCopy.templatesPanel.title}
        description={hrShiftsUiCopy.templatesPanel.description}
      >
        {templateWindow.rows.length === 0 ? (
          <p className="type-muted">{hrShiftsUiCopy.templatesPanel.empty}</p>
        ) : (
          <ul className="flex flex-col gap-surface-xs">
            {templateWindow.rows.map((row) => (
              <li key={row.id} className="type-body">
                <span className="font-medium">{row.code}</span> — {row.name}{" "}
                <span className="type-muted">
                  ({row.startTime}–{row.endTime} UTC)
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>

      {canWrite ? (
        <>
          <SectionPanel
            title={hrShiftsUiCopy.createTemplate.title}
            description={hrShiftsUiCopy.createTemplate.description}
          >
            <HrShiftCreateTemplateForm createAction={createHrShiftTemplateAction} />
          </SectionPanel>
          {templateOptions.length > 0 ? (
            <>
              <SectionPanel
                title={hrShiftsUiCopy.archiveTemplate.title}
                description={hrShiftsUiCopy.archiveTemplate.description}
              >
                <HrShiftArchiveTemplateForm
                  templates={templateOptions}
                  archiveAction={archiveHrShiftTemplateAction}
                />
              </SectionPanel>
              <SectionPanel
                title={hrShiftsUiCopy.schedule.title}
                description={hrShiftsUiCopy.schedule.description}
              >
                <HrShiftScheduleForm
                  employees={employees}
                  templates={templateOptions}
                  scheduleAction={scheduleHrShiftAssignmentAction}
                />
              </SectionPanel>
            </>
          ) : null}
          {scheduledOptions.length > 0 ? (
            <SectionPanel
              title={hrShiftsUiCopy.publish.title}
              description={hrShiftsUiCopy.publish.description}
            >
              <HrShiftPublishForm
                scheduledAssignments={scheduledOptions}
                publishAction={publishHrShiftAssignmentAction}
              />
            </SectionPanel>
          ) : null}
          {cancellableOptions.length > 0 ? (
            <SectionPanel
              title={hrShiftsUiCopy.cancel.title}
              description={hrShiftsUiCopy.cancel.description}
            >
              <HrShiftCancelForm
                cancellableAssignments={cancellableOptions}
                cancelAction={cancelHrShiftAssignmentAction}
              />
            </SectionPanel>
          ) : null}
        </>
      ) : null}

      <GovernedPatternCListSection
        title={hrShiftsUiCopy.section.title}
        description={hrShiftsUiCopy.section.description}
        surfaceKey={hrShiftsSurfaceKey}
        listConfiguration={buildHrShiftsListSurface({
          window: assignmentWindow,
          searchValue,
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function HrShiftsAccessDenied() {
  const denied = hrShiftsUiCopy.accessDenied;

  return (
    <SectionPanel title={denied.title}>
      <p className="type-muted">{denied.description}</p>
    </SectionPanel>
  );
}
