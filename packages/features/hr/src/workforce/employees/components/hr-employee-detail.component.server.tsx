import { formatErpDateTime } from "@afenda/kernel";
import { SectionPanel, StatusBadge, type Tone } from "@afenda/ui";
import type { HrEmployeeDetail } from "../contracts";
import { hrEmployeesUiCopy } from "../surface/hr-employees-ui.copy.shared";

const STATUS_TONE: Record<HrEmployeeDetail["employmentStatus"], Tone> = {
  onboarding: "neutral",
  active: "positive",
  probation: "warning",
  confirmed: "positive",
  suspended: "warning",
  notice_period: "warning",
  offboarding: "warning",
  terminated: "warning",
  separated: "warning",
  retired: "neutral",
  archived: "neutral",
};

export function HrEmployeeDetailPanel({
  employee,
  backHref,
}: {
  employee: HrEmployeeDetail;
  backHref: string;
}) {
  const copy = hrEmployeesUiCopy.detail;

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={employee.displayName}
        description={`${copy.subtitlePrefix} ${employee.employeeNumber}`}
        aside={
          <StatusBadge
            label={employee.employmentStatus}
            tone={STATUS_TONE[employee.employmentStatus]}
          />
        }
      >
        <div className="flex flex-wrap gap-2">
          <a
            className="type-caption text-muted underline-offset-2 hover:underline"
            href={backHref}
          >
            {copy.backLabel}
          </a>
        </div>
      </SectionPanel>

      <SectionPanel title={copy.placementTitle}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="type-caption text-muted">{copy.departmentLabel}</dt>
            <dd className="type-body">{employee.departmentName ?? "—"}</dd>
          </div>
          <div>
            <dt className="type-caption text-muted">{copy.positionLabel}</dt>
            <dd className="type-body">{employee.positionTitle ?? "—"}</dd>
          </div>
          <div>
            <dt className="type-caption text-muted">{copy.managerLabel}</dt>
            <dd className="type-body">{employee.managerDisplayName ?? "—"}</dd>
          </div>
          <div>
            <dt className="type-caption text-muted">{copy.emailLabel}</dt>
            <dd className="type-body">{employee.email ?? "—"}</dd>
          </div>
        </dl>
      </SectionPanel>

      <SectionPanel title={copy.auditTitle}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="type-caption text-muted">{copy.createdLabel}</dt>
            <dd className="type-body">{formatErpDateTime(employee.createdAt)}</dd>
          </div>
          <div>
            <dt className="type-caption text-muted">{copy.updatedLabel}</dt>
            <dd className="type-body">{formatErpDateTime(employee.updatedAt)}</dd>
          </div>
        </dl>
      </SectionPanel>
    </div>
  );
}
