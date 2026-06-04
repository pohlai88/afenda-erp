# @afenda/metadata-ui - governed parity upgrade slices

This plan defines the missing and partial governed-surface parity work to finish
before feature migration begins.

Controlling law: [architecture.md](./architecture.md).

Predecessors:

* [implementation-slices.md](./implementation-slices.md)
* [enterprise-hardening-slices.md](./enterprise-hardening-slices.md)

Goal: raise metadata-ui governed replacement readiness from **8.7/10** to
**9.6/10** without importing governed-surface, feature packages, ERP
repositories, object-storage, tenant session internals, or domain commands.

Each slice must preserve runtime suffix law, package door purity, registry law,
and the metadata-ui dependency direction.

---

## Upgrade Target

| Capability | Current state | Target state |
| --- | --- | --- |
| Approval timeline | missing | first-class metadata-ui section |
| Multi-step form | missing | first-class metadata-ui section with host-owned submission |
| Scorecard form | missing | first-class metadata-ui section with host-owned scoring submission |
| List trailing cells | partial | serializable trailing cell registry and client island |
| File upload fields | partial | host-upload client affordance without storage logic |
| Chart heatmap/annotations/reference bands | partial | Recharts/metadata-backed parity with table fallback |
| Kanban transition/read-only/footer behavior | partial | explicit metadata for hints, footer actions, and read-only boards |
| Presentation profiles/chrome | partial | governed profile compatibility adapter and tests |
| Permission/capability mapping | partial | governed ERP tuple adapter to metadata-ui capabilities |
| Replacement map/certification | partial | complete mapping matrix and evidence requirements |

---

## Common Acceptance

Run after every slice unless the slice says otherwise:

```bash
pnpm --filter @afenda/metadata-ui build
pnpm guard:metadata-ui
pnpm --filter @afenda/metadata-ui test
```

Do not run full repo-wide checks after doc-only edits unless the slice requires
it.

---

## Slice P01 - Governed Replacement Mapping Matrix

Purpose: create the canonical mapping from governed-surface exports and section
kinds to metadata-ui targets before further implementation.

Target roots:

```txt
governed-surface-to-metadata-ui-map.md
src/migration/
src/tests/
```

Work:

* map governed shared, server, client, metadata, and schema exports
* classify every item as covered, partial, missing, adapter-only, or retire
* assign each missing/partial item to one of P02-P10
* add replacement risk: low, medium, high, blocked
* document migration blockers and visual certification requirements

Do not build:

* code changes beyond optional source-boundary tests
* feature migration
* broad compatibility shims

Completion criteria:

* every known governed section kind has a target metadata-ui status
* the map names the exact slice that closes each gap
* replacement readiness gate inputs are documented

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| section map | governed section/export families are classified as covered, partial, missing, adapter-only, or retire | `governed-surface-to-metadata-ui-map.md` |
| door map | governed shared, server, and client export families are mapped to metadata-ui targets | `governed-surface-to-metadata-ui-map.md` |
| gap assignment | every missing or partial high-risk capability is assigned to P02-P10 | `governed-surface-to-metadata-ui-map.md` |
| replacement evidence | replacement readiness gate inputs and fail-closed parity behavior are documented | `governed-surface-to-metadata-ui-map.md` |

Status: complete.

---

## Slice P02 - Approval Timeline Section

Purpose: replace governed approval timeline as a metadata-ui section without
embedding approval policy.

Target roots:

```txt
src/schemas/approval-timeline.schema.ts
src/builders/approval-timeline.builder.ts
src/sections/approval-timeline/
src/migration/
src/tests/
src/server.ts
src/index.ts
```

Work:

* add approval timeline schema for steps, status, actor, timestamp, comments,
  current step, pending step, failed step, and blocked step
* render timeline through server section and server renderer
* expose status labels, empty state, and validation failure states accessibly
* keep approval-chain policy host-owned
* add governed approval timeline adapter with parity notes
* register the renderer and section capability

Do not build:

* approval workflow policy
* tenant role matrices
* command execution
* feature imports

Completion criteria:

* approval timeline is schema -> builder -> registry -> section -> renderer
* adapter covers governed approval timeline config
* tests cover empty, pending, approved, rejected, blocked, and invalid states

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| schema | approval timeline metadata validates bounded steps, statuses, actors, current step, and failure reasons | `src/schemas/approval-timeline.schema.ts` |
| builder | typed helpers create timelines and steps without exposing policy execution | `src/builders/approval-timeline.builder.ts` |
| renderer | server renderer exposes status labels, current step, actor, time, comments, reasons, and empty state | `src/sections/approval-timeline/approval-timeline-renderer.server.tsx` |
| registry | approval timeline is registered as a server renderer and capability-bearing section kind | `src/registry/renderer-registry.server.ts`, `src/registry/section-capability-registry.server.ts` |
| migration | legacy approval timeline configs adapt to metadata-ui with host-owned policy parity notes | `src/migration/approval-timeline-migration.shared.ts` |
| tests | approval states, invalid reasons, adapter behavior, and source boundaries are covered | `src/tests/approval-timeline-test.shared.ts` |

