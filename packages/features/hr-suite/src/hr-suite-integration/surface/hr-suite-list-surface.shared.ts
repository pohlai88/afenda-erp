import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  buildGovernedListSurface,
  resolveListSurfaceRowTrailingAction,
  type ActionDescriptor,
  type ListPresentationProfileId,
  type ListSurfaceRendererConfigurationInput,
  type ListSurfaceRendererConfigurationResolvedInput,
  type ListSurfaceRowTrailingAction,
  type ListSurfaceToolbar,
  type ResolveListSurfaceRowTrailingActionInput,
} from "@afenda/governed-surface";

import type { HrListWindow } from "../contracts/hr-suite-pagination.contract";
import type { HrSuiteErpPermissionDescriptor } from "../contracts/hr-suite-permission.contract";

export type HrSuiteListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
export type HrSuiteListRow =
  ListSurfaceRendererConfigurationInput["rows"][number];
export type HrSuiteListSurfaceProfile = Extract<
  ListPresentationProfileId,
  | "erp-operational-table"
  | "erp-exception-table"
  | "erp-analytical-table"
  | "erp-audit-ledger"
>;

export type HrSuiteListSearchToolbarInput = {
  readonly param: string;
  readonly label: string;
  readonly placeholder: string;
  readonly value?: string | null;
};

export type HrSuiteSearchParamRegistryEntry<
  SurfaceKey extends string = string,
  ModelField extends string = string,
> = {
  readonly surfaceKey: SurfaceKey;
  readonly param: string;
  readonly modelField: ModelField;
  readonly label: string;
  readonly placeholder: string;
};

export type BuildHrSuiteOperationalListSurfaceInput = {
  readonly primaryColumnId: string;
  readonly readPermission: HrSuiteErpPermissionDescriptor;
  readonly profile?: HrSuiteListSurfaceProfile;
  readonly searchToolbar?: ListSurfaceToolbar;
  readonly window: HrListWindow;
  readonly surface: {
    readonly headerTitle: string;
    readonly columnsId: string;
    readonly rowKey?: string;
    readonly emptyTitle: string;
    readonly emptyDescription: string;
  };
  readonly columns: readonly HrSuiteListColumn[];
  readonly rows: readonly HrSuiteListRow[];
};

function normalizeRequiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`${label} must not be empty.`);
  }
  return normalized;
}

export function buildHrSuiteListSearchToolbar(
  input: HrSuiteListSearchToolbarInput,
): Pick<ListSurfaceToolbar, "search"> {
  return {
    search: {
      param: normalizeRequiredText(input.param, "Search param"),
      label: normalizeRequiredText(input.label, "Search label"),
      placeholder: normalizeRequiredText(
        input.placeholder,
        "Search placeholder",
      ),
      ...(input.value == null ? {} : { value: input.value }),
    },
  };
}

export function defineHrSuiteSearchParamRegistry<
  const Registry extends readonly HrSuiteSearchParamRegistryEntry[],
>(registry: Registry): Registry {
  return registry;
}

export function buildHrSuiteSearchParamsBySurfaceKey<
  const Registry extends readonly HrSuiteSearchParamRegistryEntry[],
>(registry: Registry): Record<Registry[number]["surfaceKey"], string> {
  return Object.fromEntries(
    registry.map((entry) => [entry.surfaceKey, entry.param]),
  ) as Record<Registry[number]["surfaceKey"], string>;
}

export function buildHrSuiteSearchParamModelFields<
  const Registry extends readonly HrSuiteSearchParamRegistryEntry[],
>(registry: Registry): readonly Registry[number]["modelField"][] {
  return registry.map((entry) => entry.modelField);
}

export function buildHrSuiteOperationalListSurface(
  input: BuildHrSuiteOperationalListSurfaceInput,
): ListSurfaceRendererConfigurationResolvedInput {
  const nextCursor = input.window.nextCursor?.trim();
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: input.profile ?? "erp-operational-table",
    requiresErpPermission: input.readPermission,
    presentation: {
      primaryColumnId: input.primaryColumnId,
      ...(input.searchToolbar ? { toolbar: input.searchToolbar } : {}),
    },
    pagination: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
      ...(nextCursor ? { nextCursor } : {}),
    },
    surface: {
      header: { title: input.surface.headerTitle },
      columnsId: input.surface.columnsId,
      rowKey: input.surface.rowKey ?? "id",
      empty: {
        variant: "muted",
        title: input.surface.emptyTitle,
        description: input.surface.emptyDescription,
      },
    },
    columns: [...input.columns],
    rows: [...input.rows],
  });
}

export function defineHrSuiteActionDescriptor(input: {
  readonly id: string;
  readonly label: string;
  readonly intent?: ActionDescriptor["intent"];
  readonly minRole?: ActionDescriptor["minRole"];
  readonly requiresStepUp?: boolean;
  readonly confirm?: ActionDescriptor["confirm"];
}): ActionDescriptor {
  return {
    id: normalizeRequiredText(input.id, "Action id"),
    label: normalizeRequiredText(input.label, "Action label"),
    intent: input.intent ?? "default",
    ...(input.minRole ? { minRole: input.minRole } : {}),
    ...(input.requiresStepUp === undefined
      ? {}
      : { requiresStepUp: input.requiresStepUp }),
    ...(input.confirm ? { confirm: input.confirm } : {}),
  };
}

export function resolveHrSuiteListTrailingAction(
  input: ResolveListSurfaceRowTrailingActionInput,
): ListSurfaceRowTrailingAction | undefined {
  return resolveListSurfaceRowTrailingAction(input);
}

