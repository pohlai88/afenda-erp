import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";

import type { HrEmployeeRecordDetailPageModel } from "../data/hr.workforce.records.detail.page-model.server";
import { hrRecordsRoutePaths } from "../contracts/hr.workforce.records-route.contract";
import { hrRecordsUiCopy } from "../surface/hr.workforce.records-ui.copy.shared";

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="type-label">{label}</dt>
      <dd className="type-body">{value || "—"}</dd>
    </div>
  );
}

export function HrRecordsDetailSection({
  model,
}: {
  model: HrEmployeeRecordDetailPageModel;
}) {
  const copy = model.copy.detail;
  const employee = model.employee;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={employee.displayName}
        description={`${employee.employeeNumber} · ${copy.profileDescription}`}
        aside={
          <Link href={hrRecordsRoutePaths.records} className="type-control">
            {copy.backLabel}
          </Link>
        }
      />

      {!model.canViewSensitive ? (
        <Alert>
          <AlertTitle>{hrRecordsUiCopy.sensitiveAccess.title}</AlertTitle>
          <AlertDescription>
            {hrRecordsUiCopy.sensitiveAccess.detailDescription}
          </AlertDescription>
        </Alert>
      ) : null}

      <SectionPanel title={copy.profileTitle} description={copy.profileDescription}>
        <dl className="grid gap-surface-md @md:grid-cols-2">
          <DetailField
            label={copy.employeeNumberLabel}
            value={employee.employeeNumber}
          />
          <DetailField label={copy.statusLabel} value={employee.employmentStatus} />
          <DetailField label={copy.legalNameLabel} value={employee.legalName} />
          <DetailField
            label={copy.preferredNameLabel}
            value={employee.preferredName ?? "—"}
          />
          <DetailField label={copy.emailLabel} value={employee.email} />
          <DetailField label={copy.identityLabel} value={employee.identityNumber} />
          <DetailField label={copy.phoneLabel} value={employee.phoneNumber} />
          <DetailField label={copy.dateOfBirthLabel} value={employee.dateOfBirth} />
          <DetailField
            label={copy.departmentLabel}
            value={employee.departmentName ?? "—"}
          />
          <DetailField
            label={copy.positionLabel}
            value={employee.positionTitle ?? "—"}
          />
          <DetailField
            label={copy.managerLabel}
            value={employee.managerDisplayName ?? "—"}
          />
          <DetailField
            label={copy.addressLabel}
            value={employee.residentialAddress}
          />
          {employee.archivedAt ? (
            <DetailField
              label={copy.archivedLabel}
              value={employee.archivedAt.toLocaleDateString()}
            />
          ) : null}
          <DetailField
            label={copy.updatedLabel}
            value={employee.updatedAt.toLocaleString()}
          />
        </dl>
      </SectionPanel>
    </div>
  );
}

export function HrRecordsDetailNotFoundPanel() {
  const copy = hrRecordsUiCopy.detail;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.notFoundTitle}
        description={copy.notFoundDescription}
        aside={
          <Link href={hrRecordsRoutePaths.records} className="type-control">
            {copy.backLabel}
          </Link>
        }
      />
      <Alert variant="destructive">
        <AlertTitle>{copy.notFoundTitle}</AlertTitle>
        <AlertDescription>{copy.notFoundDescription}</AlertDescription>
      </Alert>
    </div>
  );
}
