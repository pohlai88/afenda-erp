# Approvals runtime module architecture

Parent: [ARCH-002 ERP kernel package architecture](../../../../docs/architecture/002-erp-kernel-package-architecture.md).

Control-plane approval **rule configuration** lives in `@afenda/feature-system-admin` at `/system-admin/approvals`. This package owns the **operator execution queue** at `/approvals`.

## Definition

The runtime approvals module is where authorized operators review pending approval work items and record approve/reject decisions against tenant ERP work items.

It answers:

```txt
What is waiting for my decision, and how do I close the loop?
```

## Owns

- Operator queue list surface (`approvals.queue.list`)
- Decision server actions (`decideApprovalWorkItemAction`)
- Queue row mapping from `ModuleWorkspaceItem` metadata
- Capability guard for `approvals.decide`
- Audit events: `approvals.work_item.approve`, `approvals.work_item.reject`

## Does not own

- Approval rule configuration, escalation policy authoring, or approver-role catalog (system-admin control plane)
- Generic module record CRUD (kernel + `@afenda/db` ERP tables)
- Cross-module workflow orchestration beyond updating linked approval work items and source records

## Data model (v1)

Uses existing ERP tables — no new DDL in this slice:

| Store | Usage |
| ----- | ----- |
| `erp_work_items` | Queue rows for `module_id = approvals`; decision writes `status = completed` and decision metadata |
| `erp_module_records` | Linked `approval-request` records; approve → `active`, reject → `closed` when `source_record_id` is set |

Work item metadata extension (decision trail):

```txt
decision: "approved" | "rejected"
decidedAt: ISO timestamp
decidedByAuthUserId: string
decisionNote?: string
rejectionReason?: string (required on reject)
```

Record type extension schema (`approval-request`) is registered in kernel `record-types.ts`:

```txt
approvalRoute: string (required)
escalation?: boolean
```

## Capabilities

| Capability | Purpose |
| ---------- | ------- |
| `approvals.view` | Read queue, records, and kanban |
| `approvals.decide` | Approve or reject actionable work items |

`finance-manager` and `operations-manager` receive `approvals.decide` in auth + permission seed.

## Export doors

| Door | Exports |
| ---- | ------- |
| `./metadata` | Kernel module metadata factories + `buildApprovalQueueListSurface` |
| `./server` | Guards, actions, `ApprovalsModuleQueueSection` |
| `./client` | `ApprovalsQueueTrailingCell`, surface copy/keys |

## App wiring

`apps/erp/src/workspace-routes/module-screen-sections.server.tsx` branches `moduleId === "approvals"` to render `ApprovalsModuleQueueSection` instead of the generic kernel work-item list.

## Verification

```bash
pnpm --filter @afenda/feature-approvals typecheck
pnpm --filter @afenda/feature-approvals test
pnpm --filter @afenda/erp typecheck
pnpm architecture:check
```
