import type { HrOrgPositionWindow } from "@afenda/db";

import { hrOrgVacanciesSearchParam } from "../data/hr.workforce.org-search-params.parse.shared";
import { buildHrOrgPositionsListSurface } from "./hr.workforce.org-positions-list.surface";
import { hrOrgUiCopy } from "./hr.workforce.org-ui.copy.shared";

export const hrOrgVacanciesSurfaceKey = "hr.workforce.org.vacancies.list";

export function buildHrOrgVacanciesListSurface(input: {
  window: HrOrgPositionWindow;
  searchValue?: string;
}) {
  const surface = buildHrOrgPositionsListSurface(input);
  return {
    ...surface,
    surface: {
      ...surface.surface,
      header: { title: hrOrgUiCopy.vacancies.surfaceHeaderTitle },
      empty: {
        variant: "muted" as const,
        title: hrOrgUiCopy.vacancies.emptyTitle,
        description: hrOrgUiCopy.vacancies.emptyDescription,
      },
    },
    presentation: {
      ...surface.presentation,
      toolbar: {
        search: {
          param: hrOrgVacanciesSearchParam,
          label: hrOrgUiCopy.vacancies.searchLabel,
          placeholder: hrOrgUiCopy.vacancies.searchPlaceholder,
          value: input.searchValue,
        },
      },
    },
  };
}
