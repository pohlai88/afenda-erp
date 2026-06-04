import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import type { SystemAdminImportJobStatus } from "./sys-import-job.contract";
import { systemAdminDataManagementUiCopy } from "./system-admin.data-management-ui.copy.shared";

export function resolveSystemAdminImportJobRowTrailingAction(input: {
  status: SystemAdminImportJobStatus;
  canRun: boolean;
  canCancel: boolean;
}) {
  if (input.status === "ready") {
    return resolveListSurfaceRowTrailingAction({
      visible: true,
      allowed: input.canRun,
      disabledReason: systemAdminDataManagementUiCopy.actions.runDenied,
      descriptor: {
        id: "system-admin.data-management.import.run",
        label: systemAdminDataManagementUiCopy.actions.run,
        intent: "default",
        confirm: {
          title: "Run import job",
          description:
            "Validated rows will be applied through the adapter/domain service boundary.",
          confirmLabel: "Run import",
        },
      },
    });
  }

  if (input.status === "failed" || input.status === "cancelled") {
    return resolveListSurfaceRowTrailingAction({
      visible: true,
      allowed: input.canRun,
      disabledReason: systemAdminDataManagementUiCopy.actions.runDenied,
      descriptor: {
        id: "system-admin.data-management.import.retry",
        label: systemAdminDataManagementUiCopy.actions.retry,
        intent: "default",
      },
    });
  }

  return resolveListSurfaceRowTrailingAction({
    visible:
      input.status === "uploaded" ||
      input.status === "validating" ||
      input.status === "running",
    allowed: input.canCancel,
    disabledReason: systemAdminDataManagementUiCopy.actions.cancelDenied,
    descriptor: {
      id: "system-admin.data-management.import.cancel",
      label: systemAdminDataManagementUiCopy.actions.cancel,
      intent: "destructive",
      confirm: {
        title: "Cancel import job",
        description:
          "Future batches will stop. Already applied domain commands are not silently reversed.",
        confirmLabel: "Cancel job",
      },
    },
  });
}
