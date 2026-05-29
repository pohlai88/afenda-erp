import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import {
  completeHrOffboardingAction,
  completeHrOffboardingClearanceItemAction,
  startHrOffboardingAction,
} from "../actions/hr-offboarding.actions.server";
import type { HrOffboardingCaseWindow } from "../contracts/hr-offboarding.contract";
import {
  buildHrOffboardingListSurface,
  hrOffboardingSurfaceKey,
} from "../surface/hr-offboarding-list.surface";
import { hrOffboardingUiCopy } from "../surface/hr-offboarding-ui.copy.shared";
import {
  HrOffboardingClearanceForm,
  HrOffboardingCompleteForm,
  HrOffboardingStartForm,
} from "./hr-offboarding-forms.component.client";

export function HrOffboardingSection({
  window,
  searchValue,
  canWrite,
  employees,
  clearanceItems,
}: {
  window: HrOffboardingCaseWindow;
  searchValue?: string;
  canWrite: boolean;
  employees: ReadonlyArray<{ id: string; label: string }>;
  clearanceItems: ReadonlyArray<{
    id: string;
    title: string;
    status: string;
  }>;
}) {
  const inProgressCases = window.rows
    .filter((row) => row.status === "in_progress")
    .map((row) => ({
      id: row.id,
      label: `${row.employeeNumber} — ${row.employeeDisplayName}`,
    }));

  return (
    <div className="flex flex-col gap-surface-2xl">
      {canWrite ? (
        <>
          <SectionPanel
            title={hrOffboardingUiCopy.start.title}
            description={hrOffboardingUiCopy.start.description}
          >
            <HrOffboardingStartForm
              employees={employees}
              startAction={startHrOffboardingAction}
            />
          </SectionPanel>
          {clearanceItems.filter((item) => item.status === "pending").length > 0 ? (
            <SectionPanel
              title={hrOffboardingUiCopy.clearance.title}
              description={hrOffboardingUiCopy.clearance.description}
            >
              <HrOffboardingClearanceForm
                items={clearanceItems
                  .filter((item) => item.status === "pending")
                  .map((item) => ({ id: item.id, label: item.title }))}
                completeAction={completeHrOffboardingClearanceItemAction}
              />
            </SectionPanel>
          ) : null}
          <SectionPanel
            title={hrOffboardingUiCopy.complete.title}
            description={hrOffboardingUiCopy.complete.description}
          >
            <HrOffboardingCompleteForm
              inProgressCases={inProgressCases}
              completeAction={completeHrOffboardingAction}
            />
          </SectionPanel>
        </>
      ) : null}
      <GovernedPatternCListSection
        title={hrOffboardingUiCopy.section.title}
        description={hrOffboardingUiCopy.section.description}
        surfaceKey={hrOffboardingSurfaceKey}
        listConfiguration={buildHrOffboardingListSurface({ window, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function HrOffboardingAccessDenied() {
  const denied = hrOffboardingUiCopy.accessDenied;

  return (
    <SectionPanel title={denied.title}>
      <p className="type-muted">{denied.description}</p>
    </SectionPanel>
  );
}
