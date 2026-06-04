# @afenda/metadata-ui

Platform Package — ARCH-1002 §6

Category: `runtime-library`

Package charter: [README.md](./README.md) (frozen — do not expand).

Architectural law: [architecture.md](./architecture.md)

---

## Mission

`@afenda/metadata-ui` is the canonical runtime responsible for transforming metadata contracts into enterprise user interfaces.

Metadata UI owns rendering, composition, presentation, and runtime enforcement.

Feature packages own business behavior, workflow decisions, and domain execution.

---

# Runtime Law

Every source file belongs to exactly one runtime:

* **shared** — pure TypeScript, schemas, contracts, builders
* **server** — server components, permission gates, renderer composition
* **client** — interactive UI, hooks, browser APIs
* **action** — server actions and mutation entrypoints

Files must never mix runtime responsibilities.

Runtime determines file naming:

```txt
*.shared.ts | *.schema.ts | *.contract.ts | *.builder.ts | *.registry.ts
*.server.ts | *.server.tsx
*.client.ts | *.client.tsx
*.action.ts
```

Enforced by GUARD 6 (`pnpm guard:metadata-ui`):

```txt
Client runtime — *.client.tsx must contain "use client"
Server runtime — *.server.ts(x) must not contain "use client"
Action runtime — *.action.ts(x) must contain "use server" or satisfy action registration
```

Server modules such as `permission-gate.server.ts` and `list-section.server.tsx` do **not** require `"use server"`.

---

# Registry Law

Renderable artifacts must be registered.

Registry modules are the only permitted render discovery mechanism.

Filesystem scanning, dynamic import discovery, naming-convention discovery, and barrel-based discovery are prohibited.

Component registry and renderer registry are the source of truth.

If it is not registered, it does not render.

When `renderer-registry.server.ts` is no longer a placeholder, every `*-renderer.server.tsx` must appear in the registry module.

---

# Dependency Direction

Dependencies flow downward along the primary chain only.

```txt
contracts
↓
schemas
↓
registry
↓
runtime
↓
shell
↓
sections
```

Reverse dependencies on the primary chain are architecture violations.

Presentation is cross-cutting — it may be consumed by runtime, shell, and sections when no dependency cycles are introduced.

Other cross-cutting folders (`identity`, `security`, `logging`, `server-actions`, `migration`) follow the same rule.

Enforced by GUARD 6 import analysis.

---

# Section Contract

Every section kind owns:

| Artifact | Runtime | Example |
| --- | --- | --- |
| schema | shared | `list.schema.ts` |
| builder | shared | `list.builder.ts` |
| section | server | `list-section.server.tsx` |
| renderer | server | `list-renderer.server.tsx` |
| client islands | client | `list-table.client.tsx` (optional) |

Adding a section kind: schema → builder → register → server section → server renderer → client islands (if needed).

Section artifact presence is enforced by GUARD 6.

---

# Runtime Doors

See [README.md](./README.md#runtime-doors) for import paths.

### Runtime Boundary

A runtime door may only export artifacts belonging to its runtime.

* `@afenda/metadata-ui` — shared exports only; runtime-neutral
* `@afenda/metadata-ui/client` — client exports only
* `@afenda/metadata-ui/server` — server and action exports only

Door export purity is enforced by GUARD 6.

---

# Naming Convention

Mandatory: `{purpose}.{runtime}.ts(x)`

Forbidden: `gov-*`, `governed-*`, `*-surface-*`, `*-helper-*`, `*-utils-*`

Names describe responsibility, not history.

---

# Migration

Migration is incremental. Do not move feature packages directly.

Preferred sequence:

```txt
contracts → schemas → registry → runtime → shell → sections
```

Presentation and other cross-cutting modules migrate alongside runtime and shell as needed.

Preserve backward compatibility during migration.

Feature packages continue using `@afenda/governed-surface` until migration plans are approved.

### Migration Completion

Migration is complete when:

* no feature package imports `@afenda/governed-surface`
* all metadata rendering occurs through `@afenda/metadata-ui`
* runtime boundaries are enforced by package doors
* `pnpm guard:metadata-ui` passes
* `pnpm architecture:check` passes

---

# Explicitly Forbidden

## ERP Domain Logic

Never place finance, accounting, HR, payroll, inventory, purchasing, manufacturing, or CRM rules in this package.

## Tenant Business Rules

Never encode approval chains, workflow policies, posting rules, organization policies, or role matrices inside renderers.

## ERP Data Access

Never query ERP repositories, execute ERP services, or call domain commands from renderers.

Metadata UI consumes contracts. It does not own business execution.

---

# Architecture Validation

After changes:

1. `@afenda/metadata-ui` remains registered in `scripts/check-directory-architecture.mts`
2. `pnpm guard:metadata-ui` — enforces:
   - **Client runtime** — `*.client.tsx` must contain `"use client"`
   - **Server runtime** — `*.server.ts(x)` must not contain `"use client"`
   - **Action runtime** — `*.action.ts(x)` must contain `"use server"` or satisfy action registration
   - **Naming** — purpose.runtime suffixes; rejects `gov-*`, `governed-*`, `*-surface-*`
   - **Door purity** — shared / client / server export boundaries
   - **Dependencies** — downward primary chain; cross-cutting without cycles
   - **Registry** — required registry modules; no prohibited discovery; renderer registration when implemented
   - **Section contract** — schema, builder, section entry, renderer per kind (by artifact name, not folder path)
3. `pnpm architecture:check`
4. `pnpm --filter @afenda/metadata-ui lint`

Failure of any rule is an architecture defect.

---

# North Star

Metadata UI is not a component library.

Metadata UI is not an ERP module.

Metadata UI is the runtime engine that converts metadata contracts into enterprise user experiences while enforcing runtime boundaries, presentation consistency, and architectural governance.
