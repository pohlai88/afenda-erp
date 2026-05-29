# Roadmap & Tracking

Implementation plans, milestones, and draft feature specs live here (not in
`docs/architecture/`).

Search tip: tracking documents use **`TRACK-###`** IDs and matching **`00N-`**
filename prefixes (for example `TRACK-004` → `004-hrm-migration.md`), same
convention as architecture docs.

## Document Index

| ID            | File                                                                                                         | Topic                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **TRACK-001** | [001-ai-operation-execution-layer.md](001-ai-operation-execution-layer.md)                                   | AI operation execution layer — sandbox persistence, human approval, domain executors |
| **TRACK-002** | [002-workspace-package-discipline-upgrade.md](002-workspace-package-discipline-upgrade.md)                   | Package discipline rollout before large module migrations                            |
| **TRACK-003** | [003-ai-enterprise-uplift-scope-decisions.md](003-ai-enterprise-uplift-scope-decisions.md)                   | Final implement/cancel decisions for AI Enterprise Uplift "deferred" items           |
| **TRACK-004** | [004-hrm-migration.md](004-hrm-migration.md)                                                                 | HRM migration recovery: keep `@afenda/feature-hr-suite` scaffolded and migrate by slice    |
| **TRACK-005** | [005-lynx-knowledge-substrate.md](005-lynx-knowledge-substrate.md)                                           | Lynx machine layer + Knowledge substrate (pgvector, Truth Retrieval, Operator)       |
| **TRACK-006** | [006-lynx-readiness-layer-enterprise.md](006-lynx-readiness-layer-enterprise.md)                             | Enterprise readiness layer for Lynx governance, run ledger, Vercel controls          |
| **TRACK-007** | [007-lynx-erp-native-read-tools.md](007-lynx-erp-native-read-tools.md)                                       | Read-only finance, approval, and audit readiness tools for Lynx Operator             |
| **TRACK-008** | [008-lynx-evidence-trust-quality-gates.md](008-lynx-evidence-trust-quality-gates.md)                         | Claim-level evidence trust, quality gates, and run-console failure review            |
| **TRACK-009** | [009-lynx-durable-workflow-state.md](009-lynx-durable-workflow-state.md)                                     | Durable Lynx workflow sessions for reload-safe, resumable operator workflows         |
| **TRACK-010** | [010-lynx-proactive-outcome-agents.md](010-lynx-proactive-outcome-agents.md)                                 | Read-only proactive Lynx outcome monitors with cron-driven workflow review sessions  |
| **TRACK-011** | [011-lynx-enterprise-observability-policy-controls.md](011-lynx-enterprise-observability-policy-controls.md) | Lynx observability, eval depth, proactive controls, and runtime tool policy          |

## Placement Rules

- Stable architecture doctrine → `docs/architecture/` (**ARCH-###**).
- Roadmaps, drafts, and milestone plans → `docs/roadmap/` (**TRACK-###**).
- Link to architecture docs by ID (for example **ARCH-001**, **ARCH-006**) and
  numbered filenames.
