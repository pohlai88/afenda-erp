# HR Suite Integration

> **Parent doctrine:** [ARCH-010](../../../../../docs/architecture/010-hr-feature-package-architecture.md) · [ARCH-006](../../../../../docs/architecture/006-metadata-driven-ui-architecture.md) · [ARCH-007](../../../../../docs/architecture/007-governed-metadata-architecture.md)

## Definition

**HR Suite Integration is the package-internal foundation that centralizes
cross-slice HR Suite glue, public door discipline, navigation metadata, shared
contracts, server access guards, client-safe suite components, and reusable
governed-surface helper patterns used by multiple HR capability slices.**

---

# HR Suite Integration Includes

| Area                       | What It Covers                                                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Four Integration Doors** | `index.ts`, `client.ts`, `server.ts`, and `metadata.ts` as the only TypeScript entrypoints at integration root.                          |
| **Neutral Contracts**      | Module identity, route-neutral constants, pagination/list-window contracts, and shared permission descriptor types.                      |
| **Client Integration**     | Client-safe suite navigation and client components that do not import server-only graphs.                                                |
| **Server Integration**     | HR execution guards and server-only helper exports behind the `server.ts` door.                                                          |
| **Metadata Integration**   | Navigation metadata, surface-key registries, search-param helpers, and metadata-safe UI copy.                                            |
| **Governed List Helpers**  | Shared Pattern C list builders, search toolbars, bounded-window helpers, and trailing-action helpers when reused by multiple slices.     |
| **Action Result Helpers**  | Generic `ActionResult<T>` failure mappers and form wrappers that prevent data-returning actions from collapsing to `ActionResult<void>`. |
| **Import Discipline**      | Consumers import only the four doors and do not deep-import implementation folders.                                                      |
| **Root Discipline**        | HR Suite root buckets are blocked; suite-level glue is isolated in `hr-suite-integration`.                                               |
| **Scaffold Support**       | Future HR slice scaffold uses integration contracts instead of copying repeated boilerplate.                                             |

---

# HR Suite Integration Does Not Include

| Excluded Area                                                       | Owned By                                        |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| Slice business rules                                                | Owning HR capability slice                      |
| DB commands, queries, schema, and migrations                        | `@afenda/db`                                    |
| Durable workflow state                                              | `@afenda/workflows` or owning domain service    |
| App Router route files                                              | `apps/erp` thin adapters                        |
| Reusable UI primitives                                              | `@afenda/ui`                                    |
| Governed renderer implementation                                    | `@afenda/governed-surface`                      |
| Auth session storage and Neon Auth integration                      | `@afenda/auth`                                  |
| One-off copy, one-off transforms, or slice-only helpers             | Owning HR capability slice                      |
| Public package subpaths                                             | `@afenda/feature-hr-suite` package exports only |
| Catch-all folders such as `utils`, `helpers`, `common`, or `shared` | Forbidden by ARCH-010                           |

---

# HR Suite Integration Requirement Statement

