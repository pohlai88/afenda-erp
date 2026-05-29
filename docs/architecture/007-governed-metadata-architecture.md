# ARCH-007 · Governed Metadata Architecture

**Doc ID:** `ARCH-007` · **File:** `007-governed-metadata-architecture.md`

| Field     | Value                                                                                        |
| --------- | -------------------------------------------------------------------------------------------- |
| Status    | Active — kernel shipped; builder adoption selective (May 2026)                               |
| Authority | Schemas, profiles, resolver, renderers, builder layering                                     |
| Related   | **ARCH-006** (runtime authority) · **ARCH-002** (feature extraction) · **ARCH-001** (deploy) |

**Canonical renderer home:** `packages/governed-surface/src/metadata/`  
**Import door:** `@afenda/governed-surface/metadata`  
**Schema / profile / resolver home:** `packages/governed-surface/src/`  
**Doctrine:** [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md) · [System Architecture](001-system-architecture.md) · [ERP Kernel Package Architecture](002-erp-kernel-package-architecture.md)

If this file disagrees with the metadata UI architecture, system architecture, or
ERP kernel package architecture docs, follow those documents and update this file
in the same change.

**Status:** Governed-surface kernel (schemas, profiles, resolver, builders,
renderers) is implemented. Module list builders currently live in
`packages/kernel/src/modules/list-surfaces.ts`. Nine `@afenda/feature-*` packages
exist yet. **Deferred:** `build-governed-chart-surface` until multiple modules
share chart chrome.

---

## 1. Prime directive

```txt
Metadata declares intent. Runtime owns authority. Renderers compose primitives. Domain owns truth.

Governed metadata must be profile-first.
Builders select profiles and declare domain semantics.
Builders must not repeat visual defaults.
Resolvers merge profile + presentation override only (no RBAC inside generic resolver).
Renderers paint resolved configuration only — no business guessing.
Pages assemble sections; they do not handcraft governed tables or KPI tiles.
```

Afenda is **not** a low-code platform. It is a **governed, server-first declarative UI** system: Zod-validated configuration envelopes, static 1:1 renderer dispatch, and pure server builders. The product shape is semantically closest to **JSON Schema + static renderers** (and admin frameworks like **react-admin** that separate _resource metadata_ from _presentation_), without a client-side JSON-to-JSX interpreter.

---

## 2. Two views of the same stack (do not confuse them)

The governed stack has **six layers**. They are described in two complementary ways:

### 2.1 Authoring model (design-time dependency)

Use this when deciding **where a change belongs** — layer ownership and upgrade propagation:

```txt
Schema → Profile → Resolver → Renderer → Builder → Runtime
         (contract) (DRY ERP patterns) (merge) (paint) (domain truth) (authority)
```

This is **not** request order. It answers: “If we improve exception tables globally, do we edit a profile, a renderer, or 120 builders?”

### 2.2 Execution flow (runtime request order)

Use this when wiring pages, debugging a single request, or onboarding engineers:

```txt
Runtime → Query → Builder → Profile resolver → Zod parse → Renderer → UI primitives
```

| Step                 | What happens                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime**          | Session, org, locale, ERP RBAC gates; thin `page.tsx` assembly                                                                              |
| **Query**            | Server-only fetches in `data/*.queries.server.ts`                                                                                           |
| **Builder**          | Selects `presentationProfile`; maps rows/columns/stats; sets `rowTone`, `rowHref`, `cellKind`, `actionId`, optional `presentation` override |
| **Profile resolver** | `resolveGovernedPresentation({ profile, presentation })` → final `presentation` object                                                      |
| **Zod parse**        | `migrateGovernedConfiguration` + `parse*Configuration` — schema is the contract authority                                                   |
| **Renderer**         | `GovernedComponentTree` → registry → `renderers/*.renderer.tsx`                                                                             |
| **UI**               | `@afenda/ui/*` primitives                                                                                                                   |

```mermaid
flowchart LR
  Runtime["Runtime\nsession + RBAC"]
  Query["Query\ndata/*.server.ts"]
  Builder["Builder\nprofile + domain truth"]
  Resolver["Resolver\nprofile + override"]
  Parse["Schema parse\nZod"]
  Renderer["Renderer\npackages/governed-surface/src/metadata"]
  UI["@afenda/ui"]

  Runtime --> Query
  Query --> Builder
  Builder --> Resolver
  Resolver --> Parse
  Parse --> Renderer
  Renderer --> UI
```

### 2.3 Canonical responsibility model (sealed)

```txt
Runtime   — session, org, permissions, data, actions
Query     — fetches domain data
Builder   — selects profile; maps domain data to governed metadata; rowTone, rowHref, cellKind, actionId
Profile   — reusable ERP visual defaults (six canonical ids)
Resolver  — merges profile + local presentation override only
Schema    — validates final metadata
Renderer  — paints only
```

**Not** “renderer before builder” in execution — renderer runs **after** the builder and resolver produce validated configuration.

### 2.5 Layer responsibility table

