# Metadata UI Playground

This playground is a development-only screenshot atlas for governed metadata UI renderers. It is fixture-backed and deterministic so renderer reviews can compare stable screenshots without touching tenant data, auth state, feature packages, or HTTP APIs.

The advanced ERP-like pattern target is documented in
[`advanced-patterns.md`](./advanced-patterns.md). The current implementation is
metadata-only for visible renderer content, including the full advanced
operations, records, workflow, planning, analytics, table lab, and state matrix
pattern catalog.

## Local Preview

Start the guarded local preview from the repository root:

```bash
pnpm dev:metadata-ui-playground
```

Open the route directly:

```txt
http://127.0.0.1:4000/playground-metadataui
```

Use `127.0.0.1`, not `localhost`. The playground dev script binds IPv4 loopback only (`--hostname 127.0.0.1`). Opening `http://localhost:4000/...` can fail on Windows when the browser resolves `localhost` to IPv6 while nothing is listening on `[::1]:4000`, which produces a Chrome error page (`chrome-error://chromewebdata/`) and console messages such as “Unsafe attempt to load URL … from frame”.

The route is available only when the development playground flag is enabled:

```txt
AFENDA_ENABLE_DEV_PLAYGROUNDS=1
```

Both `layout.tsx` and `apps/erp/src/proxy.ts` guard this route. It is not intended for production navigation, public SEO, workspace menus, or module manifests.

## Screenshot Workflow

Capture slice screenshots into `.artifacts/` so generated review output does not pollute source directories:

```txt
.artifacts/metadata-ui-playground-sliceXX.png
```

Use full-page captures at a wide desktop viewport when reviewing renderer density, section order, and visual regressions. The playground should remain screenshot-safe across reruns: no current time, no random values, no live data, and no network reads.

## Fixture Safety Rules

Fixtures in `_fixtures/` must stay static and sanitized:

- Use deterministic IDs, fixed ISO timestamps, and neutral `Sample` labels.
- Use `.invalid` example addresses only when an email-shaped value is required.
- Do not include real customer, company, employee, vendor, tenant, organization, financial, invoice, or order data.
- Do not call `fetch`, database clients, auth helpers, feature package servers, `Date.now`, `new Date()`, `Math.random`, or browser storage APIs.
- Keep the page as a server-rendered composition of metadata fixtures and renderer context.

## Production Navigation Audit

Slice 08 checked route discoverability by searching app, package, docs, and script references for `playground-metadataui`, `AFENDA_ENABLE_DEV_PLAYGROUNDS`, and `dev:metadata-ui-playground`.

Expected references:

- `scripts/dev-metadata-ui-playground.mts`
- architecture guard allow-list entries
- `apps/erp/src/proxy.ts`
- this playground directory

No workspace navigation link, production module manifest entry, sitemap entry, or public route promotion should be added for this surface.

## Import Boundary Guard

Slice 09 adds `checkMetadataUiPlaygroundImportBoundaries()` to `scripts/check-directory-architecture.mts`. The guard scans every source file under this route and rejects imports from:

- `@afenda/auth`
- `@afenda/db`
- `@afenda/feature-*`
- workspace route modules
- server action modules

The playground may import UI/runtime packages such as `@afenda/metadata-ui/server`, `@afenda/ui`, React, and local `_fixtures/` modules. It must not become a tenant workspace route, a data access layer, or a write transport preview.

**shadcn boundary:** This route never imports shadcn or `@afenda/ui` components directly for renderer content. Breadcrumb, Badge, Button, DropdownMenu, Table, Tabs, and related primitives are composed inside `packages/metadata-ui` and rendered here only through metadata fixtures and registered renderers.

## Certification

Slice 10 adds `checkMetadataUiPlaygroundCertification()` to `scripts/check-directory-architecture.mts`. The certification guard verifies:

- Required playground files exist.
- The layout hides the route unless `AFENDA_ENABLE_DEV_PLAYGROUNDS=1`.
- The proxy bypass is gated by `AFENDA_ENABLE_DEV_PLAYGROUNDS=1`.
- Ready, loading, empty, forbidden, and error states have fixture IDs and rendered coverage.
- The metadata-only state matrix is wired through list metadata and static rows.
- Advanced scenario kinds, static pattern routes, visual contracts, and renderer
  section wiring are certified.
- The stack uses metadata-ui responsive span metadata for dashboard density
  instead of playground-owned JSX layout.
- The table lab uses metadata-owned selectability, row action state, trailing
  action state, and current-window TanStack behavior through list metadata.
- The Playwright visual spec gates screenshots with `toHaveScreenshot()` and
  checks routed pattern pages, mobile table scroll reachability,
  reduced-motion metadata, and row disabled state markers.
- Every registered server renderer has stack coverage.
- Source fixtures do not call `fetch`, `Date.now`, `new Date()`, or `Math.random`.
- Source fixtures do not contain temporary `TODO`, `TBD`, or `FIXME` markers.

Certified coverage:

| Coverage | Source |
| --- | --- |
| Action bar | `_fixtures/action-bar.fixture.ts` |
| Stat cards | `_fixtures/stat.fixture.ts` |
| Dense list | `_fixtures/list.fixture.ts` |
| Ready/loading/empty/forbidden/error states | `_fixtures/advanced-state.fixture.ts` |
| Advanced analytics | `_fixtures/advanced-analytics.fixture.ts` |
| Form validation display | `_fixtures/form.fixture.ts` |
| Scorecard form | `_fixtures/scorecard-form.fixture.ts` |
| Chart | `_fixtures/chart.fixture.ts` |
| Approval timeline | `_fixtures/timeline.fixture.ts` |
| Audit panel | `_fixtures/audit-panel.fixture.ts` |
| Multi-step form | `_fixtures/multi-step-form.fixture.ts` |
| Kanban | `_fixtures/kanban.fixture.ts` |
| Detail tabs | `_fixtures/detail-tabs.fixture.ts` |

## Validation

Run the architecture guard after changes:

```bash
pnpm architecture:check
```

Final certification validation:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
pnpm guard:metadata-ui
pnpm architecture:check
```

For visual review, start the local preview and capture a screenshot under `.artifacts/`.
