# Metadata UI Playground Architecture

This route is a lightweight developer preview surface for `@afenda/metadata-ui`.
It exists to inspect renderer behavior, AppShell framing, fixture density, and
visual polish during local development.

This is not an ERP workspace route and not a tenant-governed product surface.

## Purpose

`/playground-metadataui` provides a Storybook-like preview without introducing a
Storybook runtime, a separate package, or workspace authentication.

The playground may render:

- static AppShell chrome built from local fixtures
- metadata-ui section stacks
- representative list, stat, chart, form, action, timeline, and empty states
- intentionally seeded sample rows for visual and interaction review

The playground must not become a source of ERP business behavior.

## Route Boundary

The route lives under:

```txt
apps/erp/src/app/playground-metadataui
```

It is intentionally outside `(workspace)` so it does not inherit workspace auth,
tenant resolution, or capability governance.

If the page needs AppShell chrome, the route owns a dedicated local layout that
passes static fixture chrome to `@afenda/appshell/server`. It must not import or
reuse the workspace layout.

## Data Rules

All data in this route is pre-seeded fixture data.

Allowed:

- local fixture files in this directory
- metadata created with public `@afenda/metadata-ui` builders
- static AppShell chrome fixtures
- deterministic sample rows, labels, statuses, and timestamps

Forbidden:

- `@afenda/auth`
- `@afenda/db`
- feature package repositories, commands, domain services, or read models
- calls to `fetch('/api/...')`
- tenant IDs or organization IDs from user input
- server actions that mutate ERP state
- importing workspace route composers

Fixtures must be deterministic and safe to publish in screenshots.

Required fixture discipline:

- use stable deterministic IDs
- use neutral sample names only
- avoid real customer, company, employee, vendor, or user names
- avoid real tenant IDs, organization IDs, emails, or account identifiers
- avoid confidential operational language
- avoid customer-like names
- avoid internal project names
- avoid real document references
- avoid realistic financial values
- avoid `new Date()` for generated current-time values
- avoid randomness
- avoid async reads
- use fixed timestamps such as `2026-01-01T08:00:00.000Z`

## Dependency Rules

Allowed imports:

```txt
@afenda/appshell/server
@afenda/metadata-ui
@afenda/metadata-ui/server
@afenda/ui
next
next/navigation
react
server-only
```

This route should be covered by architecture checks that prevent imports from:

- `@afenda/auth`
- `@afenda/db`
- feature packages
- workspace route modules
- server action modules

`@afenda/metadata-ui` remains the rendering runtime. This playground only
assembles fixtures and renders them.

Do not add a dedicated package for this playground unless it grows into a
cross-package internal tool with its own lifecycle. Local app-level fixtures are
preferred because this route is development-only and non-canonical.

## Suggested File Shape

```txt
apps/erp/src/app/playground-metadataui/
  architecture.md
  layout.tsx
  page.tsx
  _fixtures/
    chrome.server.ts
    stack.fixture.ts
    list.fixture.ts
    stat.fixture.ts
    chart.fixture.ts
    form.fixture.ts
```

Fixture files may be split further when a single file becomes difficult to
review. Do not introduce fixture registries or dynamic discovery.

## AppShell Frame

The playground may use the real AppShell component:

```tsx
import { AppShell } from "@afenda/appshell/server";
import { createMetadataUiPlaygroundChrome } from "./_fixtures/chrome.server";

export default function MetadataUiPlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell chrome={createMetadataUiPlaygroundChrome()}>
      {children}
    </AppShell>
  );
}
```

The chrome fixture must be static and local. It must not perform session,
organization, notification, account, or capability reads.

## Static Route Contract

The playground should be static and non-request-bound:

Do not add request headers, cookies, search-param driven tenant behavior,
session reads, async data loading, or runtime data loading. Any interactive
state should be local UI state inside metadata-ui/client renderers, not ERP data
state.

Do not export `dynamic = "force-static"` in this route while the ERP app uses
Next.js Cache Components. In this app version, that segment config is
incompatible with `nextConfig.cacheComponents`. Static behavior is preserved by
keeping the route deterministic and free of request-bound APIs.

## Rendering Pattern

The page should stay thin:

```tsx
import { MetadataUiRenderStack } from "@afenda/metadata-ui/server";
import { createMetadataUiPlaygroundStack } from "./_fixtures/stack.fixture";

export default function MetadataUiPlaygroundPage() {
  return <MetadataUiRenderStack sections={createMetadataUiPlaygroundStack()} />;
}
```

Renderer improvement work belongs in `packages/metadata-ui`. The playground
should only expose enough fixture variation to verify those improvements.

## Visual Coverage

The playground should be useful as a lightweight regression surface, not a set of
random demos.

Required fixture coverage:

- ready state
- loading state
- empty state
- forbidden state
- error state
- dense list surface
- action bar
- stat cards
- chart section
- form section
- timeline or audit-like section

Coverage may be grouped into tabs or sections as the page grows, but the source
must remain static fixture metadata.

## Sample Vocabulary

Use neutral sample vocabulary that cannot be mistaken for real ERP data.

Preferred:

```txt
Sample Vendor
Sample Location
Sample Approval
Sample Record
Sample Operator
sample.operator@example.invalid
```

Avoid:

```txt
real customer names
real employee names
real company names
real finance documents
real tenant identifiers
confidential operational language
internal project names
customer-like names
```

## Navigation And Discovery

This route must not be linked from production navigation, workspace navigation,
module manifests, sitemap generation, or public SEO metadata.

If a local development index is added later, it must be guarded by the same
`AFENDA_ENABLE_DEV_PLAYGROUNDS` flag and must not appear in tenant-facing
navigation data.

