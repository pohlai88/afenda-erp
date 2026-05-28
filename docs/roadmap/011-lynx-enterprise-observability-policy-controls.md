# TRACK-011 · Lynx Enterprise Observability And Policy Controls

## Summary

Upgrade Lynx from enterprise-ready core to production operating layer. This
track adds tenant-scoped Solution Console observability, versioned eval failure
records, proactive monitor controls, and runtime-enforced governed tool policy.

## Scope

- Solution Console dashboards over Lynx runs, latency, quality, proactive
  outcomes, workflow session updates, and Gateway usage signals.
- Versioned Lynx eval sets, cases, case results, representative failures, and
  optional semantic grading metadata.
- Tenant-scoped proactive monitor settings for enablement, deterministic
  thresholds, owner assignment, and severity policy.
- Central governed tool wrapper in `@afenda/ai` that blocks missing metadata,
  high-sensitivity calls without capability, and write tools without approval.

## Non-Goals

- No autonomous ERP mutation.
- No Vercel Workflow or Vercel Sandbox runtime dependency.
- No replacement for Vercel Observability; in-app dashboards are operational
  product surfaces over Afenda's own run ledger.

## Verification Gates

- DB tenant isolation tests for Lynx monitor settings, eval records, and
  observability aggregates.
- Lynx monitor tests for disabled monitor skip behavior and threshold changes.
- AI governed tool policy tests for missing metadata, sensitivity, approval,
  and audit event recording.
- ERP route/UI tests for server-side filters, monitor controls, and metadata
  failure surfaces.
