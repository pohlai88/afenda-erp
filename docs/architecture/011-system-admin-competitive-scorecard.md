# ARCH-011 supplement · System Admin competitive scorecard

**Doc ID:** `ARCH-011-SCORECARD` · **File:** `011-system-admin-competitive-scorecard.md`

| Field     | Value |
| --------- | ----- |
| Status    | Active — living benchmark; refresh quarterly or after vertical DoD changes |
| Authority | Competitive positioning and gap prioritization for `@afenda/feature-system-admin` |
| Defers to | **ARCH-011** (control plane doctrine) · **ARCH-002** §4 (execution enforcement) |
| Related   | Vertical supplements under `packages/features/system-admin/src/*/*-architecture.md` |

This document compares Afenda System Admin to representative **open-source** and **SaaS** admin consoles. It is not a product roadmap; use gap priority scores to inform roadmap waves in `docs/roadmap/`.

**Last validated:** 2026-05-29 (code + vertical Definition-of-Done checklists)

---

## Competitor archetypes

| Archetype | Benchmark | Why included |
| --------- | --------- | ------------ |
| OSS IAM | [Keycloak Admin](https://www.keycloak.org/) | SSO, federation, session/MFA policy reference |
| OSS ERP | [ERPNext](https://docs.frappe.io/erpnext), [Odoo](https://www.odoo.com/documentation) | Module + role-permission matrix patterns |
| SaaS IAM | [Okta](https://help.okta.com/), [Auth0](https://auth0.com/docs), [WorkOS](https://workos.com/docs) | Directory sync, B2B identity lifecycle |
| SaaS ERP | [NetSuite Setup](https://docs.oracle.com/en/cloud/saas/netsuite/) | ERP-grade RBAC, SoD, audit, licensing |

Afenda is an **ERP-native control plane** with configure-vs-enforce split (**ARCH-011** / **ARCH-002** §4). Competitors are grouped by archetype; not every dimension applies equally.

---

## Scoring methodology

### Scale (1–5)

| Score | Label | Meaning |
| ----- | ----- | ------- |
| 1 | Absent | No surface; manual workaround only |
| 2 | Scaffold | UI or schema exists; core workflow incomplete |
| 3 | Baseline | Phase-minimum usable; documented gaps remain |
| 4 | Mature | Meets vertical Definition of Done |
| 5 | Leader | Market reference or Afenda differentiator |

### Gap formula

```txt
Gap(d) = Target(d) − Afenda(d)
Priority(d) = Gap(d) × Weight(d)
```

- **Target** defaults to **4** (production DoD); **5** only for claimed differentiators (Lynx, control/enforce architecture).
- **Weights** sum to 100 (ERP-admin lens).

### Thresholds

| Gap | Status | Action |
| --- | ------ | ------ |
| ≥ 1.5 | Red | Roadmap item; may block enterprise narrative |
| 0.5–1.4 | Amber | Next phase in existing vertical |
| < 0.5 | Green | Maintain; benchmark only |

---

## DoD validation evidence (May 2026)

Scores below are tied to vertical DoD checklists and as-built code.

| Dimension | Score | Target | Gap | Weight | Priority | DoD evidence |
| --------- | ----- | ------ | --- | ------ | -------- | ------------ |
| Identity & lifecycle | 3.5 | 4 | 0.5 | 8 | 4.0 | Users Phase 1 done: invite/suspend/remove in `users/actions/`; no SCIM/directory sync |
| Membership & teams | 2.5 | 4 | 1.5 | 5 | 7.5 | Phase 1 done; teams/employment deferred in `membership-architecture.md` |
| Roles & RBAC | 3.0 | 4 | 1.0 | 9 | 9.0 | Tenant role catalog edit/deprecate via `tenant_role_catalog`; assign/remove; custom role **keys** still enum-bound |
| Permissions & capabilities | 3.5 | 4 | 0.5 | 10 | 5.0 | Catalog + overrides; per-role capability matrix shipped (Phase 2); direct user grants deferred |
| Module governance | 4.0 | 4 | 0.0 | 8 | 0.0 | Phase 2 minimum met: `modules/actions/` |
| Policy engine | 3.5 | 4 | 0.5 | 8 | 4.0 | Rules + kernel bridge; full DoD checklist partially aspirational |
| Approval workflows | 3.5 | 4 | 0.5 | 7 | 3.5 | Chains + enable/disable; execution in Orbit/workflows |
| Audit & compliance | 3.5 | 4 | 0.5 | 9 | 4.5 | Search/export/retention in `audit-viewer/`; no WORM/SoD packs |
| Security posture | 3.5 | 4 | 0.5 | 7 | 3.5 | MFA domains, session, lockout in `security/` |
| Organization settings | 4.0 | 4 | 0.0 | 4 | 0.0 | `organization/actions/` complete |
| Integrations & SSO | 3.0 | 4 | 1.0 | 7 | 7.0 | API creds, webhooks, SSO; catalog breadth partial |
| Diagnostics / gov health | 3.5 | 4 | 0.5 | 6 | 3.0 | Engine + drift detectors; audited export added |
| Operational reliability | 2.5 | 4 | 1.5 | 5 | 7.5 | Cron/repo/migration/webhook + workflow probe; queue/storage/cache still info-level |
| Commercial / billing | 3.0 | 4 | 1.0 | 4 | 4.0 | Stripe posture; invoices/payments incomplete per billing DoD |
| AI / machine governance (Lynx) | 4.5 | 5 | 0.5 | 4 | 2.0 | `lynx/` admin surface; ARCH-009 adjunct |
| Architecture (control vs enforce) | 4.5 | 5 | 0.5 | 5 | 2.5 | ARCH-011 + ARCH-002 §4 + `tenant-execution/` |
| **Weighted composite** | **3.48** | — | — | 100 | — | ↑ from 3.35 pre-Wave 1/3 |

**Priority ranking (post Wave 1/3):**

1. Membership & teams — 7.5
2. Operational reliability — 7.5
3. Integrations & SSO — 7.0
4. Permissions & capabilities — 5.0
5. Audit & compliance — 4.5
6. Identity & lifecycle — 4.0
7. Commercial / billing — 4.0
8. Policy engine — 4.0
9. Roles & RBAC — 9.0 → **3.0 effective after tenant catalog** (was red, now amber)

---

## Scorecard matrix (competitors)

| Dimension | Afenda | Keycloak | ERPNext | Odoo | Okta | NetSuite | WorkOS |
| --------- | ------ | -------- | ------- | ---- | ---- | -------- | ------ |
| Identity & lifecycle | **3.5** | 4.5 | 3.0 | 3.0 | **5.0** | 4.0 | 4.5 |
| Membership & teams | **2.5** | 3.0 | 3.5 | 4.0 | 4.0 | 4.5 | 3.5 |
| Roles & RBAC | **3.0** | 4.0 | 4.0 | 4.0 | 4.5 | **5.0** | 3.0 |
| Permissions & capabilities | **3.5** | 3.5 | 4.0 | 4.5 | 3.5 | **5.0** | 2.5 |
| Module governance | **4.0** | 1.0 | 4.0 | 4.5 | 1.0 | **5.0** | 1.0 |
| Policy engine | **3.5** | 4.0 | 2.0 | 2.5 | 4.0 | 4.5 | 2.0 |
| Approval workflows | **3.5** | 1.5 | 3.0 | 3.5 | 2.0 | **4.5** | 1.5 |
| Audit & compliance | **3.5** | 3.0 | 2.5 | 2.5 | 4.0 | **4.5** | 2.5 |
| Security posture | **3.5** | 4.5 | 2.5 | 2.5 | **5.0** | 4.0 | 4.0 |
| Organization settings | **4.0** | 1.5 | 4.0 | 4.5 | 2.0 | **5.0** | 2.0 |
| Integrations & SSO | **3.0** | **5.0** | 2.5 | 3.0 | **5.0** | 4.0 | **5.0** |
| Diagnostics / gov health | **3.5** | 2.0 | 2.0 | 2.5 | 3.5 | 3.5 | 2.0 |
| Operational reliability | **2.5** | 2.5 | 2.0 | 2.0 | 3.5 | 3.5 | 2.5 |
| Commercial / billing | **3.0** | 1.0 | 1.5 | 2.0 | 2.0 | 4.0 | 3.0 |
| AI / machine governance | **4.5** | 1.0 | 1.0 | 1.0 | 1.5 | 2.0 | 1.0 |
| Architecture quality | **4.5** | 4.0 | 3.0 | 3.0 | 4.0 | 3.5 | 3.5 |
| **Weighted total** | **3.48** | 3.08 | 3.01 | 3.24 | 3.56 | **4.19** | 2.98 |

---

## Where Afenda wins

| Area | Score | vs market |
| ---- | ----- | --------- |
| Control vs enforce split (ARCH-011 / ARCH-002 §4) | 4.5 | Clearer than Odoo/ERPNext monolith |
| Module + capability + policy + approval stack | 3.5–4.0 | NetSuite direction; beats IAM-only tools |
| Lynx governance | 4.5 | No OSS/SaaS ERP peer at same depth |
| Governed admin UI (Pattern C) | 4.0 | Consistent metadata-driven lists |
| Diagnostics as governance health center | 3.5 | Concept ahead of ERPNext/Odoo |

---

## Roadmap waves (gap closure)

### Wave 1 — Authorization depth (implemented 2026-05-29)

- Tenant role catalog: edit display metadata, deprecate/reactivate seeded roles (`tenant_role_catalog`)
- Per-role capability matrix on `/system-admin/capabilities`
- **Remaining:** custom role keys require `organization_role` enum extension (ARCH-005)

### Wave 2 — Enterprise identity

- SCIM / directory sync adapter (platform/auth; surface in Integrations)
- Teams and employment columns in Memberships

### Wave 3 — Ops trust (partial 2026-05-29)

- Lynx workflow health probe in Reliability
- Diagnostics governance export with audit trail
- **Remaining:** queue, storage, cache platform telemetry

### Wave 4 — Commercial & connectors

- Billing invoice/payment surfaces per `billing-architecture.md`
- Integrations marketplace categories beyond API/webhook/SSO

---

## Update cadence

1. Re-run `pnpm system-admin:scorecard-audit` (partial automation).
2. Re-score dimensions when a vertical DoD checklist is fully checked off.
3. Update competitor columns quarterly or before major release notes.
4. Link evidence to unit tests in `packages/features/system-admin/tests/unit/`.

When control vs execution boundary changes, update this doc together with **ARCH-011** and **ARCH-002** §§3–4.