| Layer        | Location                                                                         | Owns                                                                                                  | Must not own                                                        |
| ------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Schema**   | `packages/governed-surface/src/schemas/`                                         | Allowed metadata contract, `dataNature`, stability, action descriptor shapes                          | Business decisions, fetching, permissions                           |
| **Profile**  | `packages/governed-surface/src/profiles/`                                        | Reusable ERP presentation defaults (table chrome, KPI grid density, toolbar affordances)              | Row-specific truth, tenant/session                                  |
| **Resolver** | `packages/governed-surface/src/resolvers/resolve-governed-presentation.ts`       | Merge `presentationProfile` defaults + local `presentation` override (deep-merge `toolbar` only)      | Visual painting, React, ERP RBAC, permission checks                 |
| **Renderer** | `packages/governed-surface/src/metadata/renderers/`                              | Paint from resolved config; container queries; skeleton parity                                        | Domain queries, IAM, guessing from labels                           |
| **Builder**  | `packages/kernel/src/modules/list-surfaces.ts` and related kernel metadata files | Columns, rows, `rowTone`, `rowHref`, `cellKind`, stat `href`, `trailingAction`, profile **selection** | Repeated `stickyHeader` / `virtualizeRowThreshold` on every surface |
| **Runtime**  | `apps/erp/src/app/**`, Server Actions, route handlers, auth helpers              | Session, org, ERP RBAC, audit, cache tags                                                             | Ad-hoc table markup, viewport breakpoints inside renderers          |

### 2.4 Upgrade decision rule

| Future change                                | Put it where                                                  |
| -------------------------------------------- | ------------------------------------------------------------- |
| All ERP tables should look better            | **Profile** and/or **renderer**                               |
| All exception tables gain export + density   | `erp-exception-table` **profile**                             |
| All KPI cards gain hierarchy / motion policy | `erp-kpi-grid` **profile** + stat **renderer**                |
| FRM critical rows highlighted                | **FRM builder** (`rowTone`)                                   |
| Payroll export needs specific `actionId`     | **Payroll builder** + **runtime** permission gate             |
| All `datetime` cells formatted consistently  | **Renderer** (`list-surface-cell`)                            |
| One mobile capture card                      | **Bespoke island** (Pattern A) — outside governed list kernel |

---

## 3. What lives in `packages/governed-surface/src/metadata/` (this tree)

This directory is the **renderer kernel only**. It does not own Zod schemas, presentation profiles, or kernel builders.

| Path                                                                                                                          | Role                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`registry.ts`](../../packages/governed-surface/src/metadata/registry.ts)                                                     | `type` -> renderer id; `AFENDA_GOVERNED_RENDERER_CONTRACTS` (`dataNature`, maturity) |
| [`render-governed-component.tsx`](../../packages/governed-surface/src/metadata/render-governed-component.tsx)                 | Public entry: `GovernedComponentRenderer`                                            |
| [`governed-component-tree.tsx`](../../packages/governed-surface/src/metadata/governed-component-tree.tsx)                     | Parse envelope, registry dispatch, `dataNature` pre-flight                           |
| [`governed-renderer-dispatch.tsx`](../../packages/governed-surface/src/metadata/governed-renderer-dispatch.tsx)               | `renderGovernedRendererById` switch                                                  |
| [`governed-component-skeleton.tsx`](../../packages/governed-surface/src/metadata/governed-component-skeleton.tsx)             | Loading shapes per renderer id                                                       |
| [`renderers/`](../../packages/governed-surface/src/metadata/renderers/)                                                       | One shipped renderer per id (`*.renderer.tsx` + `*.client.tsx` islands)              |
| [`list-surface-with-trailing-column.tsx`](../../packages/governed-surface/src/metadata/list-surface-with-trailing-column.tsx) | Pattern C portal: table + trailing column (not for feature deep-import)              |

**Import allowlist** (enforced by `pnpm lint:governed-renderers` on `renderers/**`):

- `@afenda/ui/*`
- `@afenda/governed-surface` (schemas, parse helpers — not feature ERP barrels)
- `@afenda/ui/utils`
- `react`, `lucide-react`

**Forbidden in renderers:** app-shell imports, `@afenda/feature-*` module barrels, `react-jsx-parser`, runtime JSON-to-JSX, tenant/session in configuration.

### 3.1 Render pipeline (today)

```txt
GovernedComponentRenderer(props)
  → GovernedComponentTree
      → parseGovernedComponentData (envelope)
      → renderGovernedRendererById
          → e.g. ListSurfaceRenderer
              → prepareGovernedConfigurationForParse (migrateGovernedConfiguration)
              → parseListSurfaceRendererConfiguration (Zod + presentationProfile transform)
              → ListSurfaceTable → list-surface-table.client.tsx
      → AFENDA_GOVERNED_RENDERER_CONTRACTS[dataNature] check (tree pre-flight)
```

**Diagnostics:** `diagnostics: "user" | "operator"` — production stays generic; dev/gallery may use `operator`.

### 3.2 Renderer rules

1. **Container queries** — outermost `@container`; inner layout uses `@sm:` / `@md:` — **no viewport** `sm:`/`md:`/`lg:` for grids inside renderers.
2. **`dataNature`** — enforced per renderer in registry; builders must declare matching nature.
3. **Leaf tiles** — `@afenda/ui/*` (`Card`, `Table`, `Badge`, `Empty`, `Skeleton`) — no raw `<div>` tile geometry.
4. **Paint only** — renderers read **resolved** fields; they do not infer domain meaning:

```ts
// Forbidden in renderers
if (title.includes("Exception")) rowTone = "critical";

// Required
if (row.rowTone === "critical") applyCriticalRowClass();
```

---

## 4. What lives in `packages/governed-surface/src/` (contract + profiles)

### 4.1 Schema layer (shipped)

**Door:** `@afenda/governed-surface` (server) · `@afenda/governed-surface/client` (client-safe)

Authoritative modules today:

