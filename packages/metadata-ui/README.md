# @afenda/metadata-ui

Metadata-driven UI runtime for Afenda ERP.

`@afenda/metadata-ui` is the runtime engine that converts metadata contracts into enterprise user experiences.

The package owns:

* metadata contracts
* metadata schemas
* renderer registries
* section composition
* presentation resolution
* runtime boundaries
* UI identity and diagnostics
* metadata rendering infrastructure

The package does not own ERP business behavior.

Metadata UI owns rendering, composition, presentation, and runtime enforcement.

Feature packages own business behavior, workflow decisions, and domain execution.

---

## Package Classification

Category: `runtime-library`

Architecture Authority: ARCH-1002 §6

Implementation governance: [AGENTS.md](./AGENTS.md) · Architectural law: [architecture.md](./architecture.md)

---

## Forbidden

Never place inside this package:

* finance logic
* accounting rules
* HR rules
* payroll calculations
* purchasing policies
* inventory policies
* manufacturing policies
* approval business rules

---

## Runtime Doors

### Shared Runtime

```ts
import { ... } from "@afenda/metadata-ui";
```

Exports: contracts, schemas, builders, presentation helpers, identity helpers.

Must remain runtime-neutral.

### Client Runtime

```ts
import { ... } from "@afenda/metadata-ui/client";
```

Exports: client components, interactive section primitives, client registries.

### Server Runtime

```ts
import { ... } from "@afenda/metadata-ui/server";
```

Exports: server renderers, section composition, shell infrastructure, permission-aware rendering, metadata runtime orchestration.

### Runtime Boundary

A runtime door may only export artifacts belonging to its runtime.

Examples:

* `@afenda/metadata-ui/server` must never export client modules.
* `@afenda/metadata-ui/client` must never export server modules.
* `@afenda/metadata-ui` must remain runtime-neutral.

Enforced by `pnpm guard:metadata-ui`.

---

## Lifecycle Status

Current phase: **Scaffold**

The package currently defines architecture boundaries, runtime contracts, and migration targets.

Production rendering remains owned by `@afenda/governed-surface` until migration is formally approved and executed.

---

## Architecture Validation

Required checks:

```bash
pnpm guard:metadata-ui
pnpm architecture:check
pnpm --filter @afenda/metadata-ui lint
```

All checks must pass before merge.
