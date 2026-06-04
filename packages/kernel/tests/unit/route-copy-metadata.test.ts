import { describe, expect, it } from "vitest";
import {
  dashboardRouteSections,
  documentWorkflowCopy,
  erpAssistantPanelCopy,
  getWorkspaceSkeletonNavItemIds,
  moduleScreenSections,
  routeErrorCopy,
  workspaceSkeletonNavItemIds,
} from "../../src/ker-route-copy-metadata";

describe("route copy metadata", () => {
  it("exposes workspace skeleton nav ids", () => {
    expect(getWorkspaceSkeletonNavItemIds()).toEqual(workspaceSkeletonNavItemIds);
    expect(workspaceSkeletonNavItemIds).toContain("lynx");
  });

  it("defines section copy for module and dashboard routes", () => {
    expect(moduleScreenSections.tenantRecords.title).toBe("Tenant records");
    expect(dashboardRouteSections.aiAssistant.title).toBe("Lynx review");
  });

  it("exposes assistant, document, and route error copy", () => {
    expect(erpAssistantPanelCopy.title).toBe("Lynx workspace");
    expect(documentWorkflowCopy.upload.submitLabel).toBe("Upload document");
    expect(routeErrorCopy.appNotFound.actionLabel).toBe("Back to dashboard");
  });
});
