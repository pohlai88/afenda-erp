# Governed Surface Builders Scaffold

Drop this folder into your governed surface package, usually:

```txt
packages/features/governed-surface/src/builders/
```

## What this scaffold gives you

- `buildGovernedListSurface` — list/table surface builder.
- `buildGovernedChartSurface` — chart surface builder with schema-version defaulting.
- `buildGovernedStatGrid` — stat card/grid builder.
- `buildGovernedWorkbenchSurface` — page-level composition builder.
- `buildGovernedDetailSurface` — record/detail page builder.
- `buildGovernedFormSurface` — create/edit form builder.
- `buildGovernedExceptionSurface` — blockers, NCRs, exceptions, approvals.
- `buildGovernedAuditTimeline` — evidence/history timeline.
- `buildGovernedActionBar` — primary/secondary/overflow actions.
- `buildGovernedEmptyState` — no-data, no-results, no-access, not-configured states.
- `governed-list-toolbar.shared` — focus search, export, toolbar merge helpers.
- `list-surface-header.shared` — safer header helper that separates machine ID from human title.

## Recommended enterprise pattern

Feature packages should expose one builder per ERP screen:

```ts
export function buildEmployeeWorkbenchSurface(input: EmployeeWorkbenchInput) {
  return buildGovernedWorkbenchSurface({
    surfaceId: "hr.employee.workbench",
    title: "Employees",
    stats: [buildGovernedStatGrid(...)],
    list: buildGovernedListSurface(...),
    actions: buildGovernedActionBar(...),
  });
}
```

## Important integration notes

1. Keep builders server-safe by default. Avoid React, browser APIs, and client hooks.
2. Builders should construct metadata/configuration only. Rendering stays inside governed-surface renderer components.
3. Keep `surfaceId`, `columnsId`, `actionId`, and permission IDs stable.
4. Parse/validate at renderer boundary or feature boundary using your existing Zod schemas.
5. Add audit tests that prevent feature packages from bypassing these builders.

## Suggested next audits

- No feature package imports renderer schema internals directly unless allowed.
- Every governed surface has `__schemaVersion`.
- Every action has stable `actionId`.
- Every export/bulk action has permission coverage.
- Every workbench has empty/no-results/access-denied state coverage.