Status: complete.

---

## Slice P03 - Multi-Step Form Section

Purpose: replace governed multi-step form with a metadata-ui section while
keeping validation and submission host-owned.

Target roots:

```txt
src/schemas/multi-step-form.schema.ts
src/builders/multi-step-form.builder.ts
src/sections/multi-step-form/
src/runtime/
src/migration/
src/tests/
src/client.ts
src/server.ts
src/index.ts
```

Work:

* add metadata contract for steps, fields, step state, progress, navigation,
  validation summary, and host action descriptors
* add a client island for local step navigation only
* render fields through existing field primitives
* keep submission through metadata-ui action registry only
* adapt governed multi-step form config into metadata-ui config

Do not build:

* business validation engine
* direct `FormData` mutation execution in renderers
* object-storage upload logic
* feature workflow decisions

Completion criteria:

* step navigation is local UI state only
* action execution remains fail-closed
* tests cover invalid active step, disabled step, readonly step, error summary,
  and no fetch/storage behavior

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| schema | steps, active step, step state, field sections, and host submit action are validated | `src/schemas/multi-step-form.schema.ts` |
| renderer | server renderer exposes progress, active step, error summary, fields, and host submit action | `src/sections/multi-step-form/multi-step-form-renderer.server.tsx` |
| registry | multi-step form is registered as a server-rendered section | `src/registry/renderer-registry.server.ts` |
| tests | invalid active step, blocked step, and door wiring are covered | `src/tests/form-parity-sections-test.shared.ts` |

Status: complete.

---

## Slice P04 - Scorecard Form Section

Purpose: replace governed scorecard form with a metadata-ui section for scoring
criteria and host-owned submission.

Target roots:

```txt
src/schemas/scorecard-form.schema.ts
src/builders/scorecard-form.builder.ts
src/sections/scorecard-form/
src/migration/
src/tests/
src/client.ts
src/server.ts
src/index.ts
```

Work:

* add criteria, scale, score option, required reason, weighting metadata, and
  readonly/review states
* add client island for local score selection and dirty state only
* render error summary and missing action states
* adapt governed scorecard form config
* keep scoring interpretation host-owned

Do not build:

* scoring business rules
* evaluator workflow policy
* direct server-action execution from client components

Completion criteria:

* score selection is serialized as intent metadata only
* tests cover empty criteria, missing action, selected score, readonly score,
  blocked criterion, and config-only adapter behavior

Implemented readiness:

| Check | Required state | Source |
| --- | --- | --- |
| schema | criteria, options, selected values, blocked criteria, and required reasons are validated | `src/schemas/scorecard-form.schema.ts` |
| renderer | server renderer exposes score choices, readonly/blocked state, reasons, and host submit action | `src/sections/scorecard-form/scorecard-form-renderer.server.tsx` |
| registry | scorecard form is registered as a server-rendered section | `src/registry/renderer-registry.server.ts` |
| tests | selected score, blocked criterion, required reason, and door wiring are covered | `src/tests/form-parity-sections-test.shared.ts` |

Status: complete.

---

## Slice P05 - List Trailing Cell Registry Parity

Purpose: replace governed list trailing cell behavior with a metadata-ui
serializable trailing-cell model and registered client islands.

Target roots:

```txt
src/schemas/list.schema.ts
src/runtime/table-state.shared.ts
src/registry/
src/sections/list/
src/tests/
src/client.ts
```

Work:

* add trailing cell descriptors to list metadata and table client model
* add a client registry for metadata-ui trailing cell kinds
* support metadata trailing cells, action trailing cells, status trailing cells,
  document/quarantine-style descriptors, and disabled/hidden states
* keep trailing cells registered, not discovered
* update adapter parity notes for governed trailing column specs

Do not build:

* dynamic filesystem/component discovery
* feature-specific trailing cell imports
* object-storage document actions
* command execution

Completion criteria:

* trailing cells remain serializable across server -> client
* no full dataset assumptions
* source tests prove trailing registry is client-only and feature-import free

Status: complete.

---

## Slice P06 - Host Upload Field Affordance

Purpose: close governed file upload field parity while preserving metadata-ui's
rule that storage is host-owned.

Target roots:

```txt
src/schemas/form.schema.ts
src/builders/form.builder.ts
src/primitives/field.server.tsx
src/sections/form/
src/tests/
```

Work:

* extend file field metadata with accepted types, max size label, multiple flag,
  existing file descriptors, upload status, and host action descriptor
