import { describe, expect, it } from "vitest";
import {
  appShellSkeletonNavItemIds,
  dashboardRouteSections,
  documentWorkflowCopy,
  erpAssistantPanelCopy,
  getAppShellSkeletonNavItemIds,
  moduleScreenSections,
  routeErrorCopy,
} from "../../src/shell/route-copy-metadata";

describe("route copy metadata", () => {
  it("exposes app shell skeleton nav ids", () => {
    expect(getAppShellSkeletonNavItemIds()).toEqual(appShellSkeletonNavItemIds);
    expect(appShellSkeletonNavItemIds).toContain("lynx");
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
