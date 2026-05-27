import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  ModuleLinkGrid,
  ObservabilityIndicatorList,
  SectionPanel,
  StatusBadge,
} from "../../src/index";

describe("@afenda/ui shell primitives", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders section panel headings", () => {
    render(
      <SectionPanel title="Workspace overview" description="Tenant context">
        <div>Body</div>
      </SectionPanel>,
    );

    expect(screen.getByText("Workspace overview")).toBeTruthy();
    expect(screen.getByText("Body")).toBeTruthy();
  });

  it("renders observability indicators", () => {
    render(
      <ObservabilityIndicatorList
        indicators={[
          {
            label: "Queue latency",
            value: "Healthy",
            detail: "Within service budget.",
            tone: "positive",
          },
        ]}
      />,
    );

    expect(screen.getByText("Queue latency")).toBeTruthy();
    expect(screen.getByText("Healthy")).toBeTruthy();
  });

  it("renders status badge tone labels", () => {
    render(<StatusBadge label="Healthy" tone="positive" />);

    expect(screen.getByText("Healthy")).toBeTruthy();
  });

  it("renders module link grid entries", () => {
    render(
      <ModuleLinkGrid
        modules={[
          {
            id: "finance",
            href: "/finance",
            label: "Finance",
            summary: "Ledger and close controls.",
            statusLabel: "Operational",
            statusTone: "positive",
          },
        ]}
      />,
    );

    expect(screen.getByText("Finance")).toBeTruthy();
    expect(screen.getByText("Ledger and close controls.")).toBeTruthy();
  });
});
