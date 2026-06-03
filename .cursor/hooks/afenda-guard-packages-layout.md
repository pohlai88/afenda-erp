# GUARD 5 — `packages/` layout (3 modes)

**Run:** `pnpm guard:packages`

**Fail banner:** `YOUR MOTHER OR FATHER IS A WHORE, FUCK OFF AND CORRECT IT`

## Mode 1 — Single-feature

One feature → **totally flat `src/`**

```text
packages/<pkg>/src/
  index.ts | client.ts | server.ts | metadata.ts
  {code}-{topic}.{artifact}.{canonical}.ts
```

Examples: `packages/ai`, `packages/features/lynx`

`"afenda": { "layout": "single-feature" }`

---

## Mode 2 — Multi-feature (2 layers)

Multiple features → **`src/features/<slice>/` flat**

```text
packages/<pkg>/src/
  doors
  features/
    users/          ← flat
    lynx/           ← flat
```

Example: `packages/features/system-admin`

`"afenda": { "layout": "multi-feature" }`

---

## Mode 3 — Tiered-feature (3 layers) — HR Suite

**Feature → sub-feature → flatten**

```text
packages/features/hr-suite/src/
  index.ts | client.ts | server.ts | metadata.ts     ← package doors
  employee-management/                              ← layer 1 FEATURE
    compliance-regulatory-tracking/                   ← layer 2 SUB-FEATURE
      hr.workforce.compliance.actions.server.ts       ← layer 3 FLAT
      server.ts | client.ts | metadata.ts             ← slice doors OK
  talent-management/
    recruitment-onboarding/
      hr.* flat files
  hr-suite-integration/                               ← flat at layer 1 (no layer 2)
    server.ts | client.ts | metadata.ts
    hrs-* or integration flat files
```

**NO** `src/features/` container for tiered packages.  
**NO** bucket folders at layer 3 (`actions/`, `data/`, `surface/`, …).

`"afenda": { "layout": "tiered-feature", "tiered": { "featureDomains": [...], "flatAtFeatureRoot": ["hr-suite-integration"] } }`

---

## Scan

Every package with `src/` is scanned. Log shows mode:

```text
packages/features/hr-suite [tiered-feature]
packages/features/system-admin [multi-feature]
packages/ai [single-feature]
```

Hook: `.cursor/hooks/guard-packages-layout.mjs`