| Schema                | File                                                                                                                                                                                                         | Notes                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| List surface          | [`schemas/list-surface-renderer.schema.ts`](../../packages/governed-surface/src/schemas/list-surface-renderer.schema.ts)                                                                                     | `presentation`, `columns`, `rows`, `rowTone`, `rowHref`, `pagination`, responsive `narrowMode`, `primaryColumnId`     |
| List toolbar          | [`schemas/list-surface-toolbar.schema.ts`](../../packages/governed-surface/src/schemas/list-surface-toolbar.schema.ts)                                                                                       | `search`, `filters`, `sort`, `savedView`, `bulkActions`, `export`, `densityToggle`, `columnPicker`                    |
| Stat card             | [`schemas/stat-card.schema.ts`](../../packages/governed-surface/src/schemas/stat-card.schema.ts)                                                                                                             | `href`, `comparison`, `sparkPoints`, `progress`, `density`, `dataNature`                                              |
| Chart                 | [`schemas/chart.schema.ts`](../../packages/governed-surface/src/schemas/chart.schema.ts)                                                                                                                     | `heatmap`, `stacked-bar`, `combo`, brush intent, `actions`, `annotations`, `referenceBands`, `drilldownHref`, `empty` |
| Approval timeline     | [`schemas/approval-timeline.schema.ts`](../../packages/governed-surface/src/schemas/approval-timeline.schema.ts)                                                                                             | compact density, step `href`, `durationLabel`, `metadataChips`                                                        |
| Audit / kanban polish | [`schemas/audit-panel.schema.ts`](../../packages/governed-surface/src/schemas/audit-panel.schema.ts), [`schemas/kanban-board.schema.ts`](../../packages/governed-surface/src/schemas/kanban-board.schema.ts) | actor/status hierarchy, evidence links, card `href`, metadata chips, non-color-only tone cues                         |
| Envelope              | [`schemas/component.schema.ts`](../../packages/governed-surface/src/schemas/component.schema.ts)                                                                                                             | `{ type, serverType, configuration }`                                                                                 |

**Presentation today** (list) — optional object on each builder config:

```ts
presentation?: {
  variant?: "full" | "table-only"
  tableDensity?: "compact" | "comfortable"
  narrowMode?: "table" | "cards" | "auto"
  primaryColumnId?: string
  stickyHeader?: boolean
  virtualizeRowThreshold?: number
  toolbar?: ListSurfaceToolbar
}
```

**Shipped:** optional `presentationProfile` on list/stat configuration input; Zod parse strips profile and merges into `presentation` / `density`. Legacy builders with inline `presentation` only remain valid.

### 4.2 Profile layer (shipped)

**Purpose:** DRY enterprise ERP visual patterns. Change a profile once → every surface that selects it improves.

**Paths:**

```txt
packages/governed-surface/src/
  profiles/
    governed-presentation-profiles.ts   # GOVERNED_LIST_PRESENTATION_PROFILES, GOVERNED_STAT_PRESENTATION_PROFILES
    governed-profile-types.ts
  schemas/
    presentation-profile.schema.ts      # governed profile ids
```

#### Canonical profile set (six — do not proliferate)

| Profile id              | Use when                                            | Resolves to (conceptually)                                                                                                   |
| ----------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `erp-operational-table` | Standard read-only operational directories          | `table-only`, compact, sticky header, virtualize @ 100, column picker + density                                              |
| `erp-exception-table`   | Exception / inbox / queue surfaces                  | Above + export toolbar slot defaults (builder still supplies `actionId`)                                                     |
| `erp-analytical-table`  | Dense comparison lists in ≥3 unrelated ERP surfaces | Operational table defaults + responsive cards, selection, Decision Ledger affordance; builders supply grouping/summary truth |
| `erp-audit-ledger`      | Audit / history / traceability lists                | Sticky + virtualize + export affordance; `document-lines` nature where applicable                                            |
| `erp-kpi-grid`          | Workbench KPI bands (operational metrics)           | Compact stat density; KPI-friendly layout policy                                                                             |
| `erp-executive-summary` | Low-density snapshot KPI strips                     | Comfortable density; `snapshot-summary` nature                                                                               |

**Profile budget rule (hard):**

```txt
Ship exactly six profile ids. The sixth (`erp-analytical-table`) is justified by TCI exceptions, AAT high-risk absence records, and compliance evidence/register review.
Add another profile only when three or more unrelated modules need the same presentation pattern.
Do not create 30 profiles — that becomes a hidden low-code layout designer.
```

#### Profile contract rule (hard)

Profiles are **not** a second metadata system. They are a const map into schema-approved fields only.

```txt
Profiles may only resolve to fields already defined on listSurfacePresentationSchema,
stat-card configuration, and related toolbar schemas.
Profiles must not introduce keys renderers do not understand.
Profiles must not encode row-level truth (rowTone, rowHref, trailingAction stay on builders).
Profiles must not call requireErpPermission or strip actions — that is runtime/builder authority.
```

Implement profiles as typed partials validated against existing Zod types (or resolved then parsed), not as free-form JSON.

#### Profile naming governance (hard)

Names are **stable enterprise contracts**, not marketing or module labels.

| Allowed                 | Forbidden                                         |
| ----------------------- | ------------------------------------------------- |
| `erp-operational-table` | `frm-premium-table`, `f500-table`, `modern-table` |
| `erp-exception-table`   | `nice-overview`, `v2-table`, `temp-inbox`         |
| `erp-analytical-table`  | `sap-copy`, `retool-table`, `tableau-lite`        |
| `erp-kpi-grid`          | Module-specific visual nicknames                  |

