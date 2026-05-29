import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import {
  archiveHrDocumentAction,
  registerHrDocumentAction,
  rejectHrDocumentAction,
  upsertHrDocumentRequirementAction,
  verifyHrDocumentAction,
} from "../actions/hr-documents.actions.server";
import {
  HrDocumentRequirementUpsertForm,
  HrDocumentRequirementsList,
} from "./hr-document-requirement-form.component.client";
import type { HrEmployeeDocumentWindow } from "../contracts/hr-document.contract";
import {
  buildHrDocumentsListSurface,
  hrDocumentsSurfaceKey,
} from "../surface/hr-documents-list.surface";
import { hrDocumentsUiCopy } from "../surface/hr-documents-ui.copy.shared";
import { HrDocumentRegisterForm } from "./hr-document-register-form.component.client";
import {
  HrDocumentArchiveForm,
  HrDocumentRejectForm,
  HrDocumentVerifyForm,
} from "./hr-document-verification-forms.component.client";

export function HrDocumentsSection({
  window,
  searchValue,
  canWrite,
  employees,
  requirements,
}: {
  window: HrEmployeeDocumentWindow;
  searchValue?: string;
  canWrite: boolean;
  employees: ReadonlyArray<{ id: string; label: string }>;
  requirements: ReadonlyArray<{
    id: string;
    documentType: string;
    title: string;
    requiredForStatus: string | null;
    graceDaysBeforeDue: number;
  }>;
}) {
  const pendingDocuments = window.rows
    .filter(
      (row) =>
        row.verificationStatus === "pending" && row.lifecycleStatus === "active",
    )
    .map((row) => ({
      id: row.id,
      label: `${row.employeeNumber} — ${row.title} (${row.documentType})`,
    }));

  const activeDocuments = window.rows
    .filter((row) => row.lifecycleStatus === "active")
    .map((row) => ({
      id: row.id,
      label: `${row.employeeNumber} — ${row.title}`,
    }));

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        title={hrDocumentsUiCopy.requirements.title}
        description={hrDocumentsUiCopy.requirements.description}
      >
        <HrDocumentRequirementsList requirements={requirements} />
        {canWrite ? (
          <div className="mt-surface-lg">
            <HrDocumentRequirementUpsertForm
              upsertAction={upsertHrDocumentRequirementAction}
            />
          </div>
        ) : null}
      </SectionPanel>
      {canWrite ? (
        <>
          <SectionPanel
            title={hrDocumentsUiCopy.register.title}
            description={hrDocumentsUiCopy.register.description}
          >
            <HrDocumentRegisterForm
              employees={employees}
              registerAction={registerHrDocumentAction}
            />
          </SectionPanel>
          {pendingDocuments.length > 0 ? (
            <>
              <SectionPanel
                title={hrDocumentsUiCopy.verify.title}
                description={hrDocumentsUiCopy.verify.description}
              >
                <HrDocumentVerifyForm
                  pendingDocuments={pendingDocuments}
                  verifyAction={verifyHrDocumentAction}
                />
              </SectionPanel>
              <SectionPanel
                title={hrDocumentsUiCopy.reject.title}
                description={hrDocumentsUiCopy.reject.description}
              >
                <HrDocumentRejectForm
                  pendingDocuments={pendingDocuments}
                  rejectAction={rejectHrDocumentAction}
                />
              </SectionPanel>
            </>
          ) : null}
          {activeDocuments.length > 0 ? (
            <SectionPanel
              title={hrDocumentsUiCopy.archiveForm.title}
              description={hrDocumentsUiCopy.archiveForm.description}
            >
              <HrDocumentArchiveForm
                activeDocuments={activeDocuments}
                archiveAction={archiveHrDocumentAction}
              />
            </SectionPanel>
          ) : null}
        </>
      ) : null}
      <GovernedPatternCListSection
        title={hrDocumentsUiCopy.section.title}
        description={hrDocumentsUiCopy.section.description}
        surfaceKey={hrDocumentsSurfaceKey}
        listConfiguration={buildHrDocumentsListSurface({ window, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function HrDocumentsAccessDenied() {
  const denied = hrDocumentsUiCopy.accessDenied;

  return (
    <SectionPanel title={denied.title}>
      <p className="type-muted">{denied.description}</p>
    </SectionPanel>
  );
}
