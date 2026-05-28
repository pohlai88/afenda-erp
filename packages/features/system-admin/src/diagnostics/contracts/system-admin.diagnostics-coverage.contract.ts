export type SystemAdminDiagnosticsModuleCoverageRow = {
  id: string;
  moduleKey: string;
  moduleLabel: string;
  status: "healthy" | "notice" | "warning" | "blocked";
  blockedCount: number;
  warningCount: number;
  infoCount: number;
  totalCount: number;
  href: string;
};

export type SystemAdminDiagnosticsRecentChangeRow = {
  id: string;
  occurredAt: string;
  action: string;
  actionLabel: string;
  actorId: string;
  target: string;
  summary: string;
  href: string;
};
