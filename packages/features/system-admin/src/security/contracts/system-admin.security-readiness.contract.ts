export type SecurityReadinessVerdict = "ready" | "warning" | "blocked";

export type SecurityReadinessIssue = {
  id: string;
  title: string;
  description: string;
};

export type SecurityReadinessReport = {
  verdict: SecurityReadinessVerdict;
  issues: readonly SecurityReadinessIssue[];
};
