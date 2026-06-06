# Afenda Public Homepage ERP Section Architecture

## 1. Purpose

The ERP section must stop presenting Afenda as a generic ERP module catalog.

Its purpose is to communicate Afenda's core differentiation:

> Afenda is not just ERP. It is an ERP where every module can be searched, reasoned over, and operated with evidence.

The section positions modules as **coverage proof**, not the headline, and it can surface roadmap-safe breadth as long as the state is labeled honestly.

The primary story is:

```txt
Question → Evidence → Decision → Approval → Audit
```

## 2. Section Positioning

### Primary Headline

```txt
Every ERP module.
One evidence engine.
One decision operator.
```

### Supporting Copy

```txt
Finance, HR, inventory, sales, purchasing, documents, reports, and admin controls are connected to Lynx, so teams can ask what is true, decide what to do, and act with governance.
```

### Differentiation Statement

```txt
Normal ERP stores records.
Afenda lets operators prove, decide, and act across them.
```

## 3. Visual Architecture

The section should feel like a **command map**, not a feature grid. The hero carries proof points, and the map itself uses stage cards, source rails, the Lynx core, and visible roadmap badges.

```txt
ERP Modules
   ↓
Evidence Sources
   ↓
Lynx Truth Retrieval
   ↓
Lynx Decision Operator
   ↓
Approval / Audit Trail
```

The center of the visual is **Lynx**, not the modules.

Modules orbit around Lynx as connected evidence sources.

## 4. Information Architecture

The section contains six layers:

### Layer 1 — Hero Claim

Owns the main positioning:

```txt
Every ERP module.
One evidence engine.
One decision operator.
```

Add proof points below the differentiation line so the hero can carry breadth without turning into a marketing wall. Use them to communicate coverage, roadmap honesty, and the operating-model angle.

### Layer 2 — Two Killer Feature Panels

#### Lynx Truth Retrieval

Purpose:

```txt
Evidence-backed answers across ERP records, documents, policies, workflows, and knowledge sources.
```

Key bullets:

* Ask across finance, HR, inventory, sales, documents, policies, and knowledge.
* Answers cite the source.
* Operators see what evidence was used.
* No guessing from disconnected dashboards.

#### Lynx Decision Operator

Purpose:

```txt
AI-assisted operational decisions that can inspect context, propose actions, route approvals, and leave an audit trail.
```

Key bullets:

* Turns ERP context into reviewed actions.
* Routes approvals before business writes.
* Records runs, feedback, and outcomes.
* Built for governed operations, not chat novelty.

### Layer 3 — Command Map Stages

The command map should present the operating flow as named stages:

```txt
Question
Evidence
Lynx
Approval
Audit
```

Each stage should include a short detail line so the map reads as an operating pattern, not a decorative path.

### Layer 4 — Command Map

Visual center:

```txt
Lynx Truth Engine
Lynx Decision Operator
```

Surrounding sources:

```txt
Finance
Sales
CRM
Purchasing
Inventory
HR Suite
Payroll
Time Attendance
Documents
Knowledge
Reports
System Admin
Audit
Permissions
Integrations
Billing
```

### Layer 5 — Module Coverage

Modules appear as proof of breadth, and roadmap modules may be shown if they are labeled as roadmap rather than shipped.

#### Core Operations

* Finance
* Sales
* CRM
* Purchasing
* Inventory

#### People Operations

* HR Suite
* Payroll / compensation
* Time and attendance
* Talent / training
* Compliance

#### Knowledge And Documents

* Knowledge
* Document registry
* Document activity
* Source sync
* Retrieval evaluation

#### Control And Governance

* System Admin
* Users / roles / permissions
* Modules / capabilities
* Audit
* Billing / entitlements
* Integrations
* Data management

#### Intelligence Layer

* Lynx Console
* Truth Search
* Decision Operator
* Run ledger
* Outcome monitors
* Reports / analytics
* Dashboard

### Layer 6 — Closing Proof Line

```txt
Every record, document, workflow, and approval becomes part of the same operating truth.
```

## 5. Component Architecture

Recommended package location:

```txt
packages/public-homepage/src/components/erp-truth-section/
```

Recommended files:

```txt
erp-truth-section.server.tsx
erp-truth-section.module.css
erp-truth-section.content.ts
erp-truth-section.schema.ts
erp-truth-command-map.server.tsx
erp-truth-feature-panels.server.tsx
erp-truth-section-header.server.tsx
erp-truth-coverage-grid.server.tsx
erp-truth-evidence-path.server.tsx
index.ts
```

## 6. Runtime Rules

This section must remain static, server-rendered, and marketing-safe.

It must not:

* Fetch tenant data.
* Import workspace auth.
* Import ERP feature packages.
* Claim unshipped modules as live product.
* Use fake dashboard metrics.
* Present AI as magic.
* Use generic SaaS phrases.

It may:

* Render static marketing content.
* Show product positioning.
* Show module coverage as roadmap-safe coverage when clearly labeled.
* Use visual examples of evidence and decisions.
* Use CSS-only animation.

## 7. Design Rules

Visual direction:

```txt
Dark background
Command center layout
Lynx in center
Evidence lines
Module nodes
Enterprise-grade restraint
Scientific / operational tone
Hero proof strip
Roadmap-safe badges
```

Avoid:

```txt
Generic feature cards
AI sparkle graphics
Cartoon SaaS illustrations
Fake dashboard overload
Overcrowded module grids
```

## 8. Accessibility Rules

The command map must remain understandable without animation.

Requirements:

* Use semantic section landmarks.
* Use real headings.
* Do not rely on line animation for meaning.
* Every visual node needs readable text.
* Motion must be subtle and non-essential.
* Respect reduced motion.
* Ensure contrast passes enterprise landing page standards.

## 9. SEO / Copy Rules

The section should naturally include:

* ERP
* business truth engine
* evidence-backed decisions
* enterprise resource planning
* audit trail
* operational governance
* AI-assisted ERP operations
* finance, HR, inventory, sales, purchasing

Do not keyword-stuff.

## 10. Final Section Structure

```txt
<section>
  Eyebrow
  Headline
  Subcopy

  Truth Retrieval Panel
  Decision Operator Panel

  Command Map
    Lynx center
    Module source nodes
    Evidence paths
    Approval / audit output

  Coverage Grid
    Core Operations
    People Operations
    Knowledge And Documents
    Control And Governance
    Intelligence Layer

  Closing Statement
</section>
```
