export type BillingReadinessVerdict = "ready" | "warning" | "blocked";

export type BillingReadinessIssue = {
  id: string;
  title: string;
  description: string;
};

export type BillingReadinessReport = {
  verdict: BillingReadinessVerdict;
  issues: readonly BillingReadinessIssue[];
};

export function formatBillingReadinessVerdictLabel(
  verdict: BillingReadinessVerdict,
) {
  if (verdict === "blocked") {
    return "Blocked";
  }

  if (verdict === "warning") {
    return "Warning";
  }

  return "Ready";
}
