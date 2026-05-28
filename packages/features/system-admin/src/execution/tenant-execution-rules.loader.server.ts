import {
  listTenantApprovalSettings,
  listTenantPolicySettings,
} from "@afenda/db";
import type {
  TenantApprovalRuleRecord,
  TenantPolicyRuleRecord,
} from "@afenda/kernel/execution-tenant-policy";
import { cache } from "react";
import { mapTenantApprovalSettingToKernelRecord } from "../approvals/data/system-admin.approval-rules.mapper";
import { mapTenantPolicySettingToKernelRecord } from "../policies/data/system-admin.policy-rules.mapper";

export const loadTenantExecutionRulesForOrganization = cache(
  async (organizationId: string): Promise<{
    policyRules: readonly TenantPolicyRuleRecord[];
    approvalRules: readonly TenantApprovalRuleRecord[];
  }> => {
    const [policyRows, approvalRows] = await Promise.all([
      listTenantPolicySettings({ organizationId, limit: 500 }),
      listTenantApprovalSettings({ organizationId, limit: 500 }),
    ]);

    return {
      policyRules: policyRows
        .map(mapTenantPolicySettingToKernelRecord)
        .filter((rule): rule is TenantPolicyRuleRecord => rule !== null),
      approvalRules: approvalRows
        .map(mapTenantApprovalSettingToKernelRecord)
        .filter((rule): rule is TenantApprovalRuleRecord => rule !== null),
    };
  },
);
