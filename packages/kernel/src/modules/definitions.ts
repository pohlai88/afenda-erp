import type { ModuleId } from "@afenda/config/module-ids";
import type { ErpModuleDefinition } from "../shared/module-types";

const modules = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    navigationLabel: "Dashboard",
    description:
      "KPIs, approvals, alerts, and cross-functional operating signals.",
    summary:
      "The executive workspace combines approval pressure, operating health, and module readiness into one route.",
    ownerTeam: "Operations Platform",
    requiredCapability: "dashboard.view",
    status: { label: "Operational", tone: "positive" },
    metrics: [
      {
        label: "Open approvals",
        value: "14",
        detail: "Purchasing and finance actions due in the next 24 hours.",
        tone: "warning",
      },
      {
        label: "Exceptions",
        value: "03",
        detail:
          "Stock variance, invoice hold, and payroll validation mismatch.",
        tone: "warning",
      },
      {
        label: "Healthy modules",
        value: "7/9",
        detail: "Core routes are within the current service budget.",
        tone: "positive",
      },
    ],
    defaultViews: [
      "Workspace summary",
      "Approval pressure",
      "Performance health",
    ],
    actions: [
      { label: "Review approvals", href: "/approvals" },
      { label: "Inspect reports", href: "/reports" },
    ],
    focusAreas: [
      {
        title: "Operating posture",
        summary:
          "Keep the dashboard server-rendered and focused on cross-module coordination.",
        bullets: [
          "Surface only decision-grade signals.",
          "Prefer links into module workflows over duplicating forms.",
          "Treat alerts and approvals as the primary intervention layer.",
        ],
      },
      {
        title: "Control objectives",
        summary:
          "Dashboard data must remain scoped to the active organization and role capabilities.",
        bullets: [
          "No tenant-level aggregate should leak across organizations.",
          "Derived metrics should stay reproducible from domain sources.",
          "Operational exceptions must link to the owning route.",
        ],
      },
    ],
    milestones: [
      "Replace sample metrics with database-backed aggregates.",
      "Attach saved report shortcuts by role.",
      "Emit observability events for every drill-down path.",
    ],
  },
  {
    id: "finance",
    href: "/finance",
    label: "Finance",
    navigationLabel: "Finance",
    description: "General ledger, receivables, payables, and close controls.",
    summary:
      "Finance is organized around close readiness, aging pressure, and high-risk exceptions.",
    ownerTeam: "Finance Systems",
    requiredCapability: "finance.view",
    status: { label: "Control buildout", tone: "warning" },
    metrics: [
      {
        label: "Close blockers",
        value: "02",
        detail: "Accrual review and unmatched invoice allocation remain open.",
        tone: "warning",
      },
      {
        label: "Receivables due",
        value: "$124k",
        detail: "Customer balances scheduled inside the next 7 days.",
        tone: "neutral",
      },
      {
        label: "Invoice holds",
        value: "05",
        detail: "Supplier invoices paused for three-way-match review.",
        tone: "warning",
      },
    ],
    defaultViews: ["Close checklist", "AR aging", "AP exceptions"],
    actions: [
      { label: "Open approvals", href: "/approvals" },
      { label: "Review reports", href: "/reports" },
    ],
    focusAreas: [
      {
        title: "Control surface",
        summary:
          "The finance route concentrates on approval bottlenecks and accounting hygiene.",
        bullets: [
          "Separate operational throughput from accounting controls.",
          "Keep close blockers visible at the top of the route.",
          "Use reporting exports as read-only artifacts, not workflow state.",
        ],
      },
      {
        title: "Integration targets",
        summary:
          "Receivables, payables, and close tasks should converge on shared audit logging.",
        bullets: [
          "Every posting workflow needs actor attribution.",
          "Exception queues should link to approval records.",
          "Aging and close snapshots should be cacheable summaries.",
        ],
      },
    ],
    milestones: [
      "Introduce journal and subledger domain services.",
      "Back receivables and payables metrics with SQL views.",
      "Connect close tasks to approval comments and audit trails.",
    ],
  },
  {
    id: "sales",
    href: "/sales",
    label: "Sales",
    navigationLabel: "Sales",
    description:
      "Quotes, orders, invoicing triggers, and customer commitments.",
    summary:
      "Sales tracks commitment flow from quote acceptance through invoice handoff.",
    ownerTeam: "Commercial Operations",
    requiredCapability: "sales.view",
    status: { label: "Workflow ready", tone: "positive" },
    metrics: [
      {
        label: "Open quotes",
        value: "18",
        detail: "Commercial proposals pending confirmation or revision.",
        tone: "neutral",
      },
      {
        label: "Orders at risk",
        value: "04",
        detail: "Orders blocked by stock allocation or credit review.",
        tone: "warning",
      },
      {
        label: "Invoice handoffs",
        value: "11",
        detail: "Orders cleared for finance processing today.",
        tone: "positive",
      },
    ],
    defaultViews: ["Pipeline pressure", "Order execution", "Credit blockers"],
    actions: [
      { label: "Inspect CRM", href: "/crm" },
      { label: "Check inventory", href: "/inventory" },
    ],
    focusAreas: [
      {
        title: "Commercial throughput",
        summary:
          "The route should make blocked revenue visible before customers feel it.",
        bullets: [
          "Show orders at risk with direct dependency hints.",
          "Keep commercial and operational ownership separated.",
          "Attach invoice readiness to finance handoff expectations.",
        ],
      },
      {
        title: "Role-aware execution",
        summary:
          "Sales should stay usable for staff while preserving managerial oversight.",
        bullets: [
          "Use capability checks for pricing-sensitive workflows.",
          "Expose status, not raw accounting controls, to commercial roles.",
          "Coordinate with CRM for account-level context.",
        ],
      },
    ],
    milestones: [
      "Add quote and order schema in the domain package.",
      "Link order blockers to approval tasks.",
      "Persist invoice handoff telemetry in observability events.",
    ],
  },
  {
    id: "purchasing",
    href: "/purchasing",
    label: "Purchasing",
    navigationLabel: "Purchasing",
    description: "Supplier relationships, POs, receipts, and spend controls.",
    summary:
      "Purchasing centers on order release readiness, receiving exceptions, and supplier holds.",
    ownerTeam: "Procurement Operations",
    requiredCapability: "purchasing.view",
    status: { label: "Workflow ready", tone: "positive" },
    metrics: [
      {
        label: "Pending POs",
        value: "09",
        detail: "Orders waiting for budget or inventory sign-off.",
        tone: "warning",
      },
      {
        label: "Receipts delayed",
        value: "03",
        detail: "Expected receipts slipped past supplier commitment windows.",
        tone: "warning",
      },
      {
        label: "Supplier holds",
        value: "02",
        detail: "Payment or compliance issues impacting replenishment.",
        tone: "neutral",
      },
    ],
    defaultViews: ["PO release", "Inbound receipts", "Supplier issues"],
    actions: [
      { label: "Open inventory", href: "/inventory" },
      { label: "Review approvals", href: "/approvals" },
    ],
    focusAreas: [
      {
        title: "Spend discipline",
        summary:
          "Purchasing should reflect approval pressure before it affects service levels.",
        bullets: [
          "Tie blocked POs to explicit approvers and due dates.",
          "Keep supplier exception counts visible at route entry.",
          "Use receipts as the bridge between operations and finance.",
        ],
      },
      {
        title: "Operational continuity",
        summary: "Inventory and purchasing need a shared view of inbound risk.",
        bullets: [
          "Highlight items that jeopardize open sales orders.",
          "Show receiving exceptions separately from authorization issues.",
          "Keep supplier holds traceable to audit entries.",
        ],
      },
    ],
    milestones: [
      "Persist PO and receipt entities in the database layer.",
      "Map supplier issues into approval workflows.",
      "Add audit events for supplier state changes.",
    ],
  },
  {
    id: "inventory",
    href: "/inventory",
    label: "Inventory",
    navigationLabel: "Inventory",
    description:
      "Stock health, locations, replenishment, and movement exceptions.",
    summary:
      "Inventory prioritizes stock exposure, replenishment timing, and movement integrity.",
    ownerTeam: "Operations Execution",
    requiredCapability: "inventory.view",
    status: { label: "Operational", tone: "positive" },
    metrics: [
      {
        label: "Low-stock alerts",
        value: "08",
        detail: "Critical SKUs trending below the reorder threshold.",
        tone: "warning",
      },
      {
        label: "Transfer exceptions",
        value: "02",
        detail: "Location transfers awaiting confirmation or recount.",
        tone: "warning",
      },
      {
        label: "Replenishment coverage",
        value: "12 days",
        detail: "Current median on-hand runway across active SKUs.",
        tone: "neutral",
      },
    ],
    defaultViews: ["Stock exposure", "Movement exceptions", "Inbound coverage"],
    actions: [
      { label: "Check purchasing", href: "/purchasing" },
      { label: "Review sales", href: "/sales" },
    ],
    focusAreas: [
      {
        title: "Execution integrity",
        summary:
          "Inventory should surface the operational consequences of purchasing and sales decisions.",
        bullets: [
          "Keep low-stock coverage prominent and action-oriented.",
          "Separate demand pressure from process variance.",
          "Expose transfer and count exceptions as explicit queues.",
        ],
      },
      {
        title: "Control model",
        summary:
          "Movement history and stock adjustments need strong audit semantics.",
        bullets: [
          "Every adjustment should be attributable to a human or system actor.",
          "Location-specific states should remain tenant scoped.",
          "Reporting should derive from movement events, not UI state.",
        ],
      },
    ],
    milestones: [
      "Add stock movement and location schema.",
      "Connect replenishment coverage to purchasing receipts.",
      "Expose variance trends in reporting exports.",
    ],
  },
  {
    id: "hr",
    href: "/hr",
    label: "HR",
    navigationLabel: "HR",
    description: "People operations, records, leave, and workforce exceptions.",
    summary:
      "HR organizes workforce changes, leave pressure, and records that require administrative review.",
    ownerTeam: "People Operations",
    requiredCapability: "hr.view",
    status: { label: "Records foundation", tone: "warning" },
    metrics: [
      {
        label: "Leave conflicts",
        value: "02",
        detail: "Time-off requests overlapping critical operating windows.",
        tone: "warning",
      },
      {
        label: "Profile gaps",
        value: "06",
        detail:
          "Employment records missing mandatory payroll or compliance fields.",
        tone: "warning",
      },
      {
        label: "Pending changes",
        value: "04",
        detail: "Role, manager, or compensation changes awaiting validation.",
        tone: "neutral",
      },
    ],
    defaultViews: ["Workforce changes", "Leave pressure", "Record quality"],
    actions: [
      { label: "Open approvals", href: "/approvals" },
      { label: "Check system admin", href: "/system-admin" },
    ],
    focusAreas: [
      {
        title: "People workflow hygiene",
        summary:
          "The HR route should make operational risk visible without exposing unnecessary sensitive detail.",
        bullets: [
          "Keep records quality separate from compensation controls.",
          "Use approvals for policy-bound changes.",
          "Treat workforce records as admin-owned data with narrow capability access.",
        ],
      },
      {
        title: "Integration constraints",
        summary:
          "HR must join the same tenant, audit, and notification model as other modules.",
        bullets: [
          "Leave conflicts should be reproducible from scheduling state.",
          "Administrative changes require actor attribution.",
          "Reporting outputs should be capability-filtered.",
        ],
      },
    ],
    milestones: [
      "Introduce people and leave schema.",
      "Add policy validation and approval escalation.",
      "Pipe workforce anomalies into dashboard summaries.",
    ],
  },
  {
    id: "crm",
    href: "/crm",
    label: "CRM",
    navigationLabel: "CRM",
    description:
      "Accounts, contacts, leads, pipeline activity, and relationship risk.",
    summary:
      "CRM focuses on account health, stalled opportunities, and relationship continuity.",
    ownerTeam: "Revenue Operations",
    requiredCapability: "crm.view",
    status: { label: "Workflow ready", tone: "positive" },
    metrics: [
      {
        label: "Stalled leads",
        value: "07",
        detail:
          "Accounts without follow-up activity in the last 5 business days.",
        tone: "warning",
      },
      {
        label: "Renewal watchlist",
        value: "05",
        detail: "Customer accounts requiring coordinated commercial action.",
        tone: "neutral",
      },
      {
        label: "Activity coverage",
        value: "83%",
        detail: "Accounts with recent owner activity or next-step plans.",
        tone: "positive",
      },
    ],
    defaultViews: ["Pipeline hygiene", "Account risk", "Activity coverage"],
    actions: [
      { label: "Open sales", href: "/sales" },
      { label: "Check reports", href: "/reports" },
    ],
    focusAreas: [
      {
        title: "Relationship continuity",
        summary:
          "CRM should reveal commercial risk before it becomes a revenue or service issue.",
        bullets: [
          "Prioritize stalled leads and renewal accounts.",
          "Keep account ownership explicit and reviewable.",
          "Use activity coverage as a hygiene signal, not a vanity metric.",
        ],
      },
      {
        title: "Cross-module fit",
        summary:
          "CRM becomes more useful when it connects to sales execution and reporting.",
        bullets: [
          "Expose downstream order blockers from sales.",
          "Keep notes and activity scoped to the active organization.",
          "Use saved views for role-specific commercial reviews.",
        ],
      },
    ],
    milestones: [
      "Persist accounts, contacts, and activity entities.",
      "Join stalled opportunities to approval and reporting views.",
      "Track engagement telemetry for key account flows.",
    ],
  },
  {
    id: "approvals",
    href: "/approvals",
    label: "Approvals",
    navigationLabel: "Approvals",
    description:
      "Approval queues, escalations, SLA pressure, and decision trails.",
    summary:
      "Approvals is the control route for time-bound decisions across finance, purchasing, HR, and operations.",
    ownerTeam: "Workflow Platform",
    requiredCapability: "approvals.view",
    status: { label: "Control route", tone: "positive" },
    metrics: [
      {
        label: "Queue depth",
        value: "14",
        detail:
          "Requests currently open across operational and financial workflows.",
        tone: "warning",
      },
      {
        label: "Escalations",
        value: "03",
        detail: "Requests outside their target review window.",
        tone: "warning",
      },
      {
        label: "Median cycle time",
        value: "6h 12m",
        detail: "Decision time for completed requests over the last week.",
        tone: "positive",
      },
    ],
    defaultViews: ["Action queue", "Escalations", "Decision trail"],
    actions: [
      { label: "Review finance", href: "/finance" },
      { label: "Review purchasing", href: "/purchasing" },
    ],
    focusAreas: [
      {
        title: "Decision control",
        summary:
          "Approvals should reduce latency without weakening authorization boundaries.",
        bullets: [
          "Queue depth and escalations need direct route owners.",
          "Comments and audit trails should live together.",
          "Every approval action should revalidate authorization on the server.",
        ],
      },
      {
        title: "Workflow orchestration",
        summary:
          "Approval state is shared infrastructure for the rest of the ERP.",
        bullets: [
          "Purchasing, finance, and HR all contribute work into the queue.",
          "Escalations should be metadata-driven, not hard-coded per page.",
          "Automation summaries belong next to the manual queue.",
        ],
      },
    ],
    milestones: [
      "Persist approval request and comment schema.",
      "Connect escalation jobs in the workflows package.",
      "Emit audit entries for every state transition.",
    ],
  },
  {
    id: "reports",
    href: "/reports",
    label: "Reports",
    navigationLabel: "Reports",
    description:
      "Saved views, exports, snapshots, and operational insight delivery.",
    summary:
      "Reports provides operational and executive output surfaces built from tenant-safe summaries.",
    ownerTeam: "Data and Insights",
    requiredCapability: "reports.view",
    status: { label: "Insight surface", tone: "positive" },
    metrics: [
      {
        label: "Saved views",
        value: "12",
        detail:
          "Reusable reporting presets for finance, sales, and operations.",
        tone: "positive",
      },
      {
        label: "Exports today",
        value: "27",
        detail: "Downloaded operational snapshots and scheduled share bundles.",
        tone: "neutral",
      },
      {
        label: "Stale snapshots",
        value: "01",
        detail: "A scheduled report missed its freshness target.",
        tone: "warning",
      },
    ],
    defaultViews: ["Saved views", "Export activity", "Freshness health"],
    actions: [
      { label: "Go to dashboard", href: "/dashboard" },
      { label: "Open system admin", href: "/system-admin" },
    ],
    focusAreas: [
      {
        title: "Decision support",
        summary:
          "Reports should serve read-heavy workflows without duplicating transactional UX.",
        bullets: [
          "Saved views should reflect role-based defaults.",
          "Freshness is part of report quality, not a hidden system metric.",
          "Exports should preserve tenant and capability boundaries.",
        ],
      },
      {
        title: "Performance discipline",
        summary: "Reporting is where poor query shape becomes visible first.",
        bullets: [
          "Use summaries and precomputed views for repeated workloads.",
          "Track latency and freshness together.",
          "Avoid route-level N+1 fetches for export metadata.",
        ],
      },
    ],
    milestones: [
      "Introduce saved-report schema and export logging.",
      "Cache recurring reports with explicit invalidation rules.",
      "Add observability traces for expensive report generation paths.",
    ],
  },
  {
    id: "system-admin",
    href: "/system-admin",
    label: "System admin",
    navigationLabel: "System admin",
    description:
      "Users, roles, settings, audit access, and tenant-level controls.",
    summary:
      "System admin is the tenant governance surface for identity, role assignment, and platform controls.",
    ownerTeam: "Platform Administration",
    requiredCapability: "system-admin.view",
    status: { label: "Governance route", tone: "warning" },
    metrics: [
      {
        label: "Admins",
        value: "04",
        detail: "Operators with elevated tenant control rights.",
        tone: "neutral",
      },
      {
        label: "Role changes",
        value: "02",
        detail: "Membership updates pending review or communication.",
        tone: "warning",
      },
      {
        label: "Audit entries",
        value: "128",
        detail: "Governance-relevant events retained for tenant review.",
        tone: "positive",
      },
    ],
    defaultViews: ["Role control", "Tenant settings", "Audit access"],
    actions: [
      { label: "Identity & access", href: "/system-admin/identity" },
      { label: "Tenant settings", href: "/system-admin/settings" },
      { label: "Audit log", href: "/system-admin/audit" },
      { label: "Machine layer ops", href: "/system-admin/machine-layer" },
    ],
    focusAreas: [
      {
        title: "Governance boundaries",
        summary:
          "System admin routes must aggressively re-check authorization and keep state changes observable.",
        bullets: [
          "Do not trust client role state for privileged actions.",
          "Log membership changes and tenant settings updates.",
          "Treat audit access as a first-class capability.",
        ],
      },
      {
        title: "Operational fit",
        summary:
          "System admin should expose tenant control without becoming a dumping ground for unrelated configuration.",
        bullets: [
          "Keep identity, membership, and governance surfaces distinct.",
          "Prefer explicit workflows to hidden settings.",
          "Use observability metadata to highlight risky operations.",
        ],
      },
    ],
    milestones: [
      "Add membership management backed by Neon Auth identity.",
      "Persist tenant settings and audit-read controls.",
      "Introduce system-admin-only traces and mutation logging.",
    ],
  },
] as const satisfies readonly ErpModuleDefinition[];

export const erpModules = modules;

export const moduleById = new Map<ModuleId, ErpModuleDefinition>(
  erpModules.map((module) => [module.id, module]),
);

export const moduleByHref = new Map<string, ErpModuleDefinition>(
  erpModules.map((module) => [module.href, module]),
);
