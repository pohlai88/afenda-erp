# Feature Package Template Definition

This directory is the source of truth for the feature-package bucket grammar.
Scaffold and architecture guard scripts read bucket folders from `src/`, so
changes under `packages/_template-definition/src` affect every new
`@afenda/feature-*` package and every vertical slice created with
`pnpm scaffold:vertical`.

Template-owned automation lives in `scripts/` here. Keep local scaffold and
validation scripts beside this template instead of adding template-specific
automation to the repository root `scripts/` directory.

Use this guide when deciding where a file belongs, what a public entry point may
export, and how feature files should be named.

## Mental Model

Feature packages use two axes:

| Axis              | Meaning                                                                         | Use when                                                                               |
| ----------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Horizontal bucket | Groups files by responsibility: `actions`, `components`, `data`, and so on.     | The behavior is module-wide, small, or shared by multiple vertical slices.             |
| Vertical slice    | Groups buckets by capability: `payroll`, `gl`, `time-attendance`, `onboarding`. | The capability has its own commands, queries, components, policies, schemas, or tests. |

Horizontal buckets answer "what kind of code is this?". Vertical slices answer
"which business capability owns it?".

Start horizontal for small modules. Add a vertical slice when a capability spans
multiple buckets or has a distinct domain language, test lifecycle, or ownership
boundary. Do not create nested workspace packages for slices.

```txt
packages/features/hr/src/
  index.ts
  client.ts
  server.ts
  metadata.ts
  contracts/               # module-wide horizontal bucket
  policies/
  payroll/                 # vertical slice
    actions/
    components/
    contracts/
    data/
    events/
    policies/
    schemas/
    tests/
```

When a vertical slice contains template buckets, it must contain the full bucket
set. Use `pnpm scaffold:vertical <feature> <vertical>` instead of hand-building
the directories.

## Public Entry Points

The four public doors are the only supported import surfaces for a feature
package. App routes and other packages import these doors, not internal files.

| Door          | Definition                        | Allowed                                                                                              | Disallowed                                                                                                    | How to use                                                                                                        |
| ------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `index.ts`    | Environment-neutral package root. | Shared contracts, constants, pure helpers, metadata-only values that are safe on client and server.  | Database access, Node APIs, secrets, Server Actions, Client Components, server-only auth, route handlers.     | Import as `@afenda/feature-<moduleId>` only when the consumer is truly environment-neutral. Keep this door small. |
| `client.ts`   | Browser-safe public door.         | Client Components, browser-only hooks, browser-safe view helpers from `components/`.                 | `@afenda/db`, `@afenda/ai`, `@afenda/workflows`, `@afenda/auth/server`, `node:*`, secrets, server data reads. | Import from Client Components as `@afenda/feature-<moduleId>/client`. Re-export only client-safe modules.         |
| `server.ts`   | Server-only public door.          | Server Components, Server Actions, command/query services, data access, policies, event dispatchers. | `"use client"` modules, browser-only hooks, DOM-only code, client state managers.                             | Import from Server Components, Server Actions, and Route Handlers as `@afenda/feature-<moduleId>/server`.         |
| `metadata.ts` | Governed metadata public door.    | Module ID, governed metadata builders, list-surface factories, metadata-only record definitions.     | Tenant reads, mutations, capability decisions, database queries, renderer implementations, React UI.          | Import where routes or governed renderers need metadata shape. Runtime authority still belongs to server code.    |

## Bucket Guide

Each bucket has one job. If a file could fit in several buckets, choose the
bucket that owns the highest-risk behavior. For example, a mutation that parses
input, checks policy, and writes data belongs in `actions/`; supporting schemas,
policy helpers, and data functions stay in their own buckets.

