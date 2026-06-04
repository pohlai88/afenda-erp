import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Alert, AlertDescription, AlertTitle, SectionPanel } from "@afenda/ui";
import type { SystemAdminDataManagementPageModel } from "./system-admin.data-management.page-model.server";
import {
  buildSystemAdminDataExportsListSurface,
  buildSystemAdminImportFailuresListSurface,
  buildSystemAdminImportJobsListSurface,
  buildSystemAdminImportTemplatesListSurface,
  systemAdminDataExportsSurfaceKey,
  systemAdminImportFailuresSurfaceKey,
  systemAdminImportJobsSurfaceKey,
  systemAdminImportTemplatesSurfaceKey,
} from "../surface/system-admin.import-jobs-list.surface";
import { systemAdminDataManagementUiCopy } from "../surface/system-admin.data-management-ui.copy.shared";
import { createSystemAdminImportJobFormAction } from "../actions/system-admin.import-jobs.actions.server";
import { SystemAdminCreateImportJobForm } from "./system-admin.create-import-job-form.component.client";
import { SystemAdminDataManagementExportButton } from "./system-admin.data-management-export-button.component.client";
import { SystemAdminDataManagementSummaryPanel } from "./system-admin.data-management-summary.component.server";
import { SystemAdminImportJobsTrailingCell } from "./system-admin.import-jobs-trailing-cells.component.client";

export function SystemAdminDataManagementSection({
  model,
  canManage,
  canRun,
  canCancel,
  canExport,
  exportDataManagementAction,
}: {
  model: SystemAdminDataManagementPageModel;
  canManage: boolean;
  canRun: boolean;
  canCancel: boolean;
  canExport: boolean;
  exportDataManagementAction: Parameters<
    typeof SystemAdminDataManagementExportButton
  >[0]["exportDataManagementAction"];
}) {
  const copy = systemAdminDataManagementUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={2}
        title={copy.page.title}
        description={copy.page.description}
        aside={
          canExport ? (
            <SystemAdminDataManagementExportButton
              exportDataManagementAction={exportDataManagementAction}
            />
          ) : null
        }
      />

      <div data-testid="system-admin-data-management-summary" className="contents">
        <SystemAdminDataManagementSummaryPanel summary={model.summary} />
      </div>

      <SectionPanel title={copy.create.title} description={copy.create.description}>
        {canManage ? (
          <SystemAdminCreateImportJobForm
            templates={model.templates}
            createImportJobFormAction={createSystemAdminImportJobFormAction}
          />
        ) : (
          <Alert>
            <AlertTitle>Import staging is permissioned</AlertTitle>
            <AlertDescription>
              You need system-admin.data-management.manage to create validation
              jobs.
            </AlertDescription>
          </Alert>
        )}
      </SectionPanel>

      <div data-testid="system-admin-data-management-templates" className="contents">
        <GovernedPatternCListSection
          title={copy.templates.title}
          description={copy.templates.description}
          surfaceKey={systemAdminImportTemplatesSurfaceKey}
          listConfiguration={buildSystemAdminImportTemplatesListSurface({
            templates: model.templates,
          })}
          parentAccessAllowed
          layout="embedded"
        />
      </div>

      <div data-testid="system-admin-data-management-import-jobs" className="contents">
        <GovernedPatternCListSection
          title={copy.importJobs.title}
          description={copy.importJobs.description}
          surfaceKey={systemAdminImportJobsSurfaceKey}
          listConfiguration={buildSystemAdminImportJobsListSurface({
            jobs: model.importJobs,
            canRun,
            canCancel,
            searchValue: model.importJobsSearch,
            totalCount: model.importJobs.length,
          })}
          parentAccessAllowed
          layout="embedded"
          trailingColumn={{
            header: copy.importJobs.trailingHeader,
            Cell: SystemAdminImportJobsTrailingCell,
          }}
        />
      </div>

      <GovernedPatternCListSection
        title={copy.failures.title}
        description={copy.failures.description}
        surfaceKey={systemAdminImportFailuresSurfaceKey}
        listConfiguration={buildSystemAdminImportFailuresListSurface({
          failures: model.rowFailures,
          searchValue: model.failuresSearch,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.exports.title}
        description={copy.exports.description}
        surfaceKey={systemAdminDataExportsSurfaceKey}
        listConfiguration={buildSystemAdminDataExportsListSurface({
          exports: model.exportJobs,
          searchValue: model.exportsSearch,
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function SystemAdminDataManagementAccessDenied() {
  const pageCopy = systemAdminDataManagementUiCopy.page;
  const deniedCopy = systemAdminDataManagementUiCopy.accessDenied;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={2}
        title={pageCopy.title}
        description={pageCopy.description}
      />
      <SectionPanel title={deniedCopy.title}>
        <p className="type-muted">{deniedCopy.description}</p>
      </SectionPanel>
    </div>
  );
}
