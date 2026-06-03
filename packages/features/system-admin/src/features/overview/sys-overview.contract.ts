export type SystemAdminOverviewSnapshot = {
  userCount: number;
  pendingInviteCount: number;
  activeMembershipCount: number;
  roleCount: number;
  activePolicyRuleCount: number;
  activeApprovalRuleCount: number;
  recentAdminChangeCount: number;
  recentAdminChanges: ReadonlyArray<{
    id: string;
    action: string;
    summary: string;
    createdAt: Date;
  }>;
};
