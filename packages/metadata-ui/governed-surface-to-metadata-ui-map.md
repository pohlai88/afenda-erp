# Governed Surface To Metadata UI Map

This document is the P01 mapping matrix for replacing
`@afenda/governed-surface` with `@afenda/metadata-ui`.

Status labels:

| Status | Meaning |
| --- | --- |
| covered | Metadata-ui already has a target contract, builder, renderer, and tests. |
| partial | Metadata-ui has a target, but governed behavior is not fully represented. |
| missing | Metadata-ui needs a new first-class section, schema, builder, renderer, or adapter. |
| adapter-only | Runtime replacement exists; migration needs a shared config adapter. |
| retire | Do not recreate; replace with stricter metadata-ui runtime governance. |

Risk labels:

| Risk | Meaning |
| --- | --- |
| low | Can migrate after package build, guard, tests, and basic visual evidence. |
| medium | Needs adapter parity and targeted visual/accessibility evidence. |
| high | Needs new implementation slice and certification before migration. |
| blocked | Do not migrate until the assigned slice is complete. |

---

## Section Kind Map

| Governed kind/export family | Metadata-ui target | Status | Risk | Closing slice |
| --- | --- | --- | --- | --- |
| `governed:action-bar`, `gov-action-bar-*`, `gov-governed-pattern-b-action-bar-section` | `action-bar` schema, builder, renderer, action lifecycle | covered | low | complete |
| `governed:list`, `gov-list-surface-*`, `gov-governed-pattern-c-list-section` | `list` schema, builder, TanStack table, toolbar, virtualization, trailing cells | covered | low | P05 complete |
| `gov-list-surface-row-trailing-action-*`, `gov-governed-list-trailing-cell-registry-client`, trailing action slots | list trailing cell descriptors and registered client islands | covered | low | P05 complete |
| `governed:stat-card`, `gov-stat-card-*`, `gov-governed-pattern-b-stat-section` | `stat` schema, builder, renderer, NumberFlow value island | partial | medium | P09/P10 |
| `governed:chart`, `gov-chart-*`, `gov-governed-pattern-b-chart-section` | `chart` schema, builder, renderer, Recharts body, heatmap, annotations, reference bands | covered | low | P07 complete |
| `gov-chart-heatmap-body-client` | chart heatmap metadata and table fallback | covered | low | P07 complete |
| `ChartAnnotation`, `ChartReferenceBand`, `referenceBands`, `annotations` | chart annotations and reference band metadata | covered | low | P07 complete |
| `governed:audit-panel`, `gov-audit-panel-*` | `audit-panel` schema, builder, renderer | covered | low | complete |
| `governed:detail-tabs`, `gov-detail-tabs-*`, `gov-detail-section-adapter` | `detail-tabs` schema, builder, renderer | partial | medium | P10 |
| `gov-module-page-header` | `page-header` schema, builder, server section | covered | low | complete |
| `gov-empty-*`, `gov-governed-empty`, `gov-empty-renderer` | empty-state schema, builder, shell empty primitive | covered | low | complete |
| `governed:kanban`, `gov-kanban-*`, kanban drag/read-only/footer exports | `kanban` schema, builder, renderer, drag board client island, hints, footer | covered | low | P08 complete |
| `gov-governed-kanban-transition-hint-client` | kanban transition hint descriptors | covered | low | P08 complete |
| `gov-governed-kanban-footer-section`, `gov-governed-kanban-footer-board-client` | kanban footer summary/actions metadata | covered | low | P08 complete |
| `governed:approval-timeline`, `gov-approval-timeline-*` | approval timeline schema, builder, renderer, adapter | covered | low | P02 complete |
| `governed:multi-step-form`, `gov-multi-step-form-*` | multi-step form section | covered | low | P03 complete |
| `governed:scorecard-form`, `gov-scorecard-form-*` | scorecard form section | covered | low | P04 complete |
| `governed:stack`, `gov-stack-*`, stack renderer | metadata-ui render stack | partial | medium | P10 |
| `gov-governed-component-tree`, `gov-render-governed-component`, `gov-section-renderer` | metadata-ui renderers and registries | partial | medium | P10 |

