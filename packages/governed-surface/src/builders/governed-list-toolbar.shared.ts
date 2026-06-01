import { GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS } from "../schemas/workbench-search-params.shared";
import type { ListSurfacePresentation } from "../schemas/list-surface-renderer.schema";
import type { ListSurfaceToolbar } from "../schemas/list-surface-toolbar.schema";

export type GovernedWorkbenchFocusSearchInput = {
  label: string;
  placeholder?: string;
  value?: string | null;
};

function mergeToolbarSection<TSection extends object>(
  base: TSection | undefined,
  override: TSection | undefined,
): TSection | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  return { ...base, ...override };
}

export function mergeListToolbar(
  base: ListSurfaceToolbar | undefined,
  override: ListSurfaceToolbar | undefined,
): ListSurfaceToolbar | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;

  return {
    ...base,
    ...override,
    export: mergeToolbarSection(base.export, override.export),
    search: mergeToolbarSection(base.search, override.search),
    filters: mergeToolbarSection(base.filters, override.filters),
    sort: mergeToolbarSection(base.sort, override.sort),
    savedView: mergeToolbarSection(base.savedView, override.savedView),
    bulkActions: mergeToolbarSection(base.bulkActions, override.bulkActions),
    densityToggle: mergeToolbarSection(base.densityToggle, override.densityToggle),
    columnPicker: mergeToolbarSection(base.columnPicker, override.columnPicker),
    resetParams: mergeToolbarSection(base.resetParams, override.resetParams),
  };
}

/** Merges focus search with existing builder presentation, preserving other toolbar sections. */
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
  formats?: readonly ["csv", ...string[]];
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
        formats: input.formats ?? ["csv"],
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
  if (needle.length === 0) return true;
  return haystacks.some((value) =>
    (value ?? "").toLowerCase().includes(needle),
  );
}
