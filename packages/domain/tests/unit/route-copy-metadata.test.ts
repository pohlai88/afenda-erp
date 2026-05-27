import { describe, expect, it } from "vitest";
import {
  appBrandName,
  appShellSkeletonNavItemIds,
  dashboardRouteSections,
  documentWorkflowCopy,
  erpAssistantPanelCopy,
  getAppShellSkeletonNavItemIds,
  getSolutionConsoleUxCards,
  moduleScreenSections,
  routeErrorCopy,
  solutionConsolePageMetadata,
  solutionConsoleSections,
  solutionConsoleUxCards,
} from "../../src/route-copy-metadata";

describe("route copy metadata", () => {
  it("exposes app shell skeleton nav ids", () => {
    expect(getAppShellSkeletonNavItemIds()).toEqual(appShellSkeletonNavItemIds);
    expect(appShellSkeletonNavItemIds).toContain("solution-console");
  });

  it("defines solution console UX cards", () => {
    expect(getSolutionConsoleUxCards()).toHaveLength(3);
    expect(solutionConsoleUxCards.map((card) => card.id)).toEqual([
      "root-causes",
      "recovery-actions",
      "approval-boundary",
    ]);
  });

  it("defines section copy for console, module, and dashboard routes", () => {
    expect(solutionConsoleSections.playbookCatalog.title).toBe(
      "Recovery playbook catalog",
    );
    expect(moduleScreenSections.tenantRecords.title).toBe("Tenant records");
    expect(dashboardRouteSections.aiAssistant.title).toBe("AI assistant");
  });

  it("exposes assistant, document, and route error copy", () => {
    expect(erpAssistantPanelCopy.title).toBe("ERP assistant");
    expect(documentWorkflowCopy.upload.submitLabel).toBe("Upload document");
    expect(routeErrorCopy.appNotFound.actionLabel).toBe("Back to dashboard");
    expect(solutionConsolePageMetadata.title).toBe("Solution Console");
  });
});
