# ARCH-004 · Naming Conventions

**Doc ID:** `ARCH-004` · **File:** `004-naming-conventions.md`

| Field     | Value                                                                           |
| --------- | ------------------------------------------------------------------------------- |
| Status    | Active — enforced by `pnpm architecture:check` (May 2026)                       |
| Authority | Workspace packages, routes, exports, docs, tests, symbols                       |
| Related   | **ARCH-003** (guards) · **ARCH-002** (feature packages) · **ARCH-001** (deploy) |

Afenda uses predictable names so routes, packages, Turborepo tasks, and
documentation stay scannable in a **single-app Vercel/Turborepo monorepo**.
Package folder names, `package.json` `name` fields, and import paths must agree
so Vercel can build the affected workspace graph with
`pnpm turbo build --filter=@afenda/erp` (root `vercel.json` `buildCommand`).

Enforcement: `pnpm architecture:check` validates package placement, export
shape, and documentation naming. Package categories:
[Directory Architecture Audit](003-directory-architecture-audit.md).

## Vercel platform alignment

Validated against Vercel monorepo and conformance guidance (May 2026):

| Concern            | Afenda rule                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Deploy unit        | One Vercel project for `@afenda/erp`; not one project per module                                       |
| Build filter       | `pnpm turbo build --filter=@afenda/erp` — only the app and `^build` deps ship                          |
| Workspace installs | `pnpm install` with `pnpm-workspace.yaml`; every workspace dir has `package.json`                      |
| Unresolved imports | Declare direct `workspace:*` deps for every import used in source                                      |
| Turborepo outputs  | App: `.next/**` + `!.next/cache/**`; libraries: `dist/**` (**ARCH-003**)                               |
| Project link       | **Deferred** until local stabilization (**ARCH-001**); naming must not assume multiple Vercel projects |

Do not name packages or folders as if each ERP module were its own Vercel
deployment unless an ADR explicitly adds a second project.

## Workspace Packages

| Scope            | Pattern                      | Example folder         | Example `name`       |
| ---------------- | ---------------------------- | ---------------------- | -------------------- |
| App              | `@afenda/<app>`              | `apps/erp`             | `@afenda/erp`        |
| Platform library | `@afenda/<package>`          | `packages/domain`      | `@afenda/domain`     |
| Feature module   | `@afenda/feature-<moduleId>` | `packages/features/hr` | `@afenda/feature-hr` |

Rules:

- Use lowercase kebab-case for workspace folder names.
- The folder slug after `@afenda/` (or `@afenda/feature-`) must match the
  directory name, except feature packages live under `packages/features/<moduleId>`.
- Every workspace package declares an explicit `name` in `package.json`.
- Declare workspace dependencies with `"workspace:*"`; do not rely on transitive
  installs for imports used in source (Vercel conformance:
  `PACKAGE_MANAGEMENT_NO_UNRESOLVED_IMPORTS`).
- Library packages compile to `dist/**`; the Next.js app emits `.next/**`
  (excluding `.next/cache/**` from Turborepo cache outputs).

Afenda is **not** a microfrontend repo. Do not name packages as if they were
separate Vercel projects unless a future ADR explicitly adds one.

## Module IDs and Feature Packages

Runtime module IDs are canonical in `packages/config/src/module-ids.ts`. Routes,
permissions, and database promotion use the same slug.

| moduleId     | Route segment               | Feature folder                 | Package                      |
| ------------ | --------------------------- | ------------------------------ | ---------------------------- |
| `dashboard`  | `/dashboard`                | — (app shell)                  | `@afenda/erp`                |
| `finance`    | `/finance` via `[moduleId]` | `packages/features/finance`    | `@afenda/feature-finance`    |
| `sales`      | `/sales`                    | `packages/features/sales`      | `@afenda/feature-sales`      |
| `purchasing` | `/purchasing`               | `packages/features/purchasing` | `@afenda/feature-purchasing` |
| `inventory`  | `/inventory`                | `packages/features/inventory`  | `@afenda/feature-inventory`  |
| `hr`         | `/hr`                       | `packages/features/hr`         | `@afenda/feature-hr`         |
| `crm`        | `/crm`                      | `packages/features/crm`        | `@afenda/feature-crm`        |
| `approvals`  | `/approvals`                | `packages/features/approvals`  | `@afenda/feature-approvals`  |
| `reports`    | `/reports`                  | `packages/features/reports`    | `@afenda/feature-reports`    |
| `system-admin` | `/system-admin`           | `packages/features/system-admin` | `@afenda/feature-system-admin` |

Core ERP modules share one dynamic route tree:
`apps/erp/src/app/(app)/[moduleId]/…`. Do not create per-module route folders
unless a module needs a genuinely different URL tree.

Do not invent alternate slugs (`hrm`, `human-resources`) unless the module ID
changes in `@afenda/config`. Feature packages are scaffolded on disk; mature
logic moves into those packages per
[ERP Domain Package Architecture](002-erp-domain-package-architecture.md).

Target database schema folders follow the same moduleId slug:
`packages/db/src/schema/<moduleId>/`.

## Package Export Subpaths

Workspace libraries expose **explicit public doors** in `package.json` `exports`.
Follow the governed-surface and auth patterns:

