# Metadata-Driven UI Architecture

Status: repaired implementation architecture, May 2026.

Afenda uses governed metadata to describe ERP UI intent while server runtime code keeps authority over data access, auth, tenancy, rendering, telemetry, and mutations. This is not a tenant-authored low-code runtime and not runtime JSON-to-JSX.

## Prime Directive

Metadata declares intent. Runtime code owns authority.

Metadata may describe fields, columns, row links, filters, sort choices, presentation profiles, empty states, and action descriptors. Metadata must not execute code, dynamically import tenant-selected React components, mutate database schema, build raw SQL, bypass auth, or become a production screen builder.

## Current Implementation Truth

- `@afenda/governed-surface` is the governed UI kernel and already exposes public doors for root, `client`, `server`, `metadata`, and `schemas`.
- `@afenda/erp` owns App Router routes, Server Components, session context, and page composition.
- `@afenda/domain` owns module definitions, record type definitions, query normalization, workspace shaping, and surface builders.
- `@afenda/db` owns persisted ERP records, work items, saved views, documents, query windows, Drizzle schema, and RLS context helpers.
- `@afenda/ui` provides accessible primitives and remains metadata-unaware.
- Dashboard, module workspace, and solution-console list sections already render through `GovernedPatternCListSection`.
- Stats still use `MetricCard` and `MetricGrid` in app routes. `buildGovernedStatGrid` exists, but app-level stat adoption is deliberate rather than automatic.
- `RecordTypeDefinition` is the app-facing contract for record list columns, default profile, default filters, default sort, route templates, toolbar metadata, extension validation, and record permissions.
- Server windows expose `pageSize`, `totalCount`, `hasNextPage`, and opaque cursor metadata. Route-level list state uses server-normalized URL params.

## Package Boundaries

| Package                    | Responsibility                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `@afenda/erp`              | App Router routes, Server Components, route-level auth checks, search-param threading, and runtime composition.               |
| `@afenda/domain`           | ERP definitions, record type definitions, list-query normalization, domain-to-surface builders, labels, and fallback shaping. |
| `@afenda/governed-surface` | Schemas, builders, profiles, parse boundaries, renderer registry, server/client components, and gallery parse utilities.      |
| `@afenda/db`               | Tenant-scoped Drizzle queries, persisted records/work items/documents, JSONB fields, query windows, and migrations.           |
| `@afenda/auth`             | Sessions, organizations, roles, capabilities, and route-level authorization decisions.                                        |
| `@afenda/observability`    | OTel, render telemetry, invalid metadata events, query-window metrics, and action/audit spans.                                |
| `@afenda/ui`               | Visual primitives only. No ERP metadata imports.                                                                              |

Import rules:

- Server/domain code imports schemas and builders from `@afenda/governed-surface`.
- Client components import from `@afenda/governed-surface/client`.
- Server Components import RSC sections from `@afenda/governed-surface/server`.
- Metadata renderer dispatch imports from `@afenda/governed-surface/metadata`.
- `@afenda/ui` must not import `@afenda/governed-surface`.

## Shipped, In Progress, Deferred

| Capability                         | Status                                | Notes                                                                                                           |
| ---------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Governed list rendering            | Shipped for ERP workspace lists       | Dashboard, module workspace, and solution console use Pattern C list sections.                                  |
| Record type columns                | Shipped and stabilizing               | Record types define columns, profiles, route templates, filters, sort, toolbar, and row action descriptors.     |
| Server windows                     | Shipped and stabilizing               | Windows are server-owned and use opaque cursors; clients never receive full large datasets.                     |
| Row navigation                     | Stabilizing                           | Record rows use `rowHref` and `linkColumnId`; detail routes re-check server auth.                               |
| Trailing row actions               | Stabilizing                           | Rows carry `trailingAction` with `ActionDescriptor`; navigation actions are enabled only when a route exists.   |
| Extension metadata validation      | Stabilizing                           | Record JSONB extension data is parsed by record type before governed rows or detail pages consume it.           |
| Work-item drilldown                | Stabilizing                           | Work-item rows link to protected detail routes with module-scoped server reads.                                 |
| Read-only audit panels             | Stabilizing                           | Record and work-item detail routes render governed audit panels from server-shaped audit rows.                  |
| Governed stats                     | Package-ready, app adoption selective | Use where cross-module consistency matters; keep handcrafted stats where route-specific composition is clearer. |
| Detail tabs, forms, charts, kanban | Deferred by module need               | Promotion requires schema, fixtures, tests, telemetry, and route-level auth.                                    |

## Core Contracts

Use the existing contract names instead of introducing a parallel envelope:

- `ListSurfaceRendererConfiguration` is the governed list render contract.
- `ListColumn.header` is the display label field.
- `ListSurfaceRow.rowHref` drives row navigation.
- `ListSurfaceRow.trailingAction` carries row action state.
- `ActionDescriptor` describes action intent, label, confirmation, role hints, and step-up hints.
- `presentation.toolbar` carries governed search, filter, sort, saved-view, export, bulk-action, density, and column-picker metadata.
- `buildGovernedListSurface` and `buildGovernedStatGrid` resolve presentation profiles into render-ready configurations.

Rows are keyed by column id through `cells: Record<string, string | number | boolean>`. Positional string-cell arrays may remain only as legacy helpers for non-governed surfaces.