---

## Shared API Map

| Governed shared export family | Metadata-ui target | Status | Risk | Closing slice |
| --- | --- | --- | --- | --- |
| `GOVERNED_METADATA_SCHEMA_VERSION` | metadata-ui runtime contracts | adapter-only | low | P10 |
| `ERP_FUNCTIONS`, `ErpPermissionTuple`, `erpPermissionRequirementSchema` | metadata-ui capability requirements and route policy | covered | low | P09 complete |
| `resolveErpCapabilityForPermission` | governed permission tuple adapter | covered | low | P09 complete |
| `actionDescriptorSchema`, `ActionDescriptor` | metadata-ui action contract | partial | medium | P09 |
| `gov-server-actions-shared` registry/submission helpers | metadata-ui action registry and action lifecycle | partial | medium | P10 |
| `gov-list-surface-schema`, `gov-list-surface-renderer-schema` | metadata-ui list schema and table state | partial | medium | P05 |
| `gov-list-surface-toolbar-schema` | metadata-ui list toolbar metadata | covered | low | complete |
| `gov-list-surface-row-trailing-action-schema` | metadata-ui trailing cell/action descriptors | covered | low | P05 complete |
| `gov-stat-card-schema` | metadata-ui stat schema and migration adapter | partial | medium | P09/P10 |
| `gov-chart-schema` | metadata-ui chart schema | covered | low | P07 complete |
| `gov-approval-timeline-schema` | approval timeline schema and config-only adapter | covered | low | P02 complete |
| `gov-multi-step-form-schema` | multi-step form schema | covered | low | P03 complete |
| `gov-scorecard-form-schema` | scorecard form schema | covered | low | P04 complete |
| `gov-section-schema`, `gov-component-schema`, `gov-component-registry-schema` | metadata-ui section/component/registry contracts | partial | medium | P10 |
| `gov-stack-schema` | metadata-ui render stack and layout metadata | partial | medium | P10 |
| `gov-surface-chrome-schema`, `gov-surface-chrome-classes` | metadata-ui surface chrome and presentation resolvers | covered | low | P09 complete |
| `gov-presentation-profile-schema`, governed presentation profiles | metadata-ui presentation profiles and compatibility adapter | covered | low | P09 complete |
| `kanban-workflow.shared`, `kanban-card-transition.shared`, `kanban-card-drop.shared` | metadata-ui kanban state and display-only transition metadata | covered | low | P08 complete |
| `list-surface-toolbar-url.shared` | host-owned URL/query behavior | retire | medium | P10 |
| `form-rules.evaluate.shared` | host-owned form state/validation descriptors | partial | high | P03/P06 |
| `migrate-governed-configuration.shared` | metadata-ui migration adapters | partial | medium | P10 |
| governed identity/diagnostics helpers | metadata-ui identity and diagnostics helpers | covered | low | complete |
| governed safe route helpers | host route ownership, metadata-ui action navigation descriptors | retire | medium | P10 |

---

## Server Door Map

| Governed server export | Metadata-ui target | Status | Risk | Closing slice |
| --- | --- | --- | --- | --- |
| `build-list-surface-table-props.shared` | `table-state.shared` model builders | partial | medium | P05 |
| `resolve-metadata-section-body.server` | `section-body-resolver.server` | covered | low | complete |
| `log-governed-list-surface-render.server` | `list-render-log.server` | covered | low | complete |
| `gov-governed-permission-gate-server` | `permission-gate.server.tsx` | covered | low | complete |
| `gov-list-surface-trailing-action-server` | metadata-ui trailing action descriptors | missing | high | P05 |
| `gov-governed-heading.server` | `heading.server.tsx` | covered | low | complete |
| pattern B action/stat/chart sections | metadata-ui section renderers | partial | medium | P07/P10 |
| pattern B approval timeline section | approval timeline renderer | covered | low | P02 complete |
| pattern B multi-step form section | multi-step form renderer | missing | blocked | P03 |
| pattern B scorecard form section | scorecard form renderer | missing | blocked | P04 |
| pattern C list section | list renderer/table client islands | partial | medium | P05 |
| `gov-render-governed-component` | metadata-ui render component/section/stack | partial | medium | P10 |

