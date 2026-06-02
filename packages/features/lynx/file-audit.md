# Lynx File Audit

Scope: `packages/features/lynx`, excluding `node_modules`.

## Package Files

| File                  | Decision                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `AGENTS.md`           | Keep. Package-local agent rules now state that Zod belongs in `schemas/`.                |
| `README.md`           | Keep. Documents package role and current bucket ownership.                               |
| `package.json`        | Keep. Declares Lynx client-component dependencies after moving Lynx UI into the package. |
| `tsconfig.json`       | Keep. Includes `.tsx` because Lynx owns client components.                               |
| `tsconfig.build.json` | Keep. Includes `.tsx` for component declaration/build output.                            |
| `vitest.config.ts`    | Keep. Unit test runner only.                                                             |

## Public Doors

| File              | Decision                                                                      |
| ----------------- | ----------------------------------------------------------------------------- |
| `src/index.ts`    | Keep. Environment-neutral contract door.                                      |
| `src/client.ts`   | Keep. Browser-safe constants, schemas through contracts, and Lynx components. |
| `src/server.ts`   | Keep. Server-only data, tools, workflows.                                     |
| `src/metadata.ts` | Keep. Governed metadata door only.                                            |

## Components

| File                                                         | Decision                                                                                              |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `src/components/index.ts`                                    | Keep. Bucket barrel only.                                                                             |
| `src/components/lynx.chat-format.shared.ts`                  | Keep. Shared chat status, citation-linking, and allowed-link policy helpers.                          |
| `src/components/lynx.chat-elements.component.client.tsx`     | Keep. Lynx-specific message, evidence, tool, and prompt rendering.                                    |
| `src/components/lynx.operator-panel.component.client.tsx`    | Keep. Lynx operator product panel moved out of the app route tree.                                    |
| `src/components/lynx.panel.component.client.tsx`             | Keep. Shared Lynx panel, empty state, metric card, and evidence card primitives.                      |
| `src/components/lynx.run-feedback-form.component.client.tsx` | Keep. Lynx run feedback form moved out of app-owned shared components; app injects the Server Action. |
| `src/components/lynx.tool-output.component.client.tsx`       | Keep. Lynx-specific tool call, approval, payload, and ERP-read output rendering.                      |
| `src/components/lynx.tool-state.shared.ts`                   | Keep. Shared AI SDK tool-state label and tone mapping.                                                |
| `src/components/lynx.truth-panel.component.client.tsx`       | Keep. Lynx truth retrieval product panel moved out of the app route tree.                             |

## Contracts

| File                                             | Decision                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `src/contracts/index.ts`                         | Keep. Contract barrel.                                                                     |
| `src/contracts/lynx.core.contract.ts`            | Keep. Canonical Lynx constants and HTTP route constants.                                   |
| `src/contracts/lynx.erp-read-tools.contract.ts`  | Keep. Compatibility/type door; runtime schemas live in `schemas/`.                         |
| `src/contracts/lynx.evidence-trust.contract.ts`  | Keep. Evidence trust algorithms and compatibility re-exports for schemas.                  |
| `src/contracts/lynx.outcome-monitor.contract.ts` | Keep. Compatibility/type door; runtime schemas live in `schemas/`.                         |
| `src/contracts/lynx.readiness.contract.ts`       | Keep. Readiness thresholds and aggregate/eval helpers; runtime schemas live in `schemas/`. |
| `src/contracts/lynx.truth-prompt.contract.ts`    | Keep. Truth prompt construction.                                                           |
| `src/contracts/lynx.truth.contract.ts`           | Keep. Truth response parser/validator and compatibility re-exports for schemas.            |

## Schemas