Pattern: `erp-<surface-kind>-<shape>` — boring, searchable, permanent.

### 4.3 Resolver layer (shipped)

**Purpose:** Boring merge of profile defaults + builder `presentation` override. Used by `buildGovernedListSurface` / `buildGovernedStatGrid` and by Zod parse transforms on list/stat schemas.

```ts
// Target API (illustrative)
resolveGovernedPresentation({
  profile: "erp-exception-table",
  presentation: builderOverride, // optional partial
});
// → ListSurfacePresentation (final)
```

**Resolver rules (hard — keep it pure):**

```txt
profile defaults + presentation override = final presentation
Deep-merge toolbar sub-objects; override wins per key.
No ERP RBAC inside the generic resolver (defer module-specific action resolvers).
No inventing keys — unknown fields fail at Zod parse.
```

**Authority stays in runtime/builder** — resolver receives the shape the builder already decided:

```ts
// Builder after runtime permission check — correct
presentation: {
  toolbar: canExport
    ? {
        export: {
          actionId: "hr.records.export",
          label: copy.exportLabel,
          formats: ["csv"],
        },
      }
    : undefined,
},
```

Do **not** teach `resolveGovernedPresentation` to call `requireErpPermission` or to null out exports by permission matrix. That couples the generic kernel to ERP RBAC and makes testing harder.

**Deferred (explicit):** `resolve-governed-list-actions.ts` or permission-aware resolvers — only if a repeated cross-module pattern emerges; not in v1.

### 4.4 Section primitives (shipped — composition, not renderers)

Pattern wiring lives in governed-surface, not in `packages/governed-surface/src/metadata/`:

| Pattern | Primitive                                                   | Renderer entry                                    |
| ------- | ----------------------------------------------------------- | ------------------------------------------------- |
| **B**   | Manual `Card` + `GovernedComponentRenderer`                 | `@afenda/governed-surface/metadata`               |
| **C**   | `GovernedPatternCListSection`                               | Internal list path + `GovernedTrailingActionSlot` |
| **K**   | `GovernedKanbanFooterSection` / `GovernedKanbanDragSection` | `governed:kanban-board` + client bridge           |

Composition rules are summarized in [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md).

### 4.5 Builder helpers (shipped)

Thin factories reduce boilerplate while keeping builders declarative:

```txt
packages/governed-surface/src/builders/
  build-governed-list-surface.ts      # profile + columns + rows → merged presentation
  build-governed-stat-grid.ts         # profile + stats → merged density
```

**Public door:** `@afenda/governed-surface` exports `buildGovernedListSurface`, `buildGovernedStatGrid`, `resolveGovernedListPresentation`, `GOVERNED_LIST_PRESENTATION_PROFILES`.

Feature modules keep **domain mapping** in `packages/kernel/src/modules/list-surfaces.ts` and related kernel metadata files; helpers stay generic.

---

## 5. Builder layer — domain truth only

**Location:** `packages/kernel/src/modules/list-surfaces.ts` and related `packages/kernel/src/*metadata.ts` files (server-owned domain mapping).

### 5.1 Correct builder style (target)

```ts
return buildGovernedListSurface({
  surfaceKey: "hr:records",
  presentationProfile: "erp-operational-table",
  dataNature: "table",

  columns: [
    { id: "title", header: copy.colTitle },
    {
      id: "updatedAt",
      header: copy.colUpdated,
      cellKind: { kind: "datetime" },
    },
    { id: "status", header: copy.colStatus, cellKind: { kind: "badge" } },
  ],

  rows: records.map((row) => ({
    id: row.id,
    rowHref: `/hr/records/${row.id}`,
    cells: {
      title: row.title,
      updatedAt: row.updatedAt,
      status: row.status,
    },
    trailingAction: resolveListSurfaceRowTrailingAction(/* ... */),
  })),

  presentation: {
    toolbar: canExport
      ? {
          export: {
            actionId: "hr.records.export",
            label: "...",
            formats: ["csv"],
          },
        }
      : undefined,
  },
});
```

**Builder declares:**

- Which **profile** (ERP pattern)
- **Columns** and **cellKind**
- **Rows** and per-row **tone**, **href**, **trailingAction**
- Stat item **href**, **tone**, **comparison** (domain-derived)
- Optional **presentation** overrides

**Builder does not declare** (profile owns):

- `stickyHeader: true` on every table
- `virtualizeRowThreshold: 100` copy-paste
- Default `tableDensity: "compact"` repetition

### 5.2 Anti-pattern (transitional — migrate away)

```ts
// Legacy inline presentation blocks — migrate to profile-first builders
const PRESENTATION = {
  variant: "table-only",
  tableDensity: "compact",
};
```

Current references for profile-first builders:

| Pattern                  | Current reference                                                    |
| ------------------------ | -------------------------------------------------------------------- |
| List profile selection   | `packages/kernel/src/modules/list-surfaces.ts`                       |
| Record route templates   | `packages/kernel/src/modules/record-types.ts`                        |
| App route section wiring | `apps/erp/src/app/(app)/module-screen.tsx`                           |
| Dashboard wiring         | `apps/erp/src/app/(app)/dashboard-route.tsx`                         |
| Lynx console wiring  | `apps/erp/src/app/(app)/lynx/lynx-console-route.tsx` |

### 5.3 Record drill-down (canonical)

**Door:** `packages/kernel/src/modules/record-types.ts` owns route templates and permissions. `packages/kernel/src/modules/list-surfaces.ts` maps records and work items into governed row metadata.