---

## Client Door Map

| Governed client export | Metadata-ui target | Status | Risk | Closing slice |
| --- | --- | --- | --- | --- |
| action bar action client | action lifecycle plus host action registry | partial | medium | P10 |
| chart renderer body client | `chart-body.client.tsx` | partial | high | P07 |
| chart heatmap body client | heatmap client body | missing | high | P07 |
| data table/list table clients | `list-table.client.tsx`, virtual window, toolbar | partial | medium | P05 |
| list toolbar client | `list-toolbar.client.tsx` | covered | low | complete |
| list cell client | table cell descriptors | partial | medium | P05 |
| list sparkline client | stat/chart mini visualization or retired visual note | partial | medium | P10 |
| trailing cell registry/client/trailing action slot | metadata-ui trailing cell registry | missing | high | P05 |
| file upload field client | host upload field affordance | partial | high | P06 |
| kanban drag/read-only/footer/transition clients | kanban client island plus display metadata | partial | high | P08 |
| multi-step form client/renderer | multi-step form section and client island | missing | blocked | P03 |
| scorecard form client/renderer | scorecard form section and client island | missing | blocked | P04 |
| approval timeline renderer | approval timeline server renderer | covered | low | P02 complete |
| governed component tree/renderer dispatch/section | metadata-ui registries and renderers | partial | medium | P10 |
| stat card body client | stat value client island | partial | medium | P09/P10 |
| surface chrome classes | metadata-ui presentation/chrome resolvers | partial | medium | P09 |

---

## Slice Assignment Summary

| Slice | Assigned gaps | Migration effect |
| --- | --- | --- |
| P02 | approval timeline schema, builder, renderer, adapter | complete; unblocks approval flow surfaces after visual evidence |
| P03 | multi-step form schema, builder, renderer, step client island, adapter | unblocks wizard-like form surfaces |
| P04 | scorecard form schema, builder, renderer, score client island, adapter | unblocks scoring form surfaces |
| P05 | list trailing cells, trailing actions, metadata trailing registry | unblocks dense list pages with custom trailing cells |
| P06 | file upload field parity, host upload affordance | unblocks forms with upload descriptors |
| P07 | heatmap, annotations, reference bands | unblocks complex chart surfaces |
| P08 | kanban transition hints, read-only board, footer summaries/actions | unblocks governed kanban pages |
| P09 | presentation profile, chrome, ERP permission tuple adapters | unblocks config compatibility and fail-closed permission migration |
| P10 | full map certification, stack/component parity, final freeze gate | unblocks feature-by-feature migration start |

---

## Replacement Gate Inputs

Every target feature page must provide these inputs to
`createMetadataUiReplacementReadiness` before governed-surface imports are
removed:

| Input | Required evidence |
| --- | --- |
| `target.featureKey` | stable feature/page identifier |
| `target.surfaces` | exact metadata-ui surface kinds used by the target |
| `parityNotes` | adapter output for all governed configs on the page |
| `guardPassed` | `pnpm guard:metadata-ui` |
| `packageBuildPassed` | `pnpm --filter @afenda/metadata-ui build` |
| `packageTestsPassed` | `pnpm --filter @afenda/metadata-ui test` |
| `visualCertificationPassed` | E10/P10 desktop and mobile artifacts for the target surfaces |
| `importAuditPassed` | target feature has no governed-surface-only behavior |

Fail-closed rule: any unsupported parity note on a target surface blocks
replacement unless the mapped slice marks the behavior intentionally retired.

---

## Migration Policy

Do not replace feature imports globally.

Do not add governed-surface runtime imports to metadata-ui.

Do not recreate governed-surface naming, filesystem discovery, or hidden
renderer shims.

Do not move ERP policy, workflow policy, tenant policy, storage policy, or
domain command execution into metadata-ui.

Migration may begin only after P10 records that all high-risk mapped gaps are
covered or intentionally retired.
