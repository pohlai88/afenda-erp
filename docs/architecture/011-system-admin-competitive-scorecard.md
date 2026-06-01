# ARCH-011 supplement - System Admin Enterprise Scorecard

**Doc ID:** `ARCH-011-SCORECARD`  
**File:** `011-system-admin-competitive-scorecard.md`

| Field | Value |
| ----- | ----- |
| Status | Active - enterprise ERP benchmark; refresh quarterly or after vertical DoD changes |
| Authority | Enterprise gap prioritization for `@afenda/feature-system-admin` |
| Defers to | **ARCH-011** control-plane doctrine, **ARCH-002** execution enforcement |
| Related | Package-local architecture at `packages/features/system-admin/architecture.md` |

This document benchmarks Afenda System Admin against enterprise ERP
administration patterns. It is not a product roadmap. Use the gaps and scores
to prioritize roadmap items in `docs/roadmap/` and vertical architecture docs.

**Last validated:** 2026-06-01, against current repo shape and vendor
documentation listed below.

## Enterprise Comparators

| Comparator | Enterprise pattern | Reference |
| ---------- | ------------------ | --------- |
| SAP S/4HANA Cloud | Business users, business roles, authorizations, IAM reporting | [SAP Identity and Access Management](https://help.sap.com/docs/SAP_S4HANA_CLOUD/53e36b5493804bcdb3f6f14de8b487dd/12032b657e104bb7ac4da02b2d3b3313.html) |
| Oracle ERP Cloud | Security Console, role review, data access control, audit reports | [Oracle ERP security](https://docs.oracle.com/en/cloud/saas/applications-common/25d/faser/securing-oracle-erp-cloud-overview.html), [Oracle audit reports](https://docs.oracle.com/en/cloud/saas/applications-common/24b/oacpr/audit-reports.html) |
| Microsoft Dynamics 365 | Role-based security, segregation of duties, Data Management import/export | [Dynamics role security](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/sysadmin/role-based-security), [Dynamics data management](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/data-management-integration-data-entity) |
| NetSuite | CSV Import Assistant gated by import permission | [NetSuite CSV Import Assistant](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N343158.html) |

Afenda's differentiation is the configure-vs-enforce split:

```txt
System Admin configures law.
Execution Kernel enforces law.
Feature modules execute business behavior.
```

That split is stronger than a generic settings console, but the enterprise
surface still needs deeper access governance, data-management, operations, and
commercial-impact workflows.

## Scoring Method

| Score | Label | Meaning |
| ----- | ----- | ------- |
| 1 | Absent | No meaningful local surface |
| 2 | Scaffold | Partial UI or schema exists; enterprise workflow incomplete |
| 3 | Baseline | Usable local workflow; enterprise gaps remain |
| 4 | Mature | Production-grade ERP admin pattern |
| 5 | Leader | Clear market-reference or Afenda differentiator |

```txt
Gap(d) = Target(d) - Afenda(d)
Priority(d) = Gap(d) * Weight(d)
```

Target defaults to 4. Use 5 only for strategic differentiators such as Lynx
governance or the control/enforce architecture.

## Gap Scorecard

| Dimension | Afenda | Target | Gap | Weight | Priority | Current evidence |
| --------- | ------ | ------ | --- | ------ | -------- | ---------------- |
| Access governance | 3.0 | 4.5 | 1.5 | 13 | 19.5 | Roles, permissions, capabilities, policies exist; no SoD engine, role diff, certification campaign, or dormant-access cleanup. |
| Data management / import workbench | 1.0 | 4.0 | 3.0 | 14 | 42.0 | No local `data-management/` vertical or import-job pipeline. |
| Configuration change governance | 2.5 | 4.0 | 1.5 | 10 | 15.0 | Settings actions write audit, but no before/after diff, scheduled activation, rollback history, or change approval flow. |
| Operational exception center | 2.5 | 4.0 | 1.5 | 10 | 15.0 | Diagnostics, reliability, recent changes exist separately; no single "what needs attention now" queue. |
| Integration operations | 3.0 | 4.0 | 1.0 | 10 | 10.0 | API credentials, webhooks, delivery rows, SSO exist; ping/resend/rotate/test payload/SLA controls incomplete. |
| Support / break-glass governance | 1.5 | 4.0 | 2.5 | 8 | 20.0 | Security posture exists; no just-in-time support, impersonation review, or emergency access expiry. |
| License / feature / module impact | 2.5 | 4.0 | 1.5 | 8 | 12.0 | Billing, modules, capabilities exist; no license impact by role/module/capability. |
| Audit and evidence | 3.5 | 4.0 | 0.5 | 9 | 4.5 | Search/export/retention/coverage exist; evidence packages and WORM posture are incomplete. |
| Reliability and platform health | 2.5 | 4.0 | 1.5 | 7 | 10.5 | Cron/repo/migration/workflow visibility exists; queue/storage/cache health remain shallow. |
| Lynx governance | 4.5 | 5.0 | 0.5 | 4 | 2.0 | Lynx admin surface exists; keep aligned with ARCH-009 vocabulary and tool governance. |
| Architecture quality | 4.5 | 5.0 | 0.5 | 7 | 3.5 | ARCH-011 + ARCH-002 split and vertical package shape are strong. |
| **Weighted composite** | **2.85** | - | - | 100 | - | Enterprise gaps are now explicit. |

## Priority Order

1. Data management / import workbench - highest gap; implement as
   `data-management/` vertical, not as generic utilities.
2. Support / break-glass governance - security-sensitive enterprise trust
   requirement.
3. Access governance - SoD, toxic combinations, access explanation, dormant
   access, certification.
4. Configuration change governance - diff, approval, scheduled activation, and
   rollback evidence.
5. Operational exception center - unify attention signals across diagnostics,
   reliability, integrations, data management, users, and security.
6. License / feature / module impact - commercial and entitlement clarity.
7. Integration operations - ping, rotate, resend, test payload, retry policy,
   SLA indicators.

## Enterprise Gap Definitions

### Access Governance

Target capabilities:

- segregation-of-duties conflict rules;
- toxic-combination detection;
- role diff and permission impact review;
- "why does this user have access?" explanation;
- access certification campaigns;
- dormant-access cleanup.

Owning verticals: `users/`, `memberships/`, `roles/`, `permissions/`,
`capabilities/`, `security/`, `audit-viewer/`.

### Data Management / Import Workbench

Target capabilities:

- import templates;
- CSV/spreadsheet validation;
- staged rows and row-level failures;
- retryable jobs and cancellation;
- import history and operator evidence;
- dedicated import/export permissions;
- audit events for create, run, cancel, complete, fail, row reject, and export.

Owning vertical: `data-management/`. Canonical supplement:
[011-system-admin-data-management-architecture.md](011-system-admin-data-management-architecture.md).

### Configuration Change Governance

Target capabilities:

- before/after config diffs;
- approval gates for high-risk settings;
- scheduled activation;
- rollback history;
- environment drift review;
- "who changed what from what to what" evidence.

Owning verticals: `policies/`, `approvals/`, `modules/`, `capabilities/`,
`security/`, `organization/`, `integrations/`, `audit-viewer/`.

### Operational Exception Center

Target capabilities:

- failed webhooks;
- stale invitations;
- failed imports;
- disabled or blocked modules;
- security posture gaps;
- missing audit coverage;
- open reliability failures.

Owning verticals: `overview/`, `diagnostics/`, `reliability/`,
`integrations/`, `data-management/`, `users/`, `security/`.

### Integration Operations

Target capabilities:

- endpoint ping;
- delivery resend;
- dead-letter queue review;
- signing-key rotation;
- inbound signature verification;
- retry policy controls;
- webhook event test payloads;
- delivery SLA indicators.

Owning verticals: `integrations/`, `reliability/`, `audit-viewer/`.

### Support / Break-Glass Governance

Target capabilities:

- just-in-time support access;
- emergency break-glass role;
- impersonation/session review;
- emergency access expiry;
- mandatory audit evidence and review.

Owning verticals: `security/`, `users/`, `roles/`, `audit-viewer/`.

### License / Feature / Module Impact

Target capabilities:

- license impact by role;
- module and capability commercial impact;
- plan/entitlement coverage;
- cost exposure when enabling features;
- billing and feature usage evidence.

Owning verticals: `billing/`, `modules/`, `capabilities/`, `roles/`.

## Roadmap Waves

| Wave | Theme | Primary verticals |
| ---- | ----- | ----------------- |
| 1 | Data management foundation | `data-management/`, `integrations/`, `audit-viewer/`, `reliability/` |
| 2 | Access governance | `roles/`, `permissions/`, `capabilities/`, `users/`, `memberships/` |
| 3 | Change governance | `policies/`, `approvals/`, `organization/`, `security/`, `audit-viewer/` |
| 4 | Operational exception center | `overview/`, `diagnostics/`, `reliability/`, `integrations/` |
| 5 | Break-glass and support | `security/`, `users/`, `roles/`, `audit-viewer/` |
| 6 | Commercial impact | `billing/`, `modules/`, `capabilities/`, `roles/` |

## Update Cadence

1. Re-score after each vertical Definition of Done changes.
2. Refresh vendor references quarterly or before enterprise release planning.
3. Link shipped evidence to tests under
   `packages/features/system-admin/tests/unit/`.
4. When control-vs-execution boundaries change, update this doc, **ARCH-011**,
   and **ARCH-002** sections 4 and 5 together.