| Case                        | Builder pattern                                                                     | Renderer behavior                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Record detail exists**    | `rowHref` from the record type `rowHrefTemplate`                                    | Row becomes navigable; `linkColumnId` selects which cell is treated as the primary link      |
| **Work item detail exists** | `rowHref` points to `/[moduleId]/work-items/[workItemId]`                           | Work-item row re-checks module-scoped auth on the detail route                               |
| **Column-specific link**    | `cellKinds: { [columnId]: { kind: "link", href } }`                                 | Uses the cell-level `href`; avoid row-level links when two cells need different destinations |
| **No stable route**         | Omit `rowHref` and trailing navigation actions                                      | Renderer paints read-only data                                                               |
| **Invalid extension data**  | Keep row visible with attention tone and decision-ledger evidence from domain parse | Renderer never interprets arbitrary JSONB as navigation metadata                             |

**Section contract:** app routes pass server-shaped workspace state into governed sections. Domain builders derive links from route templates and record IDs, while detail routes re-check capability before reading protected rows.

**Current route shape:** `apps/erp/src/app/(app)/[moduleId]/records/[recordId]/page.tsx` and `apps/erp/src/app/(app)/[moduleId]/work-items/[workItemId]/page.tsx`.

**Verification:** `pnpm --filter @afenda/kernel test` and `pnpm --filter @afenda/erp typecheck`.

### 5.4 Workbench `?focus=` search (exception / pending inboxes)

**Kernel:** `packages/governed-surface/src/builders/governed-list-toolbar.shared.ts`

| Piece   | Responsibility                                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------- |
| Route   | `searchParamFirst(resolvedSearchParams, "focus")` on `page.tsx` → `workbenchFocus` prop                                 |
| Section | `matchesGovernedWorkbenchFocus(focus, …haystacks)` filters rows **before** builder                                      |
| Builder | `presentationProfile: "erp-exception-table"` + `governedWorkbenchFocusPresentationPatch({ label, placeholder, value })` |
| Client  | `ListSurfaceToolbarClient` syncs `GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS.focus` on the URL                                |

**Do not** filter unrelated streams with exception-row haystacks. Bulk toolbars
and trailing `context` must use the **same filtered row set** as the list
configuration.

**Reference implementation:** `packages/governed-surface/src/builders/governed-list-toolbar.shared.ts` and `matchesGovernedWorkbenchFocus`.

---

## 6. Runtime layer

**Vercel deploy:** single root project, `pnpm turbo build --filter=@afenda/erp`,
`cacheComponents: true`, cron Bearer auth — see **ARCH-001**. Project link deferred.

**Location:** `apps/erp/src/app/**`, layouts, Server Actions, and Route Handlers.

```txt
page.tsx
  → await params (+ searchParams when used)
  → resolve server session / organization context
  → Promise.all(queries + translations + permission probes)
  → app RSC sections (pass server-shaped workspace state and access flags)
  → GovernedComponentRenderer | GovernedPatternCListSection
```

Runtime owns:

- **Who** can see the surface (layout gates)
- **What data** exists (queries)
- **Which actions** are allowed (ERP RBAC → builder omits or disables `trailingAction` / toolbar.export)
- **Audit** `actionId` strings on export and mutations

Renderers, profiles, and the **generic resolver** never call `requireErpPermission`. The **builder** (after runtime gates) omits or supplies `toolbar.export`, `trailingAction`, and row actions — then the resolver only merges presentation shape.

**Rules:** follow the App Router runtime rules in [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md) and Vercel React best practices for async waterfalls and RSC serialization.

### 6.1 Next.js App Router contract (governed ERP pages)

| Concern                | Do                                                                                                     | Do not                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **Page thickness**     | `page.tsx` ≤ guards + `Promise.all` + section composition                                              | Domain queries, Zod, builder maps, or table markup in `app/`                             |
| **Async request APIs** | `await params`, `await searchParams`, `await cookies()` in pages/layouts/actions                       | Sync access to dynamic segment props                                                     |
| **Data fetching**      | Parallelize independent server reads: `Promise.all([listQuery(), resolveCapability()])`                | Sequential awaits when queries do not depend on each other                               |
| **Initial list truth** | Builder runs in RSC section or domain service; pass **configuration** to `GovernedPatternCListSection` | `useEffect` + `useState` copying server rows; TanStack Query for first paint             |
| **Client import door** | `GovernedTrailingActionSlot`, kanban bridges from `@afenda/governed-surface/client`                    | `@afenda/governed-surface` index from `"use client"` when index re-exports server graphs |
| **Pattern C boundary** | `trailingColumn.cellId` + registered **Client Component** `Cell`                                       | `trailingColumn.render` (functions are not serializable across RSC → client)             |
| **Row links**          | `rowHref` from record-type templates such as `/${moduleId}/records/:recordId`                          | Hard-coded module paths that bypass `ModuleId` contracts                                 |
| **Tenant authority**   | `organizationId` from `@afenda/auth/server` session helpers only                                       | `organizationId` from `FormData`, query strings, or client props                         |
| **Mutations**          | Server Actions + `revalidatePath` on affected module routes                                            | Route handlers for internal ERP list mutations                                           |
| **Loading**            | Route `loading.tsx` + section `loadError` / renderer empty states                                      | Client-only spinners that hide missing server empty handling                             |

**Thin page recipe:**

```ts
export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ moduleId: string }>
  searchParams?: Promise<ModuleWorkspaceSearchParams>
}) {
  const { moduleId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  return (
    <ModuleRoutePage
      moduleId={resolveModuleId(moduleId)}
      searchParams={resolvedSearchParams}
    />
  )
}
```

