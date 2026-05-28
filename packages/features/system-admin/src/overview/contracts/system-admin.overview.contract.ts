export type SystemAdminOverviewSnapshot = {
  userCount: number;
  pendingInviteCount: number;
  activeMembershipCount: number;
  roleCount: number;
  recentAdminChangeCount: number;
  recentAdminChanges: ReadonlyArray<{
    id: string;
    action: string;
    summary: string;
    createdAt: Date;
  }>;
};
