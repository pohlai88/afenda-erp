import { buildDocumentQuarantineInboxListSurface } from "@afenda/kernel";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { SystemAdminDocumentQuarantineInboxRow } from "./sys-document-quarantine-inbox.read-model.server";
import { systemAdminDocumentQuarantineInboxSurfaceKey } from "./sys-document-quarantine-inbox-gallery.fixtures.shared";

export { systemAdminDocumentQuarantineInboxSurfaceKey };

export function buildSystemAdminDocumentQuarantineInboxListSurface(input: {
  documents: readonly SystemAdminDocumentQuarantineInboxRow[];
  window?: {
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
    nextCursor?: string;
  };
  canViewSensitive?: boolean;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const surface = buildDocumentQuarantineInboxListSurface({
    documents: input.documents,
    window: input.window,
    canViewSensitive: input.canViewSensitive,
    canWrite: input.canWrite,
  });

  return {
    ...surface,
    surface: {
      ...surface.surface,
      columnsId: systemAdminDocumentQuarantineInboxSurfaceKey,
    },
  };
}
