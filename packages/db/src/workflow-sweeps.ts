import {
  listOrganizationsForCoreErpSeed,
  summarizeTenantOrganizationMetrics,
} from "./erp";

export type TenantWorkflowSweepResult = {
  checkedAt: string;
  organizationCount: number;
  scannedItems: number;
  escalations: number;
  highPriority: number;
  status: "healthy" | "watch";
};

function resolveSweepStatus(input: {
  escalations: number;
  highPriority: number;
}) {
  if (input.escalations > 0 || input.highPriority > 3) {
    return "watch" as const;
  }

  return "healthy" as const;
}

async function summarizeTenantWorkflowQueues() {
  const organizations = await listOrganizationsForCoreErpSeed();
  let scannedItems = 0;
  let escalations = 0;
  let highPriority = 0;

  for (const organization of organizations) {
    const summary = await summarizeTenantOrganizationMetrics({
      organizationId: organization.id,
    });

    scannedItems += summary.pendingWorkItemCount;
    escalations += summary.escalatedWorkItemCount;
    highPriority += summary.highPriorityWorkItemCount;
  }

  return {
    organizationCount: organizations.length,
    scannedItems,
    escalations,
    highPriority,
  };
}

export async function runTenantReminderSweep(): Promise<TenantWorkflowSweepResult> {
  const totals = await summarizeTenantWorkflowQueues();

  return {
    checkedAt: new Date().toISOString(),
    organizationCount: totals.organizationCount,
    scannedItems: totals.scannedItems,
    escalations: totals.escalations,
    highPriority: totals.highPriority,
    status: resolveSweepStatus(totals),
  };
}

export async function runTenantSyncSweep(): Promise<TenantWorkflowSweepResult> {
  const totals = await summarizeTenantWorkflowQueues();

  return {
    checkedAt: new Date().toISOString(),
    organizationCount: totals.organizationCount,
    scannedItems: totals.scannedItems + totals.organizationCount,
    escalations: totals.escalations,
    highPriority: totals.highPriority,
    status: resolveSweepStatus(totals),
  };
}

export async function runTenantHousekeepingSweep(): Promise<TenantWorkflowSweepResult> {
  const organizations = await listOrganizationsForCoreErpSeed();
  let scannedItems = 0;

  for (const organization of organizations) {
    const summary = await summarizeTenantOrganizationMetrics({
      organizationId: organization.id,
    });

    scannedItems += summary.documentCount + summary.workItemCount;
  }

  return {
    checkedAt: new Date().toISOString(),
    organizationCount: organizations.length,
    scannedItems,
    escalations: 0,
    highPriority: 0,
    status: "healthy",
  };
}
