import {
  hasDocumentReadAccess,
  hasDocumentWriteAccess,
  isAppCapability,
  type AppCapability,
} from "@afenda/auth";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type { SystemAdminDocumentQuarantineInboxWindow } from "../data/system-admin.document-quarantine-inbox.read-model.server";
import {
  buildSystemAdminDocumentQuarantineInboxListSurface,
  systemAdminDocumentQuarantineInboxSurfaceKey,
} from "../surface";
import { SystemAdminDocumentQuarantineTrailingCell } from "./system-admin.document-quarantine-trailing-cell.component.client";

export function SystemAdminDocumentQuarantineInboxSection({
  quarantineWindow,
  capabilities,
  organizationLegalHoldActive,
}: {
  quarantineWindow: SystemAdminDocumentQuarantineInboxWindow;
  capabilities: readonly AppCapability[];
  organizationLegalHoldActive: boolean;
}) {
  const appCapabilities = capabilities.filter(isAppCapability);
  const canViewSensitive = hasDocumentReadAccess(
    appCapabilities,
    "system-admin",
  );
  const canWrite = hasDocumentWriteAccess(appCapabilities, "system-admin");

  return (
    <SectionPanel
      headingLevel={2}
      title="Quarantine inbox"
      description="Documents blocked by malware scan until an operator approves release."
    >
      <GovernedPatternCListSection
        title="Quarantine inbox"
        surfaceKey={systemAdminDocumentQuarantineInboxSurfaceKey}
        listConfiguration={buildSystemAdminDocumentQuarantineInboxListSurface({
          documents: quarantineWindow.rows,
          window: quarantineWindow,
          canViewSensitive,
          canWrite,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={
          canWrite
            ? {
                header: "Actions",
                Cell: SystemAdminDocumentQuarantineTrailingCell,
                context: {
                  surfaceKey: systemAdminDocumentQuarantineInboxSurfaceKey,
                  organizationLegalHoldActive,
                },
              }
            : undefined
        }
      />
    </SectionPanel>
  );
}
