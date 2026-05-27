import { GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS } from "../schemas/workbench-search-params.shared";
import type { ListSurfacePresentation } from "../schemas/list-surface-renderer.schema";
import type { ListSurfaceToolbar } from "../schemas/list-surface-toolbar.schema";

export type GovernedWorkbenchFocusSearchInput = {
  label: string;
  placeholder?: string;
  value?: string | null;
};

function mergeListToolbar(
  base: ListSurfaceToolbar | undefined,
  override: ListSurfaceToolbar | undefined,
): ListSurfaceToolbar | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  return {
    ...base,
    ...override,
    export: override.export ?? base.export,
    search: override.search ?? base.search,
    filters: override.filters ?? base.filters,
    sort: override.sort ?? base.sort,
    savedView: override.savedView ?? base.savedView,
    bulkActions: override.bulkActions ?? base.bulkActions,
    densityToggle: override.densityToggle ?? base.densityToggle,
    columnPicker: override.columnPicker ?? base.columnPicker,
    resetParams: override.resetParams ?? base.resetParams,
  };
}

/**
 * Bookmarkable list filter via `?focus=` (nuqs + ListSurfaceToolbarClient).
 * Server builders pass the loaded search param value; the client writes URL updates.
 */
/** Merges focus search with existing builder presentation (e.g. export toolbar). */
export function governedWorkbenchFocusPresentationPatch(
  input: GovernedWorkbenchFocusSearchInput,
  base?: Partial<ListSurfacePresentation>,
): Partial<ListSurfacePresentation> {
  const focus = buildGovernedWorkbenchFocusSearchPresentation(input);
  return {
    ...base,
    toolbar: mergeListToolbar(base?.toolbar, focus.toolbar),
  };
}

export function buildGovernedWorkbenchFocusSearchPresentation(
  input: GovernedWorkbenchFocusSearchInput,
): Pick<ListSurfacePresentation, "toolbar"> {
  const trimmed = input.value?.trim() ?? "";
  return {
    toolbar: {
      search: {
        param: GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS.focus,
        label: input.label,
        ...(input.placeholder ? { placeholder: input.placeholder } : {}),
        ...(trimmed.length > 0 ? { value: trimmed } : {}),
      },
    },
  };
}

export type GovernedListExportToolbarInput = {
  actionId: string;
  label: string;
};

/** CSV export affordance for operational/exception list builders. */
export function buildGovernedListExportToolbarPresentation(
  input: GovernedListExportToolbarInput,
): Pick<ListSurfacePresentation, "toolbar"> {
  return {
    toolbar: {
      export: {
        actionId: input.actionId,
        label: input.label,
        formats: ["csv"],
      },
    },
  };
}

/** Merges toolbar descriptors onto an existing presentation patch. */
export function mergeGovernedListToolbarPresentation(
  base: Partial<ListSurfacePresentation> | undefined,
  toolbar: ListSurfaceToolbar,
): Partial<ListSurfacePresentation> {
  return {
    ...base,
    toolbar: mergeListToolbar(base?.toolbar, toolbar),
  };
}

export function matchesGovernedWorkbenchFocus(
  focus: string | null | undefined,
  ...haystacks: readonly (string | null | undefined)[]
): boolean {
  const needle = focus?.trim().toLowerCase() ?? "";
  if (needle.length === 0) {
    return true;
  }
  return haystacks.some((value) =>
    (value ?? "").toLowerCase().includes(needle),
  );
}
