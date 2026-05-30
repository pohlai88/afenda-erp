import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrWorkforceDocumentsReadPermission } from "../contracts/hr.workforce.documents.contract";
import { formatDocumentsEnumLabel } from "../schemas/hr.workforce.documents-form.shared";

export type DocumentsListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type DocumentsListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
type DocumentsListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildDocumentsListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return {
    search: {
      param: input.param,
      label: input.label,
      placeholder: input.placeholder,
      value: input.value,
    },
  };
}

export function buildDocumentsOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildDocumentsListSearchToolbar>;
  window: DocumentsListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: DocumentsListColumn[];
  rows: DocumentsListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrWorkforceDocumentsReadPermission,
    presentation: {
      primaryColumnId: input.primaryColumnId,
      toolbar: input.searchToolbar,
    },
    pagination: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: { title: input.surface.headerTitle },
      columnsId: input.surface.columnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: input.surface.emptyTitle,
        description: input.surface.emptyDescription,
      },
    },
    columns: input.columns,
    rows: input.rows,
  });
}

export function formatDocumentsEmployeeListCell(input: {
  employeeNumber: string;
  employeeDisplayName: string;
}): string {
  return `${input.employeeDisplayName} (${input.employeeNumber})`;
}

export function formatDocumentsListEnumCell(value: string): string {
  return formatDocumentsEnumLabel(value);
}

type BadgeTone = "default" | "attention" | "critical";

const VERIFICATION_BADGE_TONE: Record<string, BadgeTone> = {
  pending: "attention",
  verified: "default",
  rejected: "critical",
  expired: "critical",
};

const VERIFICATION_ROW_TONE: Record<
  string,
  NonNullable<DocumentsListRow["rowTone"]>
> = {
  pending: "attention",
  verified: "default",
  rejected: "critical",
  expired: "critical",
};

const EXPIRY_POSTURE_BADGE_TONE: Record<string, BadgeTone> = {
  current: "default",
  expiring: "attention",
  expired: "critical",
};

export function resolveDocumentsVerificationBadgeTone(status: string): BadgeTone {
  return VERIFICATION_BADGE_TONE[status] ?? "default";
}

export function resolveDocumentsVerificationRowTone(
  status: string,
): NonNullable<DocumentsListRow["rowTone"]> {
  return VERIFICATION_ROW_TONE[status] ?? "default";
}

export function resolveDocumentsExpiryPostureBadgeTone(
  posture: string,
): BadgeTone {
  return EXPIRY_POSTURE_BADGE_TONE[posture] ?? "default";
}

export function resolveDocumentsRepositoryTrailingAction(
  canWrite: boolean,
  verificationStatus: string,
) {
  if (!canWrite) {
    return resolveListSurfaceRowTrailingAction({
      visible: false,
      allowed: false,
    });
  }
  if (verificationStatus === "verified") {
    return resolveListSurfaceRowTrailingAction({
      visible: true,
      allowed: true,
      descriptor: {
        id: "replace-document",
        label: "Replace",
        intent: "default",
      },
    });
  }
  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: true,
    descriptor: {
      id: "review-document",
      label: "Review",
      intent: "approval",
    },
  });
}
