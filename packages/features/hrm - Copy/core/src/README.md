# Human resources (`packages/features/hrm`)

HRM is split into bounded-context packages under
`packages/features/hrm/<bounded-context>`. Core owns shared registry,
navigation, governance, row-link, rail, snapshot, and cross-cutting contracts.
Route-only HRM app composition lives in
`@afenda/feature-hrm-route-composition`; bounded-context server/client
integration lives in each owning package.

Use these import doors:

- **`@afenda/feature-hrm-route-composition`** — HRM app route composition only (`/apps/hrm` overview, fallback segment page, app chrome).
- **`@afenda/feature-hrm-core/client`** — narrow client-safe HRM paths, types, and hooks.
- **`@afenda/feature-hrm-<context>/{server,client,schemas,testing}`** — bounded-context public doors for new package-to-package integration.

Cross-module callers must not deep-import HRM implementation folders from
outside the owning package.

Internal-only folders: `_module-governance/` (mutation guards), `_internal-cross-cutting/` (rail, snapshot, Nexus export). See each folder’s README.

Phase 9 modular-monolith planning is captured in `contracts/hrm-bounded-context-plan.shared.ts`.
It assigns every current HRM root file and top-level segment to
`@afenda/feature-hrm-core`, `@afenda/feature-hrm-employee-management`,
`@afenda/feature-hrm-time-attendance`,
`@afenda/feature-hrm-payroll-compensation`,
`@afenda/feature-hrm-talent-management`, and
`@afenda/feature-hrm-industry-specific`.
A single `@afenda/feature-hrm` big-bang package is forbidden.
Each subdomain also records its functional domains before functional files move.
All six `@afenda/feature-hrm-*` workspace package doors are active under
`packages/features/hrm/<bounded-context>`. The previous suite aggregate has
been removed; cross-context imports now move through explicit package
integration ports.
Each package also records executable integration-door contracts with the
future public door (`./server`, `./client`, etc.), the current compatibility
door, and the blocker that must be removed before functional files can move.

**Integration ports (active):**

| Door                    | Package import                                               | Notes                                                                                   |
| ----------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Employee list row links | `@afenda/feature-hrm-employee-management/employee-row-links` | `hrmEmployeeListRowLinkFields`, `hrmGovernedListRowLinkFields`, `mapHrmEmployeeListRow` |
| Compatibility shim      | `#features/hrm/hrm-employee-list-surface-rows.shared`        | Core-owned row-link helper compatibility path to `shared/hrm-employee-list-surface-rows.shared.ts` |

Cross-subdomain HRM imports must use `@afenda/feature-hrm-<context>/{server,client,schemas,employee-row-links}` — not `#features/hrm/<segment>/.../data`.
