export type OrganizationSecuritySettings = {
  organizationId: string;
  requireMfaForAdmins: boolean;
  allowedEmailDomains: readonly string[];
  sessionMaxAgeMinutes: number;
  idleTimeoutMinutes: number;
  requireSensitiveActionConfirmation: boolean;
  restrictInvitesToAllowedDomains: boolean;
  adminLockoutProtectionEnabled: boolean;
  updatedByUserId: string | null;
  updatedAt: Date | null;
};