| Subpath      | Use                                                         |
| ------------ | ----------------------------------------------------------- |
| `.`          | Shared entry; keep server-only graphs out of client bundles |
| `./client`   | Client Components and browser-only modules                  |
| `./server`   | Server Components, Server Actions helpers, Node-only code   |
| `./metadata` | Governed renderer dispatch and metadata-only imports        |
| `./schemas`  | Zod contracts without runtime UI                            |

Export shape for compiled libraries:

```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "development": "./src/index.ts",
      "default": "./dist/index.js"
    },
    "./server": {
      "types": "./src/server.ts",
      "development": "./src/server.ts",
      "default": "./dist/server.js"
    }
  }
}
```

Import rules (Vercel/Next.js server-client separation):

- App routes and Server Components: `@afenda/<pkg>/server`, `@afenda/domain`, feature `./server` or `./metadata`.
- Client Components: `@afenda/<pkg>/client`, `@afenda/ui/*`, feature `./client` only.
- Prefer explicit subpaths over package root barrels when the root re-exports server code.
- `@afenda/ui` may use `./*` deep imports for primitives; do not copy that pattern into feature or domain packages without an ADR.

Feature package template: [ERP Domain Package Architecture](002-erp-domain-package-architecture.md).
Workspace split discipline: [Workspace Package Discipline](008-workspace-package-discipline.md).

## Directories

- Use lowercase kebab-case for normal folders: `governed-surface`, `solution-console`.
- Align platform package folders with package names:
  `packages/governed-surface` → `@afenda/governed-surface`.
- Align app folders with app package names: `apps/erp` → `@afenda/erp`.
- Allowed Next.js exceptions:
  - Route groups: `(app)`, `(auth)`, `onboarding`.
  - Dynamic segments: `[moduleId]`, `[recordId]`, `[workItemId]`, `[...path]`.
  - Private route-local folders: `_components`.
- Generated output never lives in source trees:
  - libraries → `packages/*/dist/**`
  - app → `apps/erp/.next/**`
  - tests/reports → `.artifacts/**`

## Files

- Use lowercase kebab-case for authored source files:
  `module-screen.tsx`, `record-type-definitions.ts`.
- Keep Next.js App Router filenames unchanged: `page.tsx`, `layout.tsx`,
  `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `route.ts`.
- Next.js 16+ traffic/session helper: `apps/erp/src/proxy.ts` (not `middleware.ts`).
- Governed-surface suffix taxonomy:
  - `.client.tsx` — Client Components or browser-only modules
  - `.server.ts` / `.server.tsx` — server-only modules
  - `.shared.ts` — environment-neutral helpers
  - `.schema.ts` — schema contracts
  - `.renderer.tsx` — governed metadata renderers
- Test suffixes:
  - `*.test.ts` / `*.test.tsx` — Vitest (package and app unit tests)
  - `*.spec.ts` — Playwright e2e under `apps/erp`

## Components and Symbols

- React component **filenames** stay kebab-case: `employee-record-panel.tsx`.
- Exported React component **symbols** stay PascalCase: `EmployeeRecordPanel`.
- Hooks use `use-*` filenames when the file's primary API is a hook.
- Reusable UI primitives: `packages/ui/src`.
- App composition: `apps/erp/src/app` or `apps/erp/src/components`.
- Module-specific ERP components (when extracted):
  `packages/features/<moduleId>/src/components/…`.

## Turborepo and Scripts

Root scripts filter the deployable app unless the task is repo-wide:

| Script                | Filter / scope                          |
| --------------------- | --------------------------------------- |
| `pnpm dev`            | `turbo dev --filter=@afenda/erp`        |
| `pnpm test:e2e`       | `turbo test:e2e --filter=@afenda/erp`   |
| `pnpm build`          | `turbo build` (full workspace graph)    |
| Vercel `buildCommand` | `pnpm turbo build --filter=@afenda/erp` |

Package `package.json` scripts use standard task names consumed by `turbo.json`:
`build`, `dev`, `lint`, `typecheck`, `test`, `test:e2e`, `db:generate`,
`db:migrate`, `db:seed`.

## Documentation

- Stable architecture docs: `docs/architecture/` with numbered filenames and
  stable IDs:
  - Filename: `00N-<topic>.md` (three-digit prefix, lowercase kebab-case slug).
  - Doc ID: `ARCH-00N` in the H1 and a `**Doc ID:**` line (for example
    `ARCH-006` → `006-metadata-driven-ui-architecture.md`).
- Roadmaps and tracking docs: `docs/roadmap/` with `TRACK-00N` IDs and
  `00N-<topic>.md` filenames (see [Roadmap README](../roadmap/README.md)).
- Allowed uppercase Markdown exceptions: `README.md`, `AGENTS.md`.
- Do not add root-level `*-architecture.md` files; link new docs from
  [Architecture README](README.md) and assign the next free `ARCH-###` /
  `TRACK-###` number.

## Related Documents

- **ARCH-002** [ERP Domain Package Architecture](002-erp-domain-package-architecture.md) — feature-package naming and export doors
- **ARCH-003** [Directory Architecture Audit](003-directory-architecture-audit.md) — enforced package categories
- **ARCH-006** [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md) — import doors for governed UI
- **ARCH-001** [System Architecture](001-system-architecture.md) — route shape and deployment model
- **ARCH-008** [Workspace Package Discipline](008-workspace-package-discipline.md) — package classes and split policy
