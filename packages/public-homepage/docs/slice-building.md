# 10-Slice Development Plan

## Slice 1 — Content Contract

Create the content model first.

Deliverables:

```txt
erp-truth-section.schema.ts
erp-truth-section.content.ts
```

Content groups:

* hero claim
* truth retrieval panel
* decision operator panel
* command map nodes
* coverage groups
* closing statement

Acceptance:

* No JSX hardcoded copy.
* All module names come from content config.
* Unshipped modules can be marked as `coverage`, `planned`, or hidden.

---

## Slice 2 — Section Shell

Create the main server component.

Deliverable:

```txt
erp-truth-section.server.tsx
```

Responsibilities:

* render section landmark
* render header
* compose feature panels
* compose command map
* compose coverage grid

Acceptance:

* Server component only.
* No client state.
* No tenant/runtime dependency.

---

## Slice 3 — Hero Positioning Block

Build the headline/subcopy area.

Deliverables:

```txt
ErpTruthSectionHeader
```

Content:

```txt
Every ERP module.
One evidence engine.
One decision operator.
```

Acceptance:

* Strong visual hierarchy.
* No generic ERP wording.
* Immediate differentiation above the fold of the section.

---

## Slice 4 — Two Killer Feature Panels

Build the two large panels.

Deliverable:

```txt
erp-truth-feature-panels.server.tsx
```

Panels:

* Lynx Truth Retrieval
* Lynx Decision Operator

Acceptance:

* Panels are visually dominant.
* Bullets are concrete.
* No “AI-powered” generic language.

---

## Slice 5 — Command Map Foundation

Build the static command map layout.

Deliverable:

```txt
erp-truth-command-map.server.tsx
```

Structure:

```txt
Module nodes → Lynx core → Decision Operator → Approval → Audit
```

Acceptance:

* Works without animation.
* Responsive on desktop/tablet/mobile.
* Lynx is visually central.

---

## Slice 6 — Evidence Path Visual System

Add CSS-only evidence paths.

Deliverable:

```txt
erp-truth-evidence-path.server.tsx
erp-truth-section.module.css
```

Behavior:

* subtle lines
* glowing path accents
* no heavy motion
* reduced-motion safe

Acceptance:

* Looks like an enterprise command map.
* Does not feel like a crypto/network gimmick.
* No JavaScript required.

---

## Slice 7 — Coverage Grid

Build grouped module coverage.

Deliverable:

```txt
erp-truth-coverage-grid.server.tsx
```

Groups:

* Core Operations
* People Operations
* Knowledge And Documents
* Control And Governance
* Intelligence Layer

Acceptance:

* Modules are proof, not headline.
* Grid is secondary to Lynx.
* No fake module claims.

---

## Slice 8 — Responsive Polish

Tune desktop, tablet, and mobile.

Acceptance:

Desktop:

```txt
Feature panels side by side
Command map wide
Coverage grouped below
```

Mobile:

```txt
Hero
Truth panel
Decision panel
Simplified vertical evidence path
Coverage accordion-like stacked groups
```

No horizontal overflow.

---

## Slice 9 — Quality Gates

Add tests and checks.

Recommended tests:

```txt
erp-truth-section.content.test.ts
erp-truth-section.render.test.tsx
```

Checks:

* content schema validates
* all coverage groups render
* no forbidden generic phrases
* no hidden fake claims
* no client directive
* section has accessible heading

Forbidden phrases:

```txt
Everything connected
Simplified operations
All-in-one ERP
AI-powered business
Smarter platform
```

---

## Slice 10 — Integration Into Homepage

Mount inside public homepage shell.

Target:

```txt
packages/public-homepage/src/components/homepage-shell.server.tsx
```

Recommended placement:

```txt
Hero
Proof strip
ERP Truth Section
Workflow Section
Modules / Coverage
Final CTA
```

Acceptance:

* Section strengthens homepage story.
* It does not duplicate module grid.
* It becomes the main Afenda differentiation block.