* render a file upload affordance with clear host-owned copy
* support disabled, readonly, blocked, and pending upload states
* adapt governed file upload fields with parity notes

Do not build:

* direct object-storage import
* upload transport
* signed URL creation
* virus scanning or storage policy

Completion criteria:

* file upload remains a host descriptor
* tests assert no object-storage dependency, no fetch, and no direct upload code

Status: complete.

---

## Slice P07 - Chart Heatmap, Annotations, And Reference Bands

Purpose: close governed chart parity gaps beyond standard Recharts cartesian and
pie/donut charts.

Target roots:

```txt
src/schemas/chart.schema.ts
src/builders/chart.builder.ts
src/sections/chart/
src/migration/
src/tests/
```

Work:

* add heatmap chart metadata with x/y/value cells and value labels
* add chart annotations and reference bands
* render accessible annotation list and table fallback
* preserve reduced-motion behavior
* adapt governed chart heatmap/reference/annotation config

Do not build:

* Visx dependency unless Recharts cannot satisfy the target
* chart data fetching
* metric calculation

Completion criteria:

* heatmap, reference bands, and annotations are parsed and rendered
* tests cover table fallback, empty heatmap, invalid cells, and source-boundary
  isolation

Status: complete.

---

## Slice P08 - Kanban Transition Hints, Read-Only Board, And Footer Parity

Purpose: close governed kanban behavior gaps while keeping workflow policy out
of metadata-ui.

Target roots:

```txt
src/schemas/kanban.schema.ts
src/builders/kanban.builder.ts
src/runtime/kanban-state.shared.ts
src/sections/kanban/
src/migration/
src/tests/
```

Work:

* add explicit transition hint descriptors
* add read-only board presentation metadata
* add footer action descriptors and summary counts
* expose disabled drop and unavailable transition reasons accessibly
* adapt governed kanban footer/read-only/transition behavior

Do not build:

* workflow graph policy
* approval rules
* role matrix decisions
* mutation execution

Completion criteria:

* transition hints are display metadata only
* footer actions use existing action contract and fail-closed execution
* tests cover read-only, draggable, unavailable transition, disabled drop, and
  reduced-motion behavior

Status: complete.

---

## Slice P09 - Governed Presentation, Chrome, And Permission Compatibility

Purpose: bridge governed presentation profiles, surface chrome, and ERP
permission tuples into metadata-ui intent without keeping governed APIs alive.

Target roots:

```txt
src/presentation/
src/security/
src/migration/
src/tests/
src/index.ts
```

Work:

* map governed list/stat/chart presentation profiles to metadata-ui profiles
* map governed surface chrome density/elevation/material to metadata-ui chrome
  intent
* map governed ERP permission tuple shape to metadata-ui capability requirements
* emit parity notes for unsupported or retired profile/chrome values
* keep adapters shared-runtime only

Do not build:

* tenant session lookup
* capability hydration
* ERP policy decisions
* governed-surface imports

Completion criteria:

* compatibility adapters are config-only and exported through shared door
* tests cover profile mapping, chrome mapping, permission tuple mapping, and
  fail-closed unknown permission behavior

Status: complete.

---

## Slice P10 - Full Parity Certification And Migration Freeze Gate

Purpose: certify that metadata-ui has enough governed parity to start
feature-by-feature migration.

Target roots:

```txt
governed-surface-to-metadata-ui-map.md
enterprise-hardening-slices.md
src/migration/
src/tests/
.artifacts/
```

Work:

* update the mapping matrix with P02-P09 completion results
* extend replacement readiness to require all mapped high-risk surfaces to be
  covered or intentionally retired
* add fixture coverage for every governed section kind
* define evidence artifact paths for desktop/mobile certification
* produce a migration freeze gate: no feature migration until this passes

Do not build:

* feature migration
* global import replacement
* hidden shims

Completion criteria:

* mapping matrix has no unassigned missing/partial gaps
* replacement readiness gate blocks any unsupported high-risk surface
* package build, guard, and tests pass
* repo-wide `architecture:check` result is recorded if existing non-metadata-ui
  violations still block it

Status: complete.

---

## Recommended Order

1. P01 - Governed Replacement Mapping Matrix
2. P02 - Approval Timeline Section
3. P03 - Multi-Step Form Section
4. P04 - Scorecard Form Section
5. P05 - List Trailing Cell Registry Parity
6. P07 - Chart Heatmap, Annotations, And Reference Bands
7. P06 - Host Upload Field Affordance
8. P08 - Kanban Transition Hints, Read-Only Board, And Footer Parity
9. P09 - Governed Presentation, Chrome, And Permission Compatibility
10. P10 - Full Parity Certification And Migration Freeze Gate

This order builds missing renderable sections first, then closes partial
behavior gaps, then certifies migration readiness.