**Section recipe:** app routes pass server-shaped workspace state into governed
sections. Domain builders derive links from route templates and record IDs;
detail routes re-check capability before reading protected rows.

### 6.2 Vercel React performance (governed surfaces)

Prioritized rules from [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) mapped to this stack:

| Priority     | Rule                               | Afenda application                                                                                                                                                                                                 |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CRITICAL** | `async-parallel`                   | Page and RSC section: batch queries + i18n + permission probes in one `Promise.all`                                                                                                                                |
| **CRITICAL** | `bundle-barrel-imports`            | Builders import module-relative `.shared` files or explicit feature subpaths such as `@afenda/feature-hr-suite/metadata` — not broad feature package barrels that pull server-only graphs into accidental client bundles |
| **HIGH**     | `server-serialization`             | Pass `ListSurfaceRendererConfigurationInput` (or builder output) to client bridges — not raw Drizzle rows + re-map on the client                                                                                   |
| **MEDIUM**   | `rerender-derived-state-no-effect` | Row selection, filters, and trailing dialog state stay local; do not mirror server `rows` into client state after hydration                                                                                        |
| **MEDIUM**   | `bundle-dynamic-import`            | Heavy kanban/chart client bridges behind `next/dynamic` when a section is below the fold or tab-gated                                                                                                              |
| **MEDIUM**   | `rerender-memo`                    | Expensive trailing cells: keep as focused client islands; avoid re-rendering the full table when one dialog opens                                                                                                  |