| Bucket        | Definition                                                         | Allowed                                                                                                                    | Disallowed                                                                                                                                               | How to use                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `actions/`    | Server-side mutation orchestration and Server Action entry files.  | `*.actions.server.ts`, command adapters, mutation workflows that call schemas, policies, and data services.                | Client code, React UI, raw table writes without tenancy/policy checks, long-running jobs, route handlers.                                                | Export through `server.ts`. Validate input with `schemas/`, enforce `policies/`, then call `data/` or package services.                                           |
| `components/` | Module-specific React UI owned by the feature.                     | Server Components, Client Components, forms, panels, table shells, small component-local hooks.                            | Reusable primitives that belong in `@afenda/ui`, durable business rules, database access, server auth in client files.                                   | Export browser-safe components through `client.ts`; export server-only components through `server.ts`. Files ending `.client.ts` or `.client.tsx` must live here. |
| `contracts/`  | TypeScript contracts for the module API and cross-bucket language. | Types, interfaces, discriminated unions, DTO shapes, stable constants, capability keys.                                    | Runtime data access, React, Zod parsing logic, Drizzle schema, feature-to-feature implementation imports.                                                | Prefer environment-neutral exports. Re-export safe contracts from `index.ts` when callers need them.                                                              |
| `data/`       | Server-owned persistence and query boundary.                       | Tenant-scoped reads/writes, query services, repository functions, server-window loaders, mappers around `@afenda/db`.      | Drizzle schema or migrations, Neon client creation at module scope, client imports, permission-free tenant reads, UI shaping that belongs in components. | Export through `server.ts` only. Derive tenant scope from server context and keep full datasets off the client.                                                   |
| `events/`     | Domain event definitions and event dispatch adapters.              | Event payload types, event builders, audit/workflow event adapters, integration event mappers.                             | Toasts, UI notifications, ad hoc string event names, cron route handlers, webhook route handlers.                                                        | Keep event payloads typed through `contracts/` and validated by `schemas/` when crossing trust boundaries.                                                        |
| `policies/`   | Authorization, capability, risk, and module invariant checks.      | Capability checks, policy result types, guarded-operation helpers, data sensitivity rules, governed metadata policy facts. | Client-trusted authorization, tenant IDs from client input, route-only checks as the only enforcement, direct database mutations.                        | Call before reads and writes in `actions/` and `data/`. App routes may also check capabilities, but feature policies own module-specific decisions.               |
| `schemas/`    | Runtime validation and parser contracts.                           | Zod schemas, input/output parsers, enum schemas, form payload validation, metadata validation helpers.                     | Drizzle table schema, SQL migrations, React components, data fetching, policy decisions.                                                                 | Keep schemas environment-neutral when possible. Use `.schema.ts` suffixes and derive TypeScript types from schemas when that avoids drift.                        |
| `tests/`      | Feature-owned unit and integration tests.                          | Vitest `*.test.ts` / `*.test.tsx`, fixtures, contract tests, bucket-level behavior tests.                                  | Generated artifacts, Playwright e2e specs for app flows, tests that require unscoped production services.                                                | Put vertical-specific tests inside the vertical `tests/`; put module-wide tests in `src/tests/`. App route flows belong under the app e2e test surface.           |

Do not add catch-all folders such as `_shared`, `shared`, `common`, `lib`,
`utils`, `helpers`, `misc`, or `internal`. Cross-slice code belongs in the
appropriate root bucket with a precise subject prefix. The scaffold creates the
default bucket set up front; empty starter buckets may be removed after the
package audit once the real implementation has settled into named buckets.

Additional buckets are on demand. Add one only when a repeated responsibility
does not fit an existing bucket, name it by responsibility rather than location,
and update this template plus `pnpm architecture:check` expectations in the same
change.

## Vertical Slice Rules

Use a vertical slice when a capability is large enough to own several buckets:

- `finance/src/gl/...`
- `finance/src/ap/...`
- `hr/src/time-attendance/...`
- `hr/src/payroll/...`

Rules:

- Vertical names use lowercase kebab-case.
- A vertical that uses buckets must include every template bucket.
- Keep cross-vertical contracts in the feature root `src/contracts/` bucket, not in `_shared`.
- Do not import from another vertical's internal path unless the package exposes
  the contract through a public door.
- Do not create `package.json` inside a vertical slice.

## File Naming

Use explicit dotted filenames. Do not let agents invent loose forms such as
`<directory>/<subject><role><runtime>` or vague files such as `helpers.ts`.

Canonical order:

```txt
<scope>.<subject>.<kind>[.<runtime>].ts
<scope>.<subject>.<kind>[.<runtime>].tsx
```

Token rules:

| Token     | Required                        | Definition                                                          | Examples                                                                               |
| --------- | ------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `scope`   | Yes                             | Package, module, or vertical owner. Use the shortest stable slug.   | `ai`, `lynx`, `knowledge`, `hr`, `payroll`, `gl`                                       |
| `subject` | Yes                             | Business object, workflow, or capability. Use lowercase kebab-case. | `prompt`, `leave-request`, `journal-posting`, `employee-record`                        |
| `kind`    | Yes                             | Exact artifact role from the bucket-specific pattern below.         | `actions`, `component`, `contract`, `query`, `repository`, `event`, `policy`, `schema` |
| `runtime` | Required for runtime-bound code | Where the file can run.                                             | `server`, `client`, `shared`                                                           |

Use `actions` plural for Server Action files because the repo already validates
the `*.actions.server.ts` suffix. For example, prefer
`ai.prompt.actions.server.ts` over `ai.prompt.action.server.ts`.