| Requirement              | Description                                                                                                                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HR Suite Integration** | Provides a controlled package-internal integration layer that keeps HR Suite public doors stable, blocks root dumping and deep imports, centralizes reusable multi-slice helpers, and gives future HR slice scaffolds a consistent foundation without becoming a catch-all business-logic bucket. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-HSI-001** | System shall expose exactly four TypeScript integration doors: `index.ts`, `client.ts`, `server.ts`, and `metadata.ts`.                                                                                  |
| **HRM-HSI-002** | System shall keep `index.ts` environment-neutral with constants, types, contracts, and helpers that do not pull server-only or client-only graphs.                                                       |
| **HRM-HSI-003** | System shall keep `client.ts` limited to client components and browser-safe catalogs.                                                                                                                    |
| **HRM-HSI-004** | System shall keep `server.ts` as the local server integration door, consumed through the package-level `src/server.ts` server boundary marker, and export server-only guards, actions, and helpers only. |
| **HRM-HSI-005** | System shall keep `metadata.ts` limited to metadata-safe navigation, surface registry, search-param, and UI copy exports.                                                                                |
| **HRM-HSI-006** | System shall allow only named integration implementation folders: `actions`, `components`, `contracts`, `navigation`, `policies`, and `surface`.                                                         |
| **HRM-HSI-007** | System shall block consumers outside `hr-suite-integration` from deep-importing integration implementation folders.                                                                                      |
| **HRM-HSI-008** | System shall block HR Suite root buckets such as `actions`, `components`, `contracts`, `data`, `events`, `navigation`, `policies`, `schemas`, `surface`, and `tests`.                                    |
| **HRM-HSI-009** | System shall provide shared list-window and pagination contracts for bounded server-window list surfaces.                                                                                                |
| **HRM-HSI-010** | System shall provide shared ERP permission descriptor contracts for governed list metadata.                                                                                                              |
| **HRM-HSI-011** | System shall provide shared Pattern C list-surface helpers only when at least two HR slices use the same pattern.                                                                                        |
| **HRM-HSI-012** | System shall provide shared search-toolbar and search-param registry helpers only when they remain metadata-safe.                                                                                        |
| **HRM-HSI-013** | System shall provide shared trailing-action helpers that produce governed renderer-compatible descriptors.                                                                                               |
| **HRM-HSI-014** | System shall provide generic `ActionResult<T>` failure helpers for data-returning actions.                                                                                                               |
| **HRM-HSI-015** | System shall provide form-compatible one-argument wrappers for Server Actions used directly by native forms where needed.                                                                                |
| **HRM-HSI-016** | System shall centralize HR execution guard shape so slices do not repeatedly redefine organization, session, and capability context contracts.                                                           |
| **HRM-HSI-017** | System shall keep integration helpers free of slice-specific business rules and tenant data reads.                                                                                                       |
| **HRM-HSI-018** | System shall document integration lifecycle and helper promotion rules before helpers are added.                                                                                                         |
| **HRM-HSI-019** | System shall support future HR slice scaffolding by exposing stable integration contracts instead of duplicated boilerplate.                                                                             |
| **HRM-HSI-020** | System shall preserve the package public API: no public `@afenda/feature-hr-suite/hr-suite-integration` subpath is introduced.                                                                           |
| **HRM-HSI-021** | System shall validate the integration root shape through the HR vertical guard.                                                                                                                          |
| **HRM-HSI-022** | System shall validate architecture drift before new integration folders or public doors are added.                                                                                                       |
| **HRM-HSI-023** | System shall maintain a local as-built summary showing which integration requirements are shipped, partial, or future.                                                                                   |
| **HRM-HSI-024** | System shall prevent scaffold-only or placeholder integration files from being counted as shipped shared behavior.                                                                                       |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                               |
| --: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Integration root contains only the four TypeScript doors and this architecture document.                                                                          |
|   2 | The four integration doors are present and named `index.ts`, `client.ts`, `server.ts`, and `metadata.ts`.                                                         |
|   3 | Neutral exports can be imported without pulling server-only markers or client components.                                                                         |
|   4 | Client exports are browser-safe and do not import `@afenda/db`, `@afenda/auth/server`, `@afenda/kernel/server`, `server-only`, Node built-ins, or server actions. |
|   5 | Server exports are reachable only through the server door and inherit the server-only package marker from `packages/features/hr-suite/src/server.ts`.             |
|   6 | Metadata exports are safe for metadata registries and do not execute tenant I/O.                                                                                  |
|   7 | Only approved implementation folders are accepted under `hr-suite-integration`.                                                                                   |
|   8 | Deep imports into integration implementation folders from HR slices are flagged by the guard.                                                                     |
|   9 | Forbidden HR Suite root buckets are flagged by the guard.                                                                                                         |
|  10 | Shared list-window contracts are reusable without importing slice-specific code.                                                                                  |
|  11 | Shared permission descriptors match governed-surface `requiresErpPermission` object shape.                                                                        |
|  12 | Shared Pattern C helpers produce governed list configurations with bounded pagination metadata.                                                                   |
|  13 | Shared trailing-action helpers produce descriptors with valid state and intent values.                                                                            |
|  14 | Generic action-failure helpers return `ActionResult<T>` for both void and data-returning actions.                                                                 |
|  15 | Native form wrappers expose one-argument `FormData` actions when used directly in `<form action>`.                                                                |
|  16 | Integration helpers do not perform database writes, tenant reads, or slice-specific calculations.                                                                 |
|  17 | New reusable helper families are added only after repeated use across at least two HR slices or scaffold templates.                                               |
|  18 | Scaffolded HR slices consume integration contracts instead of copying repeated helper code.                                                                       |
|  19 | The package does not expose an `hr-suite-integration` public subpath in `package.json`.                                                                           |
|  20 | Guard, docs, and ARCH-010 stay aligned when the integration contract changes.                                                                                     |

---

## As-built summary (code-verified)

**Location:** `packages/features/hr-suite/src/hr-suite-integration/`  
**Public package API:** no public `hr-suite-integration` package subpath  
**Canonical parent:** ARCH-010

