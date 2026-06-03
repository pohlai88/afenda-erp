import {
  buildCareerPathingListSearchToolbar,
  buildCareerPathingOperationalListSurface,
  formatCareerPathingEnumLabel,
} from "./hr.talent.career-pathing-list.shared";
import {
  hrCareerPathingFrameworksColumnsId,
  hrCareerPathingFrameworksSearchParam,
  hrCareerPathingFrameworksSurfaceKey,
} from "./hr.talent.career-pathing-surface-metadata.shared";
import { hrTalentCareerPathingUiCopy } from "./hr.talent.career-pathing-ui.copy.shared";

export function buildHrCareerPathingFrameworksListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      code: string;
      name: string;
      pathKind: string;
      frameworkStatus: string;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrTalentCareerPathingUiCopy.frameworks;
  return buildCareerPathingOperationalListSurface({
    surfaceKey: hrCareerPathingFrameworksSurfaceKey,
    primaryColumnId: "name",
    searchToolbar: buildCareerPathingListSearchToolbar({
      param: hrCareerPathingFrameworksSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCareerPathingFrameworksColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, priority: "primary", cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, pin: "start", cellKind: { kind: "text" } },
      { id: "pathKind", header: copy.colPathKind, cellKind: { kind: "badge", tone: "default" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        pathKind: formatCareerPathingEnumLabel(row.pathKind),
        status: formatCareerPathingEnumLabel(row.frameworkStatus),
      },
    })),
  });
}

export const buildHrCareerPathFrameworksListSurface = buildHrCareerPathingFrameworksListSurface;