## Production Exposure

This route is developer-only. Production exposure must be guarded in executable
code, not only documented.

```ts
process.env.AFENDA_ENABLE_DEV_PLAYGROUNDS === "1"
```

The default production posture is hidden.

Use a local assertion in `layout.tsx` or `page.tsx`:

```tsx
import { notFound } from "next/navigation";

function assertMetadataUiPlaygroundEnabled() {
  if (process.env.AFENDA_ENABLE_DEV_PLAYGROUNDS !== "1") {
    notFound();
  }
}
```

Call the assertion before rendering the AppShell or metadata stack.

## Local Development Port

The canonical local URL is:

```txt
http://127.0.0.1:4000/playground-metadataui
```

Use port `4000` only for this playground. Do not auto-select fallback ports for
normal playground development because screenshots, review notes, and developer
handoffs should reference one stable URL.

If port `4000` is already occupied, stop and resolve the port conflict before
starting the playground.

Start the playground with:

```bash
pnpm dev:metadata-ui-playground
```

The script sets `AFENDA_ENABLE_DEV_PLAYGROUNDS=1`, checks that port `4000` is
free, and starts the ERP app on `127.0.0.1:4000`.

## Validation

After changing this playground or metadata-ui renderers, run the narrow relevant
checks:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
pnpm guard:metadata-ui
pnpm architecture:check
```

Use only the checks relevant to the touched files. Do not run full monorepo
tests for playground-only fixture edits.

## Development Slices

Maximum active slices: 10.

Each slice should land independently and keep the playground static,
fixture-only, and outside workspace governance.

### Slice 01 — Route Shell And Production Gate

Purpose: create the route skeleton and executable dev-only guard.

Target files:

```txt
layout.tsx
page.tsx
_fixtures/chrome.server.ts
```

Work:

- keep the route free of request-bound APIs and incompatible segment config
- add `assertMetadataUiPlaygroundEnabled()`
- render local static AppShell chrome
- render a minimal placeholder page

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm architecture:check
```

### Slice 02 — Fixture Foundation

Purpose: establish deterministic fixture rules in code.

Target files:

```txt
_fixtures/constants.fixture.ts
_fixtures/sample-vocabulary.fixture.ts
_fixtures/stack.fixture.ts
```

Work:

- define fixed timestamps
- define stable sample IDs
- define screenshot-safe sample labels
- create the first metadata-ui stack fixture

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
```

### Slice 03 — Basic Renderer Gallery

Purpose: render the first useful metadata-ui preview sections.

Target files:

```txt
page.tsx
_fixtures/stat.fixture.ts
_fixtures/list.fixture.ts
_fixtures/action-bar.fixture.ts
_fixtures/stack.fixture.ts
```

Work:

- render stat cards
- render a dense list surface
- render an action bar
- keep all rows local and deterministic

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
```

### Slice 04 — State Coverage

Purpose: cover required renderer states.

Target files:

```txt
_fixtures/state.fixture.ts
_fixtures/empty.fixture.ts
_fixtures/stack.fixture.ts
```

Work:

- add ready state fixture
- add loading state fixture
- add empty state fixture
- add forbidden state fixture
- add error state fixture

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm guard:metadata-ui
```

### Slice 05 — Forms And Input Surfaces

Purpose: preview metadata-ui form rendering without ERP mutation behavior.

Target files:

```txt
_fixtures/form.fixture.ts
_fixtures/scorecard-form.fixture.ts
_fixtures/stack.fixture.ts
```

Work:

- add read-only or inert form fixtures
- add validation-display fixtures with static sample errors
- avoid server actions and mutation handlers

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
```

### Slice 06 — Chart And Timeline Surfaces

Purpose: cover non-table analytical and audit-like renderer shapes.

Target files:

```txt
_fixtures/chart.fixture.ts
_fixtures/timeline.fixture.ts
_fixtures/audit-panel.fixture.ts
_fixtures/stack.fixture.ts
```

Work:

- add chart fixture data
- add approval-timeline or audit-panel fixture data
- keep values illustrative and non-financial

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
```

### Slice 07 — Gallery Organization

Purpose: make the playground usable as renderer coverage grows.

Target files:

```txt
page.tsx
_fixtures/stack.fixture.ts
```

Work:

- group sections by renderer family
- add stable headings or page-header metadata
- keep the page thin and avoid custom gallery framework code

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
```

### Slice 08 — Screenshot And Visual Review Readiness

Purpose: make the route reliable for visual review.

Target files:

```txt
README.md
_fixtures/*.fixture.ts
```

Work:

- audit fixture names and values for screenshot safety
- document local preview URL and feature flag
- confirm no production navigation link exists

Acceptance:

```bash
pnpm architecture:check
```

### Slice 09 — Import Boundary Enforcement

Purpose: add or update automated checks for playground import boundaries.

Target files:

```txt
scripts/
apps/erp/src/app/playground-metadataui/
```

Work:

- prevent imports from `@afenda/auth`
- prevent imports from `@afenda/db`
- prevent imports from feature packages
- prevent imports from workspace route modules
- prevent imports from server action modules

Acceptance:

```bash
pnpm architecture:check
```

### Slice 10 — Final Certification

Purpose: certify the playground as ready for renderer development.

Target files:

```txt
architecture.md
README.md
page.tsx
layout.tsx
_fixtures/
```

Work:

- verify every required coverage state exists
- verify the route is hidden unless enabled
- verify all fixtures are static and deterministic
- remove temporary placeholders

Acceptance:

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/metadata-ui typecheck
pnpm guard:metadata-ui
pnpm architecture:check
```
