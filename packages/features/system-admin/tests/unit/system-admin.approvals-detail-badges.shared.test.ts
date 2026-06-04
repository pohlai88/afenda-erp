import { describe, expect, it } from "vitest";

import {
  resolveSystemAdminApprovalEnabledBadgePresentation,
  resolveSystemAdminApprovalReadinessBadgePresentation,
  resolveSystemAdminApprovalStatusBadgePresentation,
  resolveSystemAdminListCellBadgeVariant,
  systemAdminApprovalEnabledBadgeVariant,
  systemAdminApprovalReadinessBadgeVariant,
  systemAdminApprovalReadinessLabels,
  systemAdminApprovalStatusBadgeVariant,
  systemAdminApprovalStatusLabels,
  systemAdminApprovalEnabledBadgeAriaLabel,
  systemAdminApprovalStatusBadgeAriaLabel,
} from "../../src/features/approvals/sys-approvals-detail-badges.shared";

describe("system-admin approval detail badges", () => {
  it("maps list cell tones to badge variants", () => {
    expect(
      resolveSystemAdminListCellBadgeVariant({
        kind: "badge",
        tone: "positive",
      }),
    ).toBe("success");
    expect(
      resolveSystemAdminListCellBadgeVariant({
        kind: "badge",
        tone: "attention",
      }),
    ).toBe("warning");
  });

  it("maps rule status to list-surface-aligned badge variants", () => {
    expect(systemAdminApprovalStatusBadgeVariant("active")).toBe("success");
    expect(systemAdminApprovalStatusBadgeVariant("disabled")).toBe("critical");
    expect(systemAdminApprovalStatusBadgeVariant("deprecated")).toBe(
      "critical",
    );
  });

  it("maps readiness verdict to list-surface-aligned badge variants", () => {
    expect(systemAdminApprovalReadinessBadgeVariant("ready")).toBe("success");
    expect(systemAdminApprovalReadinessBadgeVariant("warning")).toBe("warning");
    expect(systemAdminApprovalReadinessBadgeVariant("blocked")).toBe(
      "critical",
    );
  });

  it("maps enabled state to badge variants", () => {
    expect(systemAdminApprovalEnabledBadgeVariant(true)).toBe("success");
    expect(systemAdminApprovalEnabledBadgeVariant(false)).toBe("secondary");
  });

  it("exposes presentation bundles for detail and list surfaces", () => {
    expect(resolveSystemAdminApprovalStatusBadgePresentation("active")).toEqual({
      label: "Active",
      variant: "success",
    });
    expect(
      resolveSystemAdminApprovalReadinessBadgePresentation("blocked"),
    ).toEqual({
      label: "Blocked",
      variant: "critical",
    });
    expect(resolveSystemAdminApprovalEnabledBadgePresentation(true)).toEqual({
      label: "Enabled",
      variant: "success",
    });
  });

  it("exposes human-readable labels and aria labels", () => {
    expect(systemAdminApprovalStatusLabels.active).toBe("Active");
    expect(systemAdminApprovalReadinessLabels.blocked).toBe("Blocked");
    expect(systemAdminApprovalStatusBadgeAriaLabel("deprecated")).toBe(
      "Status: Deprecated",
    );
    expect(systemAdminApprovalEnabledBadgeAriaLabel(false)).toBe(
      "Enabled: Disabled",
    );
  });
});
