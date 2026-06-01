import { describe, expect, it } from "vitest";

import type { LynxReadinessSnapshot } from "../../src/contracts/lynx.readiness.contract";
import {
  moduleById,
  type ModuleWorkspace,
} from "@afenda/kernel";
import type { EvaluateLynxOutcomeMonitorsInput } from "../../src/workflows/lynx.outcome-monitor.workflow.server";

const { evaluateLynxOutcomeMonitors } =
  await import("../../src/workflows/lynx.outcome-monitor.workflow.server");

function workspace(input: {
  moduleId: "finance" | "approvals" | "reports" | "system-admin";
  records?: Array<{
    id: string;
    reference: string;
    title: string;
    recordType: string;
    status: string;
  }>;
  workItems?: Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
  }>;
  documents?: Array<{ id: string; title: string }>;
  savedViewCount?: number;
  persisted?: boolean;
}): ModuleWorkspace {
  const moduleDefinition = moduleById.get(input.moduleId);
  if (!moduleDefinition) {
    throw new Error(`Missing test module definition for ${input.moduleId}.`);
  }

  return {
    module: moduleDefinition,
    dataMode: input.persisted === false ? "metadata" : "persisted",
    fallbackApplied: input.persisted === false,
    records: (input.records ?? []).map((record) => ({
      ...record,
      owner: "Owner",
      amount: "-",
      amountValue: null,
      currency: "USD",
      due: "-",
      dueAt: null,
      metadataSummary: "",
      extensionValid: true,
      extensionIssues: [],
    })),
    recordWindow: {
      pageSize: 10,
      totalCount: input.records?.length ?? 0,
      hasNextPage: false,
    },
    savedViews: Array.from(
      { length: input.savedViewCount ?? 1 },
      (_, index) => ({
        id: `${input.moduleId}_view_${index}`,
        name: "Control view",
        description: "Control view",
        visibility: "tenant",
      }),
    ),
    workItems: (input.workItems ?? []).map((item) => ({
      ...item,
      moduleId: input.moduleId,
      owner: "Owner",
      due: "-",
      dueAt: "",
    })),
    workItemWindow: {
      pageSize: 10,
      totalCount: input.workItems?.length ?? 0,
      hasNextPage: false,
    },
    documents: (input.documents ?? []).map((document) => ({
      ...document,
      contentType: "application/pdf",
      size: "1 KB",
      access: "private",
    })),
    documentWindow: {
      pageSize: 10,
      totalCount: input.documents?.length ?? 0,
      hasNextPage: false,
    },
  } satisfies ModuleWorkspace;
}

function readinessSnapshot(input?: {
  evalGateStatus?: "available" | "partial" | "unavailable";
  moduleStatus?: "available" | "partial" | "unavailable";
}): LynxReadinessSnapshot {
  const moduleStatus = input?.moduleStatus ?? "available";
  return {
    organizationId: "org_1",
    generatedAt: new Date().toISOString(),
    status: moduleStatus,
    summary: "Ready",
    knowledge: {
      status: "available",
      sourceCount: 1,
      documentCount: 1,
      chunkCount: 1,
      latestEvalAt: new Date().toISOString(),
      evalGate: {
        status: input?.evalGateStatus ?? "available",
        reasons: [],
      },
    },
    modules: ["finance", "approvals", "reports", "system-admin"].map(
      (moduleId) => ({
        moduleId,
        moduleLabel: moduleId,
        status: moduleStatus,
        safeNextAction: "Use Lynx.",
        signals: [],
        tools: [],
      }),
    ),
    tools: [],
    enterpriseControls: [],
  };
}

function baseInput(): EvaluateLynxOutcomeMonitorsInput {
  return {
    organizationId: "org_1",
    readinessSnapshot: readinessSnapshot(),
    workspaces: {
      finance: workspace({
        moduleId: "finance",
        documents: [{ id: "doc_fin", title: "Finance evidence" }],
      }),
      approvals: workspace({
        moduleId: "approvals",
        documents: [{ id: "doc_app", title: "Approval evidence" }],
      }),
      reports: workspace({
        moduleId: "reports",
        documents: [{ id: "doc_rep", title: "Report evidence" }],
      }),
      "system-admin": workspace({
        moduleId: "system-admin",
        documents: [{ id: "doc_admin", title: "System admin evidence" }],
      }),
    },
    approvalProposals: [],
    sandboxes: [],
  };
}

