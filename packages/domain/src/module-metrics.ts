import type { TenantModuleMetricSummary } from "@afenda/db";

type ModuleTone = "neutral" | "positive" | "warning";

type ModuleMetric = {
  label: string;
  value: string;
  detail: string;
  tone: ModuleTone;
};

function padCount(value: number) {
  return String(value).padStart(2, "0");
}

function formatCurrencyFromCents(cents: number, currency = "MYR") {
  if (cents <= 0) {
    return currency === "MYR" ? "RM0" : "$0";
  }

  const amount = cents / 100;

  if (currency === "MYR") {
    return `RM${Math.round(amount).toLocaleString("en-MY")}`;
  }

  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

function toneForPressure(count: number, warningAt: number): ModuleTone {
  if (count >= warningAt) {
    return "warning";
  }

  if (count > 0) {
    return "neutral";
  }

  return "positive";
}

function resolveByLabel(
  metric: ModuleMetric,
  summary: TenantModuleMetricSummary,
): ModuleMetric | null {
  const label = metric.label.toLowerCase();

  if (
    label.includes("approval") ||
    label.includes("queue") ||
    label.includes("quote")
  ) {
    return {
      ...metric,
      value: padCount(summary.pendingWorkItemCount),
      detail: `${summary.pendingWorkItemCount} open workflow items and ${summary.workItemCount} total in tenant data.`,
      tone: toneForPressure(summary.pendingWorkItemCount, 5),
    };
  }

  if (
    label.includes("exception") ||
    label.includes("blocker") ||
    label.includes("hold") ||
    label.includes("variance") ||
    label.includes("sla")
  ) {
    const exceptions =
      summary.blockedRecordCount + summary.escalatedWorkItemCount;

    return {
      ...metric,
      value: padCount(exceptions),
      detail: `${summary.blockedRecordCount} blocked records and ${summary.escalatedWorkItemCount} escalated work items.`,
      tone: toneForPressure(exceptions, 1),
    };
  }

  if (
    label.includes("receivable") ||
    label.includes("due") ||
    label.includes("aging")
  ) {
    return {
      ...metric,
      value: formatCurrencyFromCents(summary.dueAmountCents),
      detail: `${summary.dueSoonRecordCount} active records due within the next 7 days.`,
      tone: summary.dueSoonRecordCount > 0 ? "warning" : "neutral",
    };
  }

  if (label.includes("healthy") || label.includes("/")) {
    return {
      ...metric,
      value: `${summary.modulesWithData}/${summary.moduleCapacity}`,
      detail: `${summary.modulesWithData} modules have tenant records or workflow items loaded.`,
      tone:
        summary.modulesWithData >= summary.moduleCapacity - 2
          ? "positive"
          : "neutral",
    };
  }

  if (label.includes("document") || label.includes("export")) {
    return {
      ...metric,
      value: padCount(summary.documentCount),
      detail: `${summary.documentCount} documents registered for this scope.`,
      tone: summary.documentCount > 0 ? "positive" : "neutral",
    };
  }

  if (label.includes("order") || label.includes("pipeline")) {
    return {
      ...metric,
      value: padCount(summary.activeRecordCount),
      detail: `${summary.activeRecordCount} active records in tenant storage.`,
      tone: toneForPressure(summary.blockedRecordCount, 1),
    };
  }

  return null;
}

function resolveBySlot(
  metric: ModuleMetric,
  summary: TenantModuleMetricSummary,
  index: number,
): ModuleMetric {
  if (index === 0) {
    const pressure =
      summary.blockedRecordCount + summary.escalatedWorkItemCount;

    return {
      ...metric,
      value: padCount(pressure),
      detail: `${summary.blockedRecordCount} blocked records and ${summary.escalatedWorkItemCount} escalated items.`,
      tone: toneForPressure(pressure, 1),
    };
  }

  if (index === 1) {
    return {
      ...metric,
      value:
        summary.dueAmountCents > 0
          ? formatCurrencyFromCents(summary.dueAmountCents)
          : String(summary.activeRecordCount),
      detail:
        summary.dueSoonRecordCount > 0
          ? `${summary.dueSoonRecordCount} records due within 7 days.`
          : `${summary.activeRecordCount} active tenant records.`,
      tone: summary.dueSoonRecordCount > 0 ? "warning" : "neutral",
    };
  }

  return {
    ...metric,
    value: padCount(summary.workItemCount),
    detail: `${summary.highPriorityWorkItemCount} high-priority workflow items in scope.`,
    tone: toneForPressure(summary.highPriorityWorkItemCount, 1),
  };
}

export function resolveModuleMetrics(
  metrics: readonly ModuleMetric[],
  summary: TenantModuleMetricSummary,
): ModuleMetric[] {
  return metrics.map((metric, index) => {
    return resolveByLabel(metric, summary) ?? resolveBySlot(metric, summary, index);
  });
}
