import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import {
  changeHrEmploymentStatusAction,
  recordHrEmployeeMovementAction,
  recordHrProbationOutcomeAction,
} from "../actions/hr-lifecycle.actions.server";
import type { HrLifecycleOverviewWindow } from "../contracts/hr-lifecycle.contract";
import type { HrLifecycleFormOptions } from "../data/hr-lifecycle-form-options.query.server";
import {
  buildHrLifecycleListSurface,
  hrLifecycleSurfaceKey,
} from "../surface/hr-lifecycle-list.surface";
import { hrLifecycleUiCopy } from "../surface/hr-lifecycle-ui.copy.shared";
import {
  HrLifecycleMovementForm,
  HrLifecycleProbationOutcomeForm,
  HrLifecycleStatusChangeForm,
} from "./hr-lifecycle-mutation-forms.component.client";

export function HrLifecycleSection({
  window,
  searchValue,
  canWrite,
  employees,
  formOptions,
}: {
  window: HrLifecycleOverviewWindow;
  searchValue?: string;
  canWrite: boolean;
  employees: ReadonlyArray<{ id: string; label: string }>;
  formOptions?: HrLifecycleFormOptions;
}) {
  return (
    <div className="flex flex-col gap-surface-2xl">
      {canWrite ? (
        <>
          <SectionPanel
            title={hrLifecycleUiCopy.statusChange.title}
            description={hrLifecycleUiCopy.statusChange.description}
          >
            <HrLifecycleStatusChangeForm
              employees={employees}
              changeStatusAction={changeHrEmploymentStatusAction}
            />
          </SectionPanel>
          <SectionPanel
            title={hrLifecycleUiCopy.probation.title}
            description={hrLifecycleUiCopy.probation.description}
          >
            <HrLifecycleProbationOutcomeForm
              employees={employees}
              recordOutcomeAction={recordHrProbationOutcomeAction}
            />
          </SectionPanel>
          {formOptions ? (
            <SectionPanel
              title={hrLifecycleUiCopy.movement.title}
              description={hrLifecycleUiCopy.movement.description}
            >
              <HrLifecycleMovementForm
                formOptions={formOptions}
                recordMovementAction={recordHrEmployeeMovementAction}
              />
            </SectionPanel>
          ) : null}
        </>
      ) : null}
      <GovernedPatternCListSection
        title={hrLifecycleUiCopy.section.title}
        description={hrLifecycleUiCopy.section.description}
        surfaceKey={hrLifecycleSurfaceKey}
        listConfiguration={buildHrLifecycleListSurface({ window, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function HrLifecycleAccessDenied() {
  const denied = hrLifecycleUiCopy.accessDenied;

  return (
    <SectionPanel title={denied.title}>
      <p className="type-muted">{denied.description}</p>
    </SectionPanel>
  );
}