| File                                         | Decision                                                   |
| -------------------------------------------- | ---------------------------------------------------------- |
| `src/schemas/index.ts`                       | Add. Schema bucket barrel.                                 |
| `src/schemas/lynx.erp-read-tools.schema.ts`  | Add. ERP read tool input/output schemas and derived types. |
| `src/schemas/lynx.evidence-trust.schema.ts`  | Add. Claim and quality-gate schemas and derived types.     |
| `src/schemas/lynx.knowledge-tools.schema.ts` | Add. Knowledge tool input schemas.                         |
| `src/schemas/lynx.outcome-monitor.schema.ts` | Add. Outcome monitor result schemas and derived types.     |
| `src/schemas/lynx.readiness-tools.schema.ts` | Add. Readiness tool input schema.                          |
| `src/schemas/lynx.readiness.schema.ts`       | Add. Readiness snapshot schemas and derived types.         |
| `src/schemas/lynx.truth.schema.ts`           | Add. Truth stream data schemas and derived types.          |

## Server Buckets

| File                                                    | Decision                                                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/data/index.ts`                                     | Keep. Data barrel.                                                                             |
| `src/data/lynx.readiness.query.server.ts`               | Keep. Server readiness query loader; imports schemas from `schemas/`.                          |
| `src/tools/index.ts`                                    | Keep. Tool barrel.                                                                             |
| `src/tools/lynx.erp-read-tools.tool.server.ts`          | Keep. Server ERP read tools; validation imports from `schemas/`.                               |
| `src/tools/lynx.knowledge.tool.server.ts`               | Keep. Knowledge tool factories; input schemas moved to `schemas/`.                             |
| `src/tools/lynx.readiness.tool.server.ts`               | Keep. Readiness tool factory; input schema moved to `schemas/`.                                |
| `src/tools/lynx.tool-meta.ts`                           | Keep. Governed metadata for every Lynx tool id.                                                |
| `src/workflows/index.ts`                                | Keep. Workflow barrel.                                                                         |
| `src/workflows/lynx.outcome-monitor.workflow.server.ts` | Keep. Server outcome sweep and pure monitor evaluation; result schema imports from `schemas/`. |

## Metadata Surfaces

| File                                            | Decision                                 |
| ----------------------------------------------- | ---------------------------------------- |
| `src/surface/index.ts`                         | Keep. Surface barrel.                    |
| `src/surface/lynx.observability.surface.ts`    | Keep. Observability metadata facade.     |
| `src/surface/lynx.outcome-monitor.surface.ts`  | Keep. Outcome monitor metadata facade.   |
| `src/surface/lynx.readiness.surface.ts`        | Keep. Readiness metadata facade.         |
| `src/surface/lynx.run-detail.surface.ts`       | Keep. Run detail metadata facade.        |
| `src/surface/lynx.run-management.surface.ts`   | Keep. Run management metadata facade.    |
| `src/surface/lynx.surface.shared.ts`           | Keep. Shared governed metadata builders. |
| `src/surface/lynx.workflow-session.surface.ts` | Keep. Workflow-session metadata facade.  |

## Tests

| File                                         | Decision                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| `tests/unit/chat-format.test.ts`             | Keep. Validates chat status, citation, allowed-link, and tool-state mapping. |
| `tests/unit/erp-read-tools-contract.test.ts` | Keep. Validates ERP read tool schemas through compatibility exports.         |
| `tests/unit/evidence-trust-contract.test.ts` | Keep. Validates evidence trust behavior.                                     |
| `tests/unit/metadata.test.ts`                | Keep. Validates governed metadata output.                                    |
| `tests/unit/outcome-monitors.test.ts`        | Keep. Validates deterministic monitor behavior.                              |
| `tests/unit/readiness-contract.test.ts`      | Keep. Validates readiness schemas and aggregate helpers.                     |
| `tests/unit/tool-meta.test.ts`               | Keep. Ensures every Lynx tool has governed metadata.                         |
| `tests/unit/truth-contract.test.ts`          | Keep. Validates canonical Truth response contract.                           |

## Removed Generated Output

`dist/` and `.turbo/` were removed from this package directory. They contained
stale output from older bucket names and are generated artifacts, not source.
