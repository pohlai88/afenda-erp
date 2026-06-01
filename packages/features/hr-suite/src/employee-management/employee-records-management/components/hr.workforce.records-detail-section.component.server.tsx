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

function EmergencyContactField({
  contact,
}: {
  contact: HrEmployeeRecordDetailPageModel["employee"]["emergencyContacts"][number];
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="type-label">
        {contact.contactName}
        {contact.isPriority ? ` · ${hrRecordsUiCopy.detail.emergencyPriorityLabel}` : ""}
      </dt>
      <dd className="type-body">
        {contact.relationship}
        {contact.phoneNumber ? ` · ${contact.phoneNumber}` : ""}
      </dd>
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
          <DetailField
            label={copy.employmentStartDateLabel}
            value={employee.employmentStartDate}
          />
          <DetailField label={copy.createdLabel} value={employee.createdAt} />
          <DetailField label={copy.updatedLabel} value={employee.updatedAt} />
        </dl>
      </SectionPanel>

      <SectionPanel
        title={copy.employmentTitle}
        description={copy.employmentDescription}
      >
        <dl className="grid gap-surface-md @md:grid-cols-2">
          <DetailField
            label={copy.employmentTypeLabel}
            value={employee.employmentType}
          />
          <DetailField
            label={copy.workerCategoryLabel}
            value={employee.workerCategory}
          />
          <DetailField label={copy.gradeLabel} value={employee.grade} />
          <DetailField label={copy.levelLabel} value={employee.level} />
          <DetailField
            label={copy.legalEntityLabel}
            value={employee.legalEntityCode}
          />
          <DetailField
            label={copy.workLocationLabel}
            value={employee.workLocationCode}
          />
          <DetailField label={copy.countryLabel} value={employee.countryCode} />
          <DetailField
            label={copy.contractStartDateLabel}
            value={employee.contractStartDate}
          />
          <DetailField
            label={copy.contractEndDateLabel}
            value={employee.contractEndDate}
          />
          <DetailField
            label={copy.probationEndDateLabel}
            value={employee.probationEndDate}
          />
          <DetailField
            label={copy.confirmationDateLabel}
            value={employee.confirmationDate}
          />
          <DetailField
            label={copy.payrollReadyLabel}
            value={employee.payrollReadyAt}
          />
          <DetailField
            label={copy.complianceReadyLabel}
            value={employee.complianceReadyAt}
          />
          {employee.rehiredFrom ? (
            <DetailField
              label={copy.rehiredFromLabel}
              value={`${employee.rehiredFrom.employeeNumber} · ${employee.rehiredFrom.displayName}`}
            />
          ) : null}
        </dl>
      </SectionPanel>

      <SectionPanel
        title={copy.assignmentTitle}
        description={copy.assignmentDescription}
      >
        <dl className="grid gap-surface-md @md:grid-cols-2">
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
            label={copy.matrixManagerLabel}
            value={employee.matrixManagerDisplayName ?? "—"}
          />
          <DetailField
            label={copy.hrOwnerLabel}
            value={employee.hrOwnerDisplayName ?? "—"}
          />
        </dl>
      </SectionPanel>

      <SectionPanel
        title={copy.personalTitle}
        description={copy.personalDescription}
      >
        <dl className="grid gap-surface-md @md:grid-cols-2">
          <DetailField label={copy.emailLabel} value={employee.email} />
          <DetailField
            label={copy.personalEmailLabel}
            value={employee.personalEmail}
          />
          <DetailField
            label={copy.identityDocumentTypeLabel}
            value={employee.identityDocumentType}
          />
          <DetailField label={copy.identityLabel} value={employee.identityNumber} />
          <DetailField
            label={copy.nationalityLabel}
            value={employee.nationality}
          />
          <DetailField label={copy.phoneLabel} value={employee.phoneNumber} />
          <DetailField label={copy.dateOfBirthLabel} value={employee.dateOfBirth} />
          <DetailField label={copy.genderLabel} value={employee.gender} />
          <DetailField
            label={copy.maritalStatusLabel}
            value={employee.maritalStatus}
          />
          <DetailField
            label={copy.languagePreferenceLabel}
            value={employee.languagePreference}
          />
          <DetailField
            label={copy.addressLabel}
            value={employee.residentialAddress}
          />
          <DetailField
            label={copy.mailingAddressLabel}
            value={employee.mailingAddress}
          />
          {employee.archivedAt ? (
            <DetailField
              label={copy.archivedLabel}
              value={employee.archivedAt.toLocaleDateString()}
            />
          ) : null}
        </dl>
      </SectionPanel>

      <SectionPanel
        title={copy.emergencyTitle}
        description={copy.emergencyDescription}
      >
        <dl className="grid gap-surface-md @md:grid-cols-2">
          {employee.emergencyContacts.length > 0 ? (
            employee.emergencyContacts.map((contact) => (
              <EmergencyContactField key={contact.id} contact={contact} />
            ))
          ) : (
            <DetailField label={copy.emergencyTitle} value="" />
          )}
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
