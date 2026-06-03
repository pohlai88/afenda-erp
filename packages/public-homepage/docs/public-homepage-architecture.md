# Public Homepage Architecture

`@afenda/public-homepage` owns the anonymous Afenda ERP homepage rendered at `/`.
`apps/erp` only mounts the package from the root React Server Component route, so the app
boundary stays thin and does not read auth session state, self-fetch `/api`, or place
homepage logic under `apps/erp/src/lib`.

This package follows the target architecture in `ARCH-1003` and `ARCH-1004`:

- `/` is a public RSC page, not a workspace route.
- Homepage data is local package content, not tenant data.
- The package exposes a server entrypoint for `apps/erp/src/app/page.tsx`.
- There is no homepage HTTP API.

## Directory Tree

```txt
packages/public-homepage/
  docs/
    public-homepage-architecture.md
  package.json
  tsconfig.json
  tsconfig.build.json
  types/
    css-modules.d.ts
  src/
    index.ts
    server.ts
    components/
      homepage-shell.server.tsx
      homepage-hero.server.tsx
      homepage-hero.client.tsx
      site-header.server.tsx
      site-header-controls.client.tsx
    content/
      homepage.content.ts
    schemas/
      homepage.schema.ts
    seo/
      homepage-seo.ts
    styles/
      public-homepage.module.css
```

## Package Boundary

`@afenda/public-homepage` has two public doors:

| Export | Use |
| ------ | --- |
| `@afenda/public-homepage` | Package-level types or future non-rendering helpers |
| `@afenda/public-homepage/server` | Root homepage RSC component and `metadata` |

Do not add `./client`, `./api`, or deep component exports until there is a concrete caller.
`apps/erp` should import only the server door for the root route.

## Render Flow

```txt
apps/erp/src/app/page.tsx
  -> @afenda/public-homepage/server
  -> homepage-shell.server.tsx
  -> header, hero
```

The route remains a React Server Component path. There is no API data fetch and no auth
redirect. Signed-in and signed-out users see the same page. Sign-in is available from the
header menu. The header may own a small client island for the menu and theme toggle only.

## Ownership

- `content/` holds static homepage copy and navigation labels.
- `schemas/` validates homepage content before rendering or metadata generation.
- `seo/` owns Next metadata derived from validated content.
- `components/` contains explicit server components for each section, without boolean mode props or shared mega-components.
- `styles/` contains the package CSS module for motion, layout, and accessible states.

The package must not import `@afenda/auth`, `@afenda/db`, `@afenda/kernel`, feature packages,
or workspace governed-surface builders. Those belong to tenant/workspace runtime, not the
anonymous homepage.

## Server And Client Components

Default to Server Components. Client components are allowed only at interaction leaves:

| Component type | Allowed responsibilities |
| -------------- | ------------------------ |
| Server | Layout, content composition, metadata, static links |
| Client | Header menu state, theme toggle, small local UI interactions |

Client islands receive small serializable props. They do not fetch homepage data, read session
state, call Server Actions, or import server-only modules.

## App Integration

`apps/erp/src/app/page.tsx` re-exports the server entrypoint:

```ts
export {
  default,
  metadata,
} from "@afenda/public-homepage/server";
```

`@afenda/erp` depends on `@afenda/public-homepage`. `@afenda/config` must include it in
`afendaTranspilePackages` so Next.js can compile the workspace package and CSS module during
the app build.

## API And Data Policy

The homepage has no route handlers. Do not add `apps/erp/src/app/api/*` endpoints for
homepage content, forms, navigation, or metadata. If a future public submission is required,
it must use the `ARCH-1004` public API shape under `apps/erp/src/app/api/public/v1/...` with a
thin route handler.

Static copy stays in `content/`. Runtime tenant data, capabilities, and organization-specific
state are out of scope for this package.

## Guardrails

- Keep the package server-first; client islands are limited to explicit interaction controls such as the public header menu and theme toggle.
- Keep content schema-validated before it reaches section components.
- Keep `/` session-agnostic; signed-in and signed-out users see the same public landing page.
- Do not add business logic under `apps/erp/src/lib`.
- Do not change `apps/erp/src/app/api` routes for homepage data.
- Do not add workspace redirects, tenant reads, or capability checks to the root homepage.
- Do not introduce CMS, registry, or database dependencies without a signed architecture change.

## Validation

Use the smallest checks for homepage-only changes:

```bash
pnpm --filter @afenda/public-homepage typecheck
pnpm architecture:check
```
