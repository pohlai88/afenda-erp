import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("server-only", () => ({}));
vi.mock("../../src/data/governed-permission-gate.server", () => ({
  resolveGovernedErpPermissionAllowed: async () => true,
}));
vi.mock("../../src/metadata/index", () => ({
  GovernedComponentRenderer: ({
    component,
    surfaceKey,
    sectionKey,
    componentKey,
  }: {
    component: { type: string };
    surfaceKey?: string;
    sectionKey?: string;
    componentKey?: string;
  }) => (
    <div
      data-testid="renderer-stub"
      data-renderer-type={component.type}
      data-surface-key={surfaceKey}
      data-section-key={sectionKey}
      data-component-key={componentKey}
    />
  ),
}));

import { GovernedPatternBActionBarSection } from "../../src/components/governed-pattern-b-action-bar-section";
import { GovernedPatternBApprovalTimelineSection } from "../../src/components/governed-pattern-b-approval-timeline-section";
import { GovernedPatternBMultiStepFormSection } from "../../src/components/governed-pattern-b-multi-step-form-section";
import { GovernedPatternBScorecardFormSection } from "../../src/components/governed-pattern-b-scorecard-form-section";

describe("Pattern B metadata sections", () => {
  it("wraps approval timeline metadata with governed identity", async () => {
    const element = await GovernedPatternBApprovalTimelineSection({
      title: "Approval flow",
      surfaceKey: "procurement",
      sectionKey: "purchase-approval",
      componentKey: "approval-flow",
      layout: "embedded",
      timelineConfiguration: {
        dataNature: "approval-flow",
        steps: [{ id: "request", label: "Requested", status: "complete" }],
      },
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-renderer-type="governed:approval-timeline"');
    expect(html).toContain('data-surface-key="procurement"');
    expect(html).toContain('data-section-key="purchase-approval"');
    expect(html).toContain('data-component-key="approval-flow"');
  });

  it("models an empty approval timeline as a shell empty state", async () => {
    const element = await GovernedPatternBApprovalTimelineSection({
      title: "Approval flow",
      surfaceKey: "procurement",
      componentKey: "approval-flow",
      layout: "embedded",
      timelineConfiguration: {
        dataNature: "approval-flow",
        steps: [],
      },
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-render-state="empty"');
    expect(html).toContain("approval-flow-empty");
    expect(html).not.toContain('data-testid="renderer-stub"');
  });

  it("wraps action bar metadata and resolves renderer identity", async () => {
    const element = await GovernedPatternBActionBarSection({
      title: "Bulk actions",
      surfaceKey: "contacts",
      sectionKey: "contact-actions",
      componentKey: "contact-bulk-actions",
      layout: "embedded",
      actionBarConfiguration: {
        actions: [{ id: "archive", label: "Archive", intent: "default" }],
      },
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-renderer-type="governed:action-bar"');
    expect(html).toContain('data-section-key="contact-actions"');
    expect(html).toContain('data-component-key="contact-bulk-actions"');
  });

  it("wraps multi-step form metadata with governed identity", async () => {
    const element = await GovernedPatternBMultiStepFormSection({
      title: "Onboarding",
      surfaceKey: "hr",
      sectionKey: "new-hire-onboarding",
      componentKey: "onboarding-form",
      layout: "embedded",
      formConfiguration: {
        formId: "onboarding",
        actionId: "submit-onboarding",
        steps: [
          {
            id: "details",
            title: "Details",
            fields: [
              {
                id: "name",
                label: "Name",
                kind: "text",
                required: true,
              },
            ],
          },
        ],
      },
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-renderer-type="governed:multi-step-form"');
    expect(html).toContain('data-component-key="onboarding-form"');
  });

  it("wraps scorecard form metadata with governed identity", async () => {
    const element = await GovernedPatternBScorecardFormSection({
      title: "Supplier scorecard",
      surfaceKey: "procurement",
      sectionKey: "supplier-review",
      componentKey: "supplier-scorecard",
      layout: "embedded",
      formConfiguration: {
        formId: "supplier-scorecard",
        actionId: "submit-supplier-score",
        title: "Supplier scorecard",
        criteria: [{ id: "quality", label: "Quality", maxScore: 5 }],
      },
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-renderer-type="governed:scorecard-form"');
    expect(html).toContain('data-section-key="supplier-review"');
    expect(html).toContain('data-component-key="supplier-scorecard"');
  });
});