**Cache Components (Next.js 16 + Vercel):** `cacheComponents: true` is enabled in
`createAfendaNextConfig`. Use `'use cache: remote'` + `cacheLife` / `cacheTag` only
on **non-tenant** or explicitly tagged read models; governed ERP list windows stay
server-fresh per request unless a module ADR defines safe shared tags. After Server
Actions that mutate list-affecting data, prefer `updateTag` / `revalidateTag` over
client-side refetch loops ([Runtime Cache](https://vercel.com/docs/caching/runtime-cache)).

**Anti-patterns (block merge on review):**

```txt
Waterfall: await getSession(); await listA(); await listB() when B does not need A
Client island owns initial ERP list rows (useQuery seed from empty → fetch duplicates RSC)
Passing trailingColumn.render or Server Action arrays inside metadata configuration
Importing broad @afenda/feature-* barrels from *.client.tsx when index.ts exports server sections
```

---

## 7. Disk truth vs target (2026-05)

| Capability                                           | Status                          | Where                                                                                                                                                      |
| ---------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod schemas + `dataNature`                           | **Shipped**                     | `packages/governed-surface/src/schemas/`                                                                                                                   |
| TanStack list + virtual rows + toolbar               | **Shipped**                     | `packages/governed-surface/src/metadata/renderers/list-surface-*`                                                                                          |
| Stat href / comparison / sparkline / progress        | **Shipped** (schema + renderer) | Adoption uneven in builders                                                                                                                                |
| Chart heatmap                                        | **Shipped**                     | `chart-heatmap-body.client.tsx`                                                                                                                            |
| Presentation profiles (six ids)                      | **Shipped**                     | `profiles/governed-presentation-profiles.ts`                                                                                                               |
| `resolveGovernedListPresentation` / stat density     | **Shipped**                     | `resolvers/resolve-governed-presentation.ts`                                                                                                               |
| `presentationProfile` on list/stat parse             | **Shipped**                     | `list-surface-renderer.schema.ts`, `stat-card.schema.ts`                                                                                                   |
| `buildGovernedListSurface` / `buildGovernedStatGrid` | **Shipped**                     | `builders/`                                                                                                                                                |
| Builders profile-first                               | **In progress**                 | Core ERP workspace lists in `packages/kernel/src/modules/list-surfaces.ts` use `buildGovernedListSurface`; feature-package builders move out on extraction |

**Platform maturity:** kernel CI and registry coverage are implemented through package tests and `pnpm architecture:check`.  
**Enterprise presentation:** renderer capability is strong; remaining gaps are selective builder adoption and route-level visual QA.

**Important correction:** Enterprise renderer **capabilities** are largely shipped; the product still looks plain when builders emit **minimal** `presentation` and omit `href` / `rowTone` / `toolbar`. Profile-first architecture fixes the **DRY** problem; builders still supply **domain truth** profiles cannot guess.

---

## 8. Recommended file structure (target)

```txt
packages/governed-surface/src/
  schemas/
    list-surface-renderer.schema.ts      # + presentationProfile optional field
    stat-card.schema.ts
    chart.schema.ts
    presentation-profile.schema.ts       # enum of profile ids
  profiles/
    governed-presentation-profiles.ts    # GOVERNED_PRESENTATION_PROFILES
    governed-profile-types.ts
  resolvers/
    resolve-governed-presentation.ts       # profile + override merge only (v1)
  builders/
    build-governed-list-surface.ts
    build-governed-stat-grid.ts
    build-governed-chart-surface.ts
  components/                            # Pattern A/B/C/K section primitives (shipped)
  data/                                  # trailing action resolve (shipped)
  index.ts · client.ts · server.ts

packages/governed-surface/src/metadata/
  registry.ts
  render-governed-component.tsx
  governed-component-tree.tsx
  renderers/
    list-surface.renderer.tsx
    stat-card.renderer.tsx
    chart.renderer.tsx
    ...

packages/kernel/src/
  module-list-surfaces.ts                # domain truth + profile id only
  record-type-definitions.ts             # route templates, columns, permissions

apps/erp/src/app/(app)/[moduleId]/
  page.tsx                               # thin assembly only
  records/[recordId]/page.tsx            # protected detail route
  work-items/[workItemId]/page.tsx       # protected work-item detail route
```

---

## 9. Propagation model

```txt
Profile / renderer upgrade
  → every route whose builder selects that profile OR relies on renderer defaults for existing cellKinds

New schema field (e.g. sparkPoints)
  → requires one builder/data pass per surface that should show sparklines

Bespoke Pattern A island (forms, mobile capture)
  → does not auto-upgrade; intentional exclusion from the governed list/stat kernel
```

**Profile-first** means future table chrome upgrades should not require touching
every module builder. When `@afenda/feature-*` packages exist, module builders
move out of `@afenda/kernel` per
[ERP Kernel Package Architecture](002-erp-kernel-package-architecture.md).

---

## 10. Verification and governance

| When you touch…                                       | Run                                                                               |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `packages/governed-surface/src/metadata/renderers/**` | `pnpm lint:governed-renderers` and `pnpm --filter @afenda/governed-surface test`  |
| `packages/governed-surface/src/schemas/**`            | `pnpm --filter @afenda/governed-surface test` and `pnpm typecheck`                |
| Kernel builders or record metadata                    | `pnpm --filter @afenda/kernel test` and `pnpm --filter @afenda/erp typecheck`     |
| App route behavior                                    | `pnpm --filter @afenda/erp typecheck` and `pnpm test:e2e` when navigation changes |
| Architecture or docs                                  | `pnpm architecture:check` and targeted Prettier checks on edited docs             |

Renderer gallery routes are deferred unless a concrete `apps/erp/src/app` route exists.

---

## 11. Handcrafted exclusions (permanent)

Do not force governed metadata on:

- Route-specific landing clear bars, truth maps, or attention strips
- Route-specific queue or triage handcrafted cards
- Bespoke workflow islands that need a different interaction model than list/stat kernels
- Mobile one-off capture panels or calendar views that are not list surfaces

Lists on the **same page** as those islands should still use Pattern B/C where applicable.

---

## 12. Implementation roadmap (ordered)

| Phase                       | Status          | Deliverable                                                                                                        |
| --------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------ |
| **1 — Contract**            | **Done**        | `presentationProfile?` on list/stat input; parse strips profile after merge                                        |
| **2 — Profiles**            | **Done**        | `GOVERNED_LIST_PRESENTATION_PROFILES`, `GOVERNED_STAT_PRESENTATION_PROFILES`                                       |
| **3 — Resolver**            | **Done**        | `resolve-governed-presentation.ts` (pure merge, no RBAC)                                                           |
| **4 — Builder helpers**     | **Done**        | `buildGovernedListSurface`, `buildGovernedStatGrid`                                                                |
| **5 — ERP workspace lists** | **Done**        | `packages/kernel/src/modules/list-surfaces.ts` builds module record and work-item lists with profile-first helpers |
| **6 — Stat adoption**       | **Done**        | Module, dashboard, and Lynx console routes use `buildGovernedStatGrid` via `GovernedPatternBStatSection`       |
| **7 — Feature extraction**  | **Not started** | Move module builders and services into `@afenda/feature-*` when modules mature — see erp-domain architecture       |

### After kernel ship

| Work                  | When                                                                               |
| --------------------- | ---------------------------------------------------------------------------------- |
| **Renderer** tweaks   | Only if merged presentation exposes a gap (e.g. global `datetime` cell formatting) |
| **Module builders**   | Extract to feature packages by moduleId; keep generic helpers in governed-surface  |
| **Architecture docs** | Keep this document aligned with metadata-driven UI and erp-domain architecture     |
| **New profile id**    | Only when multiple modules share a pattern not covered by the six shipped profiles |

---

## 15. Quality evaluation & gaps closed (2026-05)

Use **two scores** — do not conflate platform CI maturity with operator presentation.

| Rubric                          | Status             | Current source of truth                                      |
| ------------------------------- | ------------------ | ------------------------------------------------------------ |
| Kernel maturity                 | Shipped            | package tests and `pnpm architecture:check`                  |
| Enterprise presentation         | Strong, selective  | renderer capability shipped; builder adoption remains uneven |
| Architecture design             | Stable             | this document + metadata UI architecture                     |
| Architecture as-built alignment | Guarded and active | `scripts/check-directory-architecture.mts`                   |

### Gap register (architecture → codebase)

| Gap (evaluation)                                                   | Resolution                                                                                                                                               |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profiles/resolver not on disk                                      | **Closed** — §4.2–4.5, `tests/unit/governed-surface/resolve-governed-presentation.test.ts`                                                               |
| Builders repeat `PRESENTATION`                                     | **Closed** — Phase 7 profile-first sweep                                                                                                                 |
| Parse path did not merge profiles                                  | **Closed** — Zod transform on list/stat schemas                                                                                                          |
| SAP/Salesforce/Retool analytical table gap                         | **Closed (kernel)** — `erp-analytical-table`, selection, grouping, summary footer, column ergonomics, filter chips, and Decision Ledger renderer support |
| Gallery missing stat affordance scenarios                          | **Closed** — `GALLERY_STAT_CARD_AFFORDANCES` + `stat-card-affordances` gallery scenario                                                                  |
| Maturity doc stale enterprise baseline                             | **Closed** — footnote points to enterprise scorecard (~8.3)                                                                                              |
| `build-governed-chart-surface`                                     | **Deferred** — chart profiles only when ≥3 modules share chart chrome                                                                                    |
| `migrateGovernedConfiguration` not on parse path                   | **Closed** — `prepareGovernedConfigurationForParse` in list/stat `parse*`                                                                                |
| Residual inline `presentation: { variant: "table-only" }` builders | **Open** — migrate remaining inline presentation blocks to profile-first helpers as modules are touched                                                  |

### Kernel completeness (Afenda ERP)

| Layer                                                | On disk                                                  | Notes                                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Four list profiles + two stat profiles               | `governed-presentation-profiles.ts`                      | `erp-analytical-table` covers dense comparison lists; export `actionId` stays a builder override |
| `resolveGovernedPresentation`                        | `resolve-governed-presentation.ts` + unit tests          | Pure merge only                                                                                  |
| `buildGovernedListSurface` / `buildGovernedStatGrid` | `builders/*.ts`                                          | Used by domain module list builders                                                              |
| Zod `presentationProfile` transform                  | `list-surface-renderer.schema.ts`, `stat-card.schema.ts` | Parse-time profile merge                                                                         |
| Parse-time schema migration                          | `prepareGovernedConfigurationForParse`                   | List + stat paths                                                                                |
| Registry + shipped renderers                         | `registry.ts`, `renderers/**`                            | Production ERP list/stat/chart/kanban renderers                                                  |
| ERP list builders on profiles                        | `packages/kernel/src/modules/list-surfaces.ts`           | Six `buildGovernedListSurface` call sites for module workspace lists                             |
| Chart builder helper                                 | Not created                                              | **Deferred** until multiple modules share chart chrome                                           |
| Feature-package builders                             | Not created                                              | **Deferred** until first `@afenda/feature-*` extraction                                          |

**Pattern C trailing column (RSC):** Server sections must pass a **Client Component** as `trailingColumn.Cell` (or `cellId: "governed.metadata"`) — never `trailingColumn.render` (functions are not serializable). See `governed-pattern-c-trailing-column.shared.ts` and `governed-list-trailing-cell-registry.client.ts`. Full runtime rules: **§6.1–6.2**.

**Runtime audit:** use a local Next.js dev server (`pnpm dev`) for browser verification when route behavior changes; static verification uses package tests and typecheck.

### Builder migration checklist (per module)

1. Replace `const PRESENTATION = { variant: "table-only", … }` with `buildGovernedListSurface({ presentationProfile: "erp-operational-table" | "erp-exception-table" | "erp-analytical-table" | "erp-audit-ledger", … })`.
2. Exception/inbox lists: `erp-exception-table`; dense comparison/evidence review lists: `erp-analytical-table`; add `presentation.toolbar.export` override only when runtime allows export (real `actionId`).
3. KPI bands: `buildGovernedStatGrid({ presentationProfile: "erp-kpi-grid", dataNature: "kpi", … })` + per-stat `href` / `comparison` (domain).
4. Snapshot strips: `erp-executive-summary`.
5. Keep **domain-only** on rows: `rowTone`, `rowHref` / `cellKinds` link `href`, `cellKind`, `trailingAction`.
6. Record drill-down: follow **§5.3** (`rowHref` from record-type templates).
7. Runtime: **§6.1** (`Promise.all`, serializable Pattern C `Cell`, module-scoped hrefs).
8. Run `pnpm --filter @afenda/kernel test` and `pnpm --filter @afenda/erp typecheck`.

---

## 13. Related documents

| Document                                                                  | Topic                                                |
| ------------------------------------------------------------------------- | ---------------------------------------------------- |
| [ERP Kernel Package Architecture](002-erp-kernel-package-architecture.md) | Feature-package builder ownership and import doors   |
| [System Architecture](001-system-architecture.md)                         | Product-wide runtime, deployment, data, and AI       |
| [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md) | Runtime authority and metadata contracts             |
| [Directory Architecture Audit](003-directory-architecture-audit.md)       | Monorepo boundaries and architecture guards          |
| [Naming Conventions](004-naming-conventions.md)                           | Directory, file, component, and documentation naming |

---

## 14. Summary

**Authoring model (where to edit):**

```txt
Schema → Profile → Resolver → Renderer → Builder → Runtime
```

**Execution flow (one request):**

```txt
Runtime → Query → Builder → Profile resolver → Zod parse → Renderer
```

**Sealed responsibilities:**

```txt
Runtime   = session, org, permissions, data, actions
Query     = domain fetches
Builder   = profile selection + domain truth (rows, tones, hrefs, actionIds)
Profile   = six canonical ERP visual defaults (grow only with ≥3-module repetition)
Resolver  = profile + presentation override merge only (no RBAC)
Schema    = validates final metadata
Renderer  = paint only (packages/governed-surface/src/metadata)
```

**`packages/governed-surface/src/metadata/`** is the **paint layer** — last in the execution chain, not first in design discussions.

Fortune 500 operator quality needs **profiles + builders + existing renderers**: renderers cannot guess business semantics; builders must not repeat visual defaults. **Profile-first governed metadata** (Phases 1–7) is shipped; renderer kernel (TanStack list, Number Flow stat, heatmap/combo/brush chart, toolbar v2, responsive cards, analytical table controls, Decision Ledger) is live. The remaining lift to **9.5** is primarily **builder affordance adoption** (`href`, `comparison`, `rowTone`, toolbar descriptors, chart annotations/actions, decision evidence) plus screenshot and axe regression coverage, not duplicate table JSX.
