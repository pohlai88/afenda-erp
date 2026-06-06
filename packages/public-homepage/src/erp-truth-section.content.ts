import {
  erpTruthSectionContentSchema,
  type ErpTruthSectionContent,
} from "./erp-truth-section.schema";

const erpTruthSectionContentInput = {
  heroClaim: {
    eyebrow: "Business truth engine for enterprise resource planning",
    headlineLines: [
      "Every ERP module.",
      "One evidence engine.",
      "One decision operator.",
    ],
    supportingCopy:
      "Finance, HR, inventory, sales, purchasing, documents, reports, and admin controls connect to Lynx, so teams can ask what is true, decide what to do, and act with governance.",
    differentiation:
      "Normal ERP stores records. Afenda lets operators prove, decide, and act across them.",
  },
  featurePanels: [
    {
      id: "truth-retrieval",
      title: "Lynx Truth Retrieval",
      purpose:
        "Evidence-backed answers across ERP records, documents, policies, workflows, and knowledge sources.",
      bullets: [
        "Ask across finance, HR, inventory, sales, documents, policies, and knowledge.",
        "Answers cite the source.",
        "Operators see what evidence was used.",
        "No guessing from disconnected dashboards.",
      ],
    },
    {
      id: "decision-operator",
      title: "Lynx Decision Operator",
      purpose:
        "AI-assisted operational decisions that inspect context, propose actions, route approvals, and leave an audit trail.",
      bullets: [
        "Turns ERP context into reviewed actions.",
        "Routes approvals before business writes.",
        "Records runs, feedback, and outcomes.",
        "Built for governed operations, not chat novelty.",
      ],
    },
  ],
  commandMap: {
    heading: "Question to evidence to governed action",
    flow: [
      "ERP modules",
      "Evidence sources",
      "Lynx Truth Retrieval",
      "Lynx Decision Operator",
      "Approval",
      "Audit trail",
    ],
    nodes: [
      {
        id: "finance",
        label: "Finance",
        role: "source",
        lane: "modules",
        status: "coverage",
      },
      {
        id: "sales",
        label: "Sales",
        role: "source",
        lane: "modules",
        status: "coverage",
      },
      {
        id: "crm",
        label: "CRM",
        role: "source",
        lane: "modules",
        status: "coverage",
      },
      {
        id: "purchasing",
        label: "Purchasing",
        role: "source",
        lane: "modules",
        status: "coverage",
      },
      {
        id: "inventory",
        label: "Inventory",
        role: "source",
        lane: "modules",
        status: "coverage",
      },
      {
        id: "hr-suite",
        label: "HR Suite",
        role: "source",
        lane: "modules",
        status: "coverage",
      },
      {
        id: "payroll",
        label: "Payroll",
        role: "source",
        lane: "modules",
        status: "planned",
      },
      {
        id: "time-attendance",
        label: "Time Attendance",
        role: "source",
        lane: "modules",
        status: "planned",
      },
      {
        id: "documents",
        label: "Documents",
        role: "source",
        lane: "evidence",
        status: "coverage",
      },
      {
        id: "knowledge",
        label: "Knowledge",
        role: "source",
        lane: "evidence",
        status: "coverage",
      },
      {
        id: "reports",
        label: "Reports",
        role: "source",
        lane: "evidence",
        status: "coverage",
      },
      {
        id: "system-admin",
        label: "System Admin",
        role: "control",
        lane: "approval",
        status: "coverage",
      },
      {
        id: "audit",
        label: "Audit",
        role: "control",
        lane: "audit",
        status: "coverage",
      },
      {
        id: "permissions",
        label: "Permissions",
        role: "control",
        lane: "approval",
        status: "coverage",
      },
      {
        id: "integrations",
        label: "Integrations",
        role: "source",
        lane: "evidence",
        status: "planned",
      },
      {
        id: "billing",
        label: "Billing",
        role: "control",
        lane: "approval",
        status: "coverage",
      },
      {
        id: "lynx-truth-engine",
        label: "Lynx Truth Engine",
        role: "truth-engine",
        lane: "lynx",
        status: "coverage",
      },
      {
        id: "lynx-decision-operator",
        label: "Lynx Decision Operator",
        role: "decision-operator",
        lane: "operator",
        status: "coverage",
      },
    ],
  },
  coverageGroups: [
    {
      id: "core-operations",
      title: "Core Operations",
      modules: [
        { id: "finance", label: "Finance", status: "coverage" },
        { id: "sales", label: "Sales", status: "coverage" },
        { id: "crm", label: "CRM", status: "coverage" },
        { id: "purchasing", label: "Purchasing", status: "coverage" },
        { id: "inventory", label: "Inventory", status: "coverage" },
      ],
    },
    {
      id: "people-operations",
      title: "People Operations",
      modules: [
        { id: "hr-suite", label: "HR Suite", status: "coverage" },
        {
          id: "payroll-compensation",
          label: "Payroll / compensation",
          status: "planned",
        },
        {
          id: "time-and-attendance",
          label: "Time and attendance",
          status: "planned",
        },
        { id: "talent-training", label: "Talent / training", status: "planned" },
        { id: "compliance", label: "Compliance", status: "coverage" },
      ],
    },
    {
      id: "knowledge-documents",
      title: "Knowledge And Documents",
      modules: [
        { id: "knowledge", label: "Knowledge", status: "coverage" },
        {
          id: "document-registry",
          label: "Document registry",
          status: "coverage",
        },
        {
          id: "document-activity",
          label: "Document activity",
          status: "coverage",
        },
        { id: "source-sync", label: "Source sync", status: "planned" },
        {
          id: "retrieval-evaluation",
          label: "Retrieval evaluation",
          status: "planned",
        },
      ],
    },
    {
      id: "control-governance",
      title: "Control And Governance",
      modules: [
        { id: "system-admin", label: "System Admin", status: "coverage" },
        {
          id: "users-roles-permissions",
          label: "Users / roles / permissions",
          status: "coverage",
        },
        {
          id: "modules-capabilities",
          label: "Modules / capabilities",
          status: "coverage",
        },
        { id: "audit", label: "Audit", status: "coverage" },
        {
          id: "billing-entitlements",
          label: "Billing / entitlements",
          status: "coverage",
        },
        { id: "integrations", label: "Integrations", status: "planned" },
        {
          id: "data-management",
          label: "Data management",
          status: "hidden",
        },
      ],
    },
    {
      id: "intelligence-layer",
      title: "Intelligence Layer",
      modules: [
        { id: "lynx-console", label: "Lynx Console", status: "coverage" },
        { id: "truth-search", label: "Truth Search", status: "coverage" },
        {
          id: "decision-operator",
          label: "Decision Operator",
          status: "coverage",
        },
        { id: "run-ledger", label: "Run ledger", status: "coverage" },
        {
          id: "outcome-monitors",
          label: "Outcome monitors",
          status: "planned",
        },
        {
          id: "reports-analytics",
          label: "Reports / analytics",
          status: "coverage",
        },
        { id: "dashboard", label: "Dashboard", status: "coverage" },
      ],
    },
  ],
  closingStatement:
    "Every record, document, workflow, and approval becomes part of the same operating truth.",
} as const satisfies ErpTruthSectionContent;

export const erpTruthSectionContent = erpTruthSectionContentSchema.parse(
  erpTruthSectionContentInput,
);
