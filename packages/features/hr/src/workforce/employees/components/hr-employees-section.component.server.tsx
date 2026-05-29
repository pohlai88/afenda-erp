import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { HrEmployeeDirectoryWindow } from "../contracts";
import {
  buildHrEmployeesListSurface,
  hrEmployeesSurfaceKey,
} from "../surface/hr-employees-list.surface";
import { hrEmployeesUiCopy } from "../surface/hr-employees-ui.copy.shared";

export function HrEmployeesSection({
  window,
  searchValue,
}: {
  window: HrEmployeeDirectoryWindow;
  searchValue?: string;
}) {
  const copy = hrEmployeesUiCopy.section;

  return (
    <GovernedPatternCListSection
      title={copy.title}
      description={copy.description}
      surfaceKey={hrEmployeesSurfaceKey}
      listConfiguration={buildHrEmployeesListSurface({ window, searchValue })}
      parentAccessAllowed
      layout="embedded"
    />
  );
}

export function HrEmployeesAccessDenied() {
  const pageCopy = hrEmployeesUiCopy.page;
  const deniedCopy = hrEmployeesUiCopy.accessDenied;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={pageCopy.title}
        description={pageCopy.description}
      />
      <SectionPanel title={deniedCopy.title}>
        <p className="type-muted">{deniedCopy.description}</p>
      </SectionPanel>
    </div>
  );
}