describe("Lynx outcome monitors", () => {
  it("returns watch for finance control pressure", () => {
    const input = baseInput();
    input.workspaces.finance = workspace({
      moduleId: "finance",
      records: [
        {
          id: "rec_1",
          reference: "FIN-1",
          title: "Blocked close",
          recordType: "close-control",
          status: "blocked",
        },
      ],
      workItems: [
        {
          id: "work_1",
          subject: "Review variance",
          status: "pending",
          priority: "high",
        },
      ],
      documents: [{ id: "doc_fin", title: "Finance evidence" }],
    });

    const finance = evaluateLynxOutcomeMonitors(input).find(
      (result) => result.monitorId === "finance-control-watch",
    );

    expect(finance?.status).toBe("watch");
    expect(finance?.evidenceReferences.length).toBeGreaterThan(0);
  });

  it("returns watch for approval escalations and pending reviews", () => {
    const input = baseInput();
    input.workspaces.approvals = workspace({
      moduleId: "approvals",
      workItems: [
        {
          id: "work_2",
          subject: "Approve exception",
          status: "escalated",
          priority: "high",
        },
      ],
      documents: [{ id: "doc_app", title: "Approval evidence" }],
    });
    input.sandboxes = [
      {
        id: "sandbox_1",
        moduleId: "finance",
        actionType: "proposal",
        title: "Pending proposal",
        proposedBy: "ai",
        status: "pending",
        riskLevel: "medium",
        approvalProposalId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const approvals = evaluateLynxOutcomeMonitors(input).find(
      (result) => result.monitorId === "approval-throughput-watch",
    );

    expect(approvals?.status).toBe("watch");
    expect(approvals?.severity).toBe("review");
  });

  it("does not treat rejected or executed proposals as open approval pressure", () => {
    const input = baseInput();
    input.approvalProposals = [
      {
        id: "proposal_1",
        moduleId: "finance",
        proposedAction: "Rejected finance action",
        rationale: "Already rejected.",
        status: "rejected",
        riskLevel: "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "proposal_2",
        moduleId: "finance",
        proposedAction: "Executed finance action",
        rationale: "Already executed.",
        status: "executed",
        riskLevel: "low",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const approvals = evaluateLynxOutcomeMonitors(input).find(
      (result) => result.monitorId === "approval-throughput-watch",
    );

    expect(approvals?.status).toBe("healthy");
    expect(approvals?.evidenceReferences).toEqual([]);
  });

  it("returns blocked for missing audit evidence or eval readiness", () => {
    const input = baseInput();
    input.readinessSnapshot = readinessSnapshot({
      evalGateStatus: "unavailable",
      moduleStatus: "unavailable",
    });
    input.workspaces.reports = workspace({
      moduleId: "reports",
      documents: [],
      savedViewCount: 0,
      persisted: false,
    });

    const audit = evaluateLynxOutcomeMonitors(input).find(
      (result) => result.monitorId === "audit-readiness-watch",
    );

    expect(audit?.status).toBe("blocked");
    expect(audit?.qualityGateSummary.status).toBe("failed");
  });

  it("keeps healthy monitors from requesting workflow review", () => {
    const results = evaluateLynxOutcomeMonitors(baseInput());

    expect(results.every((result) => result.status === "healthy")).toBe(true);
    expect(
      results.every((result) => result.qualityGateSummary.status === "passed"),
    ).toBe(true);
  });

  it("skips disabled monitors", () => {
    const input = {
      ...baseInput(),
      monitorSettings: [
        {
          id: "setting_1",
          organizationId: "org_1",
          monitorId: "finance-control-watch" as const,
          enabled: false,
          thresholds: {},
          ownerAuthUserId: "owner_1",
          severityPolicy: {},
          updatedByAuthUserId: "owner_1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    const results = evaluateLynxOutcomeMonitors(input);

    expect(
      results.some((result) => result.monitorId === "finance-control-watch"),
    ).toBe(false);
  });

  it("uses tenant thresholds to keep finance pressure healthy", () => {
    const input = baseInput();
    input.workspaces.finance = workspace({
      moduleId: "finance",
      records: [
        {
          id: "rec_1",
          reference: "FIN-1",
          title: "Blocked close",
          recordType: "close-control",
          status: "blocked",
        },
      ],
      documents: [{ id: "doc_fin", title: "Finance evidence" }],
    });
    const thresholdInput = {
      ...input,
      monitorSettings: [
        {
          id: "setting_1",
          organizationId: "org_1",
          monitorId: "finance-control-watch" as const,
          enabled: true,
          thresholds: {
            blockedRecordsWatchAbove: 5,
            closeControlsWatchAbove: 5,
            highPriorityWorkWatchAbove: 5,
          },
          ownerAuthUserId: "owner_1",
          severityPolicy: {},
          updatedByAuthUserId: "owner_1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    const finance = evaluateLynxOutcomeMonitors(thresholdInput).find(
      (result) => result.monitorId === "finance-control-watch",
    );

    expect(finance?.status).toBe("healthy");
  });
});