Do not use `#` in filenames. Use `#` only for package-private import aliases,
as described in [Import Aliases](#import-aliases).

Required patterns by bucket:

| Bucket        | Required pattern                         | Example                                         |
| ------------- | ---------------------------------------- | ----------------------------------------------- |
| `actions/`    | `<scope>.<subject>.actions.server.ts`    | `ai.prompt.actions.server.ts`                   |
| `components/` | `<scope>.<subject>.component.client.tsx` | `hr.leave-request-panel.component.client.tsx`   |
| `components/` | `<scope>.<subject>.component.server.tsx` | `hr.leave-request-section.component.server.tsx` |
| `components/` | `<scope>.<subject>.hook.client.ts`       | `hr.leave-request-form.hook.client.ts`          |
| `contracts/`  | `<scope>.<subject>.contract.ts`          | `hr.leave-request.contract.ts`                  |
| `data/`       | `<scope>.<subject>.query.server.ts`      | `hr.leave-request-list.query.server.ts`         |
| `data/`       | `<scope>.<subject>.repository.server.ts` | `hr.leave-request.repository.server.ts`         |
| `events/`     | `<scope>.<subject>.event.ts`             | `hr.leave-request-approved.event.ts`            |
| `policies/`   | `<scope>.<subject>.policy.server.ts`     | `hr.leave-request-access.policy.server.ts`      |
| `schemas/`    | `<scope>.<subject>.schema.ts`            | `hr.leave-request.schema.ts`                    |
| `tests/`      | `<scope>.<subject>.<kind>.test.ts`       | `hr.leave-request.actions.test.ts`              |

Suffix rules:

- Use `.client.ts` / `.client.tsx` only for browser-safe code in
  `components/`.
- Use `.server.ts` / `.server.tsx` for code that imports database, server auth,
  Node APIs, secrets, or other server-only modules.
- Use `.shared.ts` sparingly for pure environment-neutral helpers.
- Use `.schema.ts`, `.contract.ts`, `.policy.server.ts`, `.event.ts`,
  `.query.server.ts`, `.repository.server.ts`, and `.actions.server.ts` for
  role clarity.
- Use `<scope>.<subject>.hook.client.ts` for hooks whose primary export is a
  React hook.
- Keep `index.ts` files as bucket barrels only; do not hide behavior in them.
- Public doors keep their fixed names: `index.ts`, `client.ts`, `server.ts`,
  and `metadata.ts`.

Avoid vague names:

- `helpers.ts`
- `utils.ts`
- `common.ts`
- `service.ts`
- `types.ts` when the subject is unclear
- `index.ts` with real implementation logic
- `actions.server.ts` without scope and subject
- `schema.ts` without scope and subject

Prefer precise names:

- `hr.employee-record.contract.ts`
- `hr.employee-list.query.server.ts`
- `hr.pay-period-policy.schema.ts`
- `finance.journal-posting.actions.server.ts`
- `finance.approval-threshold.policy.server.ts`

## Import Aliases

`#` is allowed for package-private TypeScript/Node import aliases when the
package declares them in `package.json` `imports`.

Use `#` aliases for internal relations inside one package:

```ts
import { leaveRequestSchema } from "#schemas/hr.leave-request.schema";
import { canApproveLeaveRequest } from "#policies/hr.leave-request.policy.server";
```

Do not use `#` aliases as public package APIs or cross-package shortcuts:

```ts
// Bad: crosses a package boundary through a private-looking alias.
import { postJournal } from "#finance/actions/finance.post-journal.actions.server";
```

Use public doors for cross-package imports:

```ts
// Good
import { postJournal } from "@afenda/feature-finance/server";
```

Recommended package-local alias shape:

```json
{
  "imports": {
    "#schemas/*": {
      "types": "./src/schemas/*.ts",
      "development": "./src/schemas/*.ts",
      "default": "./dist/schemas/*.js"
    },
    "#policies/*": {
      "types": "./src/policies/*.ts",
      "development": "./src/policies/*.ts",
      "default": "./dist/policies/*.js"
    }
  }
}
```

Rules:

- `#` aliases are local to the declaring package.
- Use bucket-scoped aliases such as `#schemas/*` or `#policies/*`; avoid broad
  aliases such as `#/*` or `#src/*`.
- Keep exported package relationships on `@afenda/feature-<moduleId>`,
  `@afenda/feature-<moduleId>/server`, `./client`, and `./metadata`.
- Add `#` aliases on demand only when relative imports become noisy or unstable.

## Export Discipline

Bucket `index.ts` files may aggregate exports from that bucket, but public
consumers should still enter through one of the four package doors.

Recommended flow:

```txt
src/components/hr.employee-record-panel.component.client.tsx
src/components/index.ts
src/client.ts
```

```txt
src/actions/finance.post-journal.actions.server.ts
src/actions/index.ts
src/server.ts
```

Do not deep-import feature internals from the app:

```ts
// Bad
import { postJournal } from "@afenda/feature-finance/src/gl/actions/finance.post-journal.actions.server";
```

Use the public door:

```ts
// Good
import { postJournal } from "@afenda/feature-finance/server";
```

## Commands

```bash
pnpm scaffold:feature <moduleId>
pnpm scaffold:vertical <feature> <vertical>
pnpm architecture:check
```

The root `pnpm` command aliases delegate to `packages/_template-definition/scripts`.

Run `pnpm architecture:check` after changing this template, adding buckets,
adding verticals, or changing public doors.