## Record Type Contract

`ErpModuleDefinition` remains the module shell contract. `RecordTypeDefinition` owns record-level UI behavior:

```ts
type RecordTypeDefinition = {
  moduleId: ModuleId;
  recordType: string;
  title: string;
  description: string;
  route?: {
    list?: `/${string}`;
    detail?: `/${string}`;
  };
  list: {
    defaultProfile: ListPresentationProfileId;
    columns: readonly ListColumn[];
    defaultSort?: readonly RecordTypeSortDefinition[];
    defaultFilters?: readonly RecordTypeFilterDefinition[];
    toolbar?: ListSurfaceToolbar;
    rowHrefTemplate?: `/${string}/records/:recordId`;
    trailingAction?: ActionDescriptor;
  };
  permissions: {
    read: ErpPermissionRequirement;
    create?: ErpPermissionRequirement;
    update?: ErpPermissionRequirement;
    delete?: ErpPermissionRequirement;
    search?: ErpPermissionRequirement;
    audit?: ErpPermissionRequirement;
  };
  extensionSchema?: z.ZodType<unknown>;
};
```

Rules:

- Mixed record-type lists use explicit fallback columns.
- Record-type extension metadata is validated before surface building with `parseRecordTypeExtension`.
- Core operational fields stay compiled columns.
- JSONB extension fields are for non-core, non-indexed, module-specific descriptors.
- Promote extension fields to compiled fields when they become reporting, indexing, workflow, or audit invariants.

## Extension Metadata Validation

Persisted record metadata remains JSONB at the database boundary, but it is not treated as render-ready metadata. `@afenda/domain` parses it against the owning `RecordTypeDefinition.extensionSchema` during workspace serialization.

Validation output is carried as:

- `ModuleWorkspaceRecord.extensionValid`
- `ModuleWorkspaceRecord.extensionIssues`

List surfaces map invalid extensions to an attention row tone and a governed row `decisionLedger` entry. Record detail routes show the same validation status after re-checking route capability. This keeps bad extension data visible to operators without giving the renderer authority to interpret arbitrary tenant JSON.

The current strict extension schemas are intentionally narrow and should expand only when a record type has a stable module need. Unknown record types continue through the default record-object schema so fallback rows remain inspectable.

## Query Windows And URL State

Supported route-level list params:

- `recordsCursor`
- `recordsSort`
- `recordsStatus`
- `recordsRecordType`
- `workItemsCursor`
- `workItemsSort`
- `workItemsStatus`
- `workItemsPriority`

Rules:

- App routes accept search params, but `@afenda/domain` normalizes them.
- `@afenda/db` owns accepted query shape and applies filters, sort, and cursor offsets.
- Cursors are opaque strings. Current implementation uses `offset:<number>` and should be treated as an internal format.
- Toolbar metadata reflects server-normalized state, not arbitrary client input.
- Next/previous links are emitted from server-built pagination metadata.
- Export and bulk mutation flows must run as server jobs, not browser loops.

## Actions And Audit Readiness

Initial action support is navigation-only:

- Record rows expose `rowHref`.
- Record rows expose `trailingAction` with `ActionDescriptor`.
- Work-item rows expose `rowHref` and `trailingAction` once their detail route exists.
- Record and work-item details may render read-only governed audit panels.
- Mutating command actions remain deferred until server handlers, confirmations, capability checks, and audit writes land together.

Audit panels are evidence surfaces, not command surfaces. They must be shaped by server/domain code from tenant-scoped audit reads. App routes and renderers must not query raw audit logs directly.

Dangerous or mutating actions require:

- server-side authorization at execution time,
- confirmation metadata,
- audit logging,
- telemetry spans,
- selection limits for bulk actions,
- background job execution for long-running work.

## Vercel And Next.js Runtime Rules

The ERP app is a Next.js App Router app deployed through Vercel. The current build path remains:

```bash
pnpm turbo build --filter=@afenda/erp
```

Runtime rules:

- Keep DB/auth/service clients lazily initialized. Do not create Neon, Drizzle, Redis, or external SDK clients at module scope in new code.
- `proxy.ts` is a traffic/session helper, not the only auth boundary.
- Server Components, Route Handlers, and Server Actions must re-check capability before protected data reads or mutations.
- Preserve `@vercel/otel` instrumentation and avoid logging tenant-sensitive field values.
- Keep Vercel cron paths unchanged unless a real background job is added.
- Vercel Blob image configuration remains centralized in `createAfendaNextConfig`.

## Testing Gates

Minimum gates for metadata UI work:

- `pnpm --filter @afenda/governed-surface test`
- `pnpm --filter @afenda/domain test`
- `pnpm --filter @afenda/erp typecheck`
- `pnpm build`
- `pnpm test:e2e` when route behavior changes

Required scenarios:

- ready list,
- empty list,
- invalid metadata,
- extension schema success and failure,
- denied surface,
- cursor pagination,
- toolbar filters and sort,
- row navigation,
- trailing row action,
- governed stat grid where adopted.

Invalid metadata must fail parse before rendering. Production fallbacks must be safe and telemetry must not include tenant-sensitive values.

## Decision Summary

Afenda should continue building an internal governed UI kernel. The architecture is metadata-driven where it improves consistency, testability, and operational safety, while server runtime code remains the source of truth for data, authorization, tenancy, audit, and command execution.
