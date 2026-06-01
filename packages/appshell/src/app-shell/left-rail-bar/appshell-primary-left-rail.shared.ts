import type { AppShellPrimaryLeftRailNavSection } from "./appshell-primary-left-rail.schema";

export const APP_SHELL_PRIMARY_RAIL_SECTION_WIDTH_CLASS =
  "w-full min-w-0 max-w-full";

export function filterAppShellPrimaryLeftRailNavSections(
  sections: readonly AppShellPrimaryLeftRailNavSection[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [...sections];
  }

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const haystack = [
          item.label,
          item.description,
          item.href,
          ...(item.items?.map((child) => child.label) ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      }),
    }))
    .filter((section) => section.items.length > 0);
}
