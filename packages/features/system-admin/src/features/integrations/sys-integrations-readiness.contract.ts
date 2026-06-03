export type IntegrationReadinessVerdict = "ready" | "warning" | "blocked";

export type IntegrationReadinessIssue = {
  id: string;
  title: string;
  description: string;
};

export type IntegrationReadinessReport = {
  verdict: IntegrationReadinessVerdict;
  issues: readonly IntegrationReadinessIssue[];
};

export function formatIntegrationReadinessVerdictLabel(
  verdict: IntegrationReadinessVerdict,
) {
  if (verdict === "blocked") {
    return "Blocked";
  }

  if (verdict === "warning") {
    return "Warning";
  }

  return "Ready";
}
