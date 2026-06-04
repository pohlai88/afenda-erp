# @afenda/metadata-ui — architectural law

This document governs **behavior, boundaries, and dependency direction**.

Enterprise agents must optimize for these laws first. Physical folders are a consequence of the law, not the source of truth.

Operational checklist and validation commands: [AGENTS.md](./AGENTS.md).

Package charter (frozen): [README.md](./README.md).

---

## Mission

`@afenda/metadata-ui` is the canonical runtime that transforms metadata contracts into enterprise user interfaces.

It owns metadata contracts, validation, registries, rendering, runtime boundaries, shell and section composition, presentation resolution, diagnostics identity, and interaction wiring.

It does **not** own business behavior. ERP feature packages own domain decisions, workflow decisions, and domain execution.

Metadata UI owns rendering, composition, presentation, and runtime enforcement.

---

## Ownership

| Concern | Owns |
| --- | --- |
| Contracts | component, section, renderer, runtime, presentation |
| Schemas | Zod models, parsing, validation, migration compatibility |
| Registry | component and renderer registration — source of truth for what renders |
| Runtime | boundary enforcement, dispatch, diagnostics |
| Security | permission-aware rendering, action wiring |
| Shell | section chrome, headings, empty states, body resolution |
| Sections | per-kind schema, builder, server surface, client islands |
| Renderers | metadata-driven composition of registered sections |
| Platform UI | identity attributes, test ids, render logging |

---

## Runtime Law

**Every source file belongs to exactly one runtime. A file must never mix runtimes.**

This is the most important rule in the package.

| Runtime | Allowed | Forbidden |
| --- | --- | --- |
| **shared** | pure TypeScript, schemas, contracts, builders, registry definitions | React, hooks, browser APIs, server APIs, `"use client"`, `import "server-only"` |
| **server** | server components, permission gates, renderer composition, server utilities, logging | `"use client"`, browser APIs, client hooks |
| **client** | interactive UI, hooks, drag-and-drop, table state, browser APIs | server-only module imports, server component exports |
| **action** | server actions, mutation entrypoints | UI rendering, React components |

Filename suffixes express runtime (enforced by GUARD 6):

```txt
.shared.ts | .schema.ts | .contract.ts | .builder.ts | .registry.ts
.server.ts | .server.tsx
.client.ts | .client.tsx
.action.ts
```

---

## Public Doors

`metadata-ui` exposes exactly three runtime doors. Door exports must not cross runtime boundaries.

### `index.ts` — shared runtime only

**Allowed:** contracts, schemas, builders, shared helpers, registry types usable on both sides.

**Forbidden:** server components, client components, server-only modules, `"use client"` modules.

### `client.ts` — client runtime only

**Allowed:** client components, client renderers, interactive islands.

**Forbidden:** server-only modules, server components, anything that requires the server door.

### `server.ts` — server runtime only

**Allowed:** server components, server renderers, permission infrastructure, server logging.

**Forbidden:** client modules, `"use client"` exports.

Server-only modules must be protected by runtime boundaries (`import "server-only"` where appropriate).

Server components and server infrastructure must never be exported through the client door.

---

## Dependency Direction

Dependencies must only point **downward** along the primary chain. Mutual or upward imports are architecture defects.

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

Rendering orchestration belongs to the runtime layer. Implementations may evolve, but runtime orchestration must not depend on section implementations.

**Allowed:** upper layers import from lower layers on the primary chain.

**Forbidden:** any reverse edge along the primary chain above.

Presentation services are cross-cutting and may be consumed by runtime, shell, and sections provided dependency cycles are not introduced.

Other cross-cutting concerns (`identity`, `security`, `logging`, `server-actions`, `migration`) follow the same rule: consume downward or laterally without cycles.

Enforced by GUARD 6 — see [AGENTS.md](./AGENTS.md).

---

## Registry Law

Metadata UI is registry-driven. The registry is the center of the package.

Every renderable section **must** be registered.

Registry modules are the only permitted render discovery mechanism.

Filesystem scanning, dynamic import discovery, naming-convention discovery, and barrel-based discovery are prohibited.

All section kinds resolve through:

* **component registry** — what can render
* **renderer registry** — how dispatch selects a renderer

Registry is the source of truth. If it is not registered, it does not render.

---

## Section Contract

Every section kind owns a complete vertical slice:

| Artifact | Runtime | Role |
| --- | --- | --- |
| `{kind}.schema.ts` | shared | validated metadata shape |
| `{kind}.builder.ts` | shared | config/model construction |
| `{kind}-section.server.tsx` | server | section shell entry |
| `{kind}-renderer.server.tsx` | server | registered renderer |
| `{kind}-*.client.tsx` | client | optional interaction islands |

Example — list:

```txt
list.schema.ts
list.builder.ts
list-section.server.tsx
list-renderer.server.tsx
list-table.client.tsx
```

Adding a section kind is deterministic: schema → builder → register → server section → server renderer → client islands (if needed).

---

## Explicitly Forbidden

### ERP domain logic

Never place finance, accounting, HR, payroll, inventory, purchasing, manufacturing, or CRM rules in this package.

### Tenant business rules

Never encode approval chains, workflow policies, posting rules, organization policies, or role matrices inside renderers.

### ERP data access

Never query ERP repositories, execute ERP services, or call domain commands from renderers.

Metadata UI consumes contracts. It does not own business execution.

---

## Naming Convention

Mandatory: `{purpose}.{runtime}.ts(x)` — responsibility, not history.

```txt
list-section.server.tsx
list-table.client.tsx
permission-gate.server.ts
component-registry.shared.ts
list.schema.ts
list.builder.ts
```

Forbidden: `gov-*`, `governed-*`, `*-surface-*`, `*-helper-*`, `*-utils-*`

Enforced by `pnpm guard:metadata-ui` (GUARD 6).

---

## Validation

After any change:

1. `@afenda/metadata-ui` remains registered in `scripts/check-directory-architecture.mts`
2. `pnpm guard:metadata-ui` — client/server/action runtime markers, naming, door purity, dependency direction, registry compliance, section contract
3. `pnpm architecture:check`
4. `pnpm --filter @afenda/metadata-ui lint`
5. Verify door purity:
   - `client.ts` exports no server modules
   - `server.ts` exports no client modules
   - `index.ts` exports no runtime-specific modules

Failure of any rule is an architecture defect.

---

## North Star

Metadata UI is not a component library.

Metadata UI is not an ERP module.

Metadata UI is the runtime engine that converts metadata contracts into enterprise experiences while enforcing runtime boundaries, registry-driven dispatch, presentation consistency, and architectural governance.

---

## Migration

Incremental migration sequence:

```txt
contracts → schemas → registry → runtime → shell → sections
```

Migration is complete when no feature package imports `@afenda/governed-surface`, all metadata rendering flows through `@afenda/metadata-ui`, package doors enforce runtime boundaries, and GUARD 6 plus `architecture:check` pass.

---

## Appendix — conventional layout (non-normative)

Folders mirror responsibility for navigation only. If layout and law conflict, **law wins**.

Typical placement: `contracts/`, `schemas/`, `registry/`, `runtime/`, `identity/`, `security/`, `shell/`, `sections/<kind>/`, `renderers/`, `presentation/`, `server-actions/`, `logging/`, `migration/`, `tests/`.

Section kinds in use: list, stat, chart, action-bar, form, kanban, audit-panel, detail-tabs, page-header.