| Layer                    | Current files                                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neutral door             | `index.ts`                                                                                                                                                                         |
| Client door              | `client.ts`                                                                                                                                                                        |
| Server door              | `server.ts`                                                                                                                                                                        |
| Metadata door            | `metadata.ts`                                                                                                                                                                      |
| Client implementation    | `components/hr-suite-nav.component.client.tsx`                                                                                                                                     |
| Neutral contracts        | `contracts/hr-suite-module.contract.ts`, `contracts/hr-suite-pagination.contract.ts` (`buildHrListWindow`, `buildHrStaticListWindow`), `contracts/hr-suite-permission.contract.ts` |
| Metadata navigation      | `navigation/hr-suite-nav.contract.ts`                                                                                                                                              |
| Server policy            | `policies/hr-suite-access.policy.server.ts`                                                                                                                                        |
| Metadata surface helpers | `surface/hr-suite-list-surface.shared.ts` (`defineHrSuiteListSurfaceRegistry`, search-param reader, Pattern C list builder, trailing action descriptors)                           |
| Server action helpers    | `actions/hr-suite-action-result.shared.ts`                                                                                                                                         |

### Requirement shipment matrix

| Code        | Status                                                                                                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HRM-HSI-001 | **Shipped** - four TypeScript doors exist.                                                                                                                                                          |
| HRM-HSI-002 | **Shipped** - neutral contract exports live behind `index.ts`.                                                                                                                                      |
| HRM-HSI-003 | **Shipped** - client navigation component exports live behind `client.ts`.                                                                                                                          |
| HRM-HSI-004 | **Shipped** - server guard and action helper exports live behind the local `server.ts` door and are re-exported by package-level `src/server.ts`, which carries the `@afenda/kernel/server` marker. |
| HRM-HSI-005 | **Shipped** - navigation metadata and metadata-safe governed list helper exports live behind `metadata.ts`.                                                                                         |
| HRM-HSI-006 | **Shipped** - approved implementation folders are `actions`, `components`, `contracts`, `navigation`, `policies`, and `surface`; no other folder is accepted.                                       |
| HRM-HSI-007 | **Shipped** - guard checks deep integration imports from outside the integration directory.                                                                                                         |
| HRM-HSI-008 | **Shipped** - guard blocks forbidden HR Suite root buckets.                                                                                                                                         |
| HRM-HSI-009 | **Shipped** - `HrListWindow`, `clampHrPageSize`, and governed list-surface pagination output centralize bounded list windows.                                                                       |
| HRM-HSI-010 | **Shipped** - `defineHrSuiteErpPermission` and `defineHrSuiteReadPermission` centralize governed `requiresErpPermission` descriptors.                                                               |
| HRM-HSI-011 | **Shipped** - `buildHrSuiteOperationalListSurface` centralizes the repeated Pattern C list builder shape.                                                                                           |
| HRM-HSI-012 | **Shipped** - `buildHrSuiteListSearchToolbar` and search-param registry helpers are metadata-safe.                                                                                                  |
| HRM-HSI-013 | **Shipped** - `defineHrSuiteActionDescriptor` and `resolveHrSuiteListTrailingAction` emit governed renderer-compatible descriptors.                                                                 |
| HRM-HSI-014 | **Shipped** - `hrSuiteActionFailure` and `toHrSuiteActionFailure<T>` preserve data-returning `ActionResult<T>` types.                                                                               |
| HRM-HSI-015 | **Shipped** - `toHrSuiteResultFormAction` and `toHrSuiteNativeFormAction` provide one-argument native form wrappers.                                                                                |
| HRM-HSI-016 | **Shipped** - `buildHrModuleExecutionGuard`, `requireHrCapability`, and `requireHrCapabilities` centralize context and capability guard shape.                                                      |
| HRM-HSI-017 | **Shipped** - current integration files do not own slice business rules or tenant data queries.                                                                                                     |
| HRM-HSI-018 | **Shipped** - this architecture document defines promotion rules before helper expansion.                                                                                                           |
| HRM-HSI-019 | **Shipped** - stable permission, list, trailing action, action-result, and guard contracts are ready for future HR slice scaffold repair mode.                                                      |
| HRM-HSI-020 | **Shipped** - package exports do not expose an integration subpath.                                                                                                                                 |
| HRM-HSI-021 | **Shipped** - HR vertical guard validates integration root shape.                                                                                                                                   |
| HRM-HSI-022 | **Shipped** - ARCH-010 owns the change-control rule.                                                                                                                                                |
| HRM-HSI-023 | **Shipped** - this as-built summary records shipped, partial, and future requirements.                                                                                                              |
| HRM-HSI-024 | **Shipped** - scaffold-only integration behavior is not counted as shipped.                                                                                                                         |

### Verification

Run after integration contract changes:

```bash
pnpm exec tsx packages/features/hr-suite/scripts/check-hr-feature-vertical-naming.mts
pnpm typecheck:scripts
pnpm --filter @afenda/feature-hr-suite test -- tests/unit/hr-suite-integration-contract.test.ts
```

Run before declaring the HR package baseline clean:

```bash
pnpm --filter @afenda/feature-hr-suite typecheck
```
