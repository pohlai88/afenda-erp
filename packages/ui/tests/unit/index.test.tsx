import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  MetricGrid,
  OperationalSkillGrid,
  RecoveryPlaybookGrid,
  StatusBadge,
  WorkflowSummaryPanel,
} from "../../src/index";

describe("@afenda/ui metadata components", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders metric grid from metadata rows", () => {
    render(
      <MetricGrid
        metrics={[
          {
            label: "Open approvals",
            value: "14",
            detail: "Pending review",
            tone: "warning",
          },
        ]}
      />,
    );

    expect(screen.getByText("Open approvals")).toBeTruthy();
    expect(screen.getByText("14")).toBeTruthy();
  });

  it("renders recovery playbooks from metadata", () => {
    render(
      <RecoveryPlaybookGrid
        playbooks={[
          {
            id: "cash-flow",
            label: "Improve cash flow",
            problem: "Cash-flow pressure",
            diagnosis: "Collections delayed",
            action: "Draft follow-ups",
            risk: "high",
          },
        ]}
      />,
    );

    expect(screen.getByText("Improve cash flow")).toBeTruthy();
    expect(screen.getByText("Draft follow-ups")).toBeTruthy();
  });

  it("renders workflow summary counts", () => {
    render(
      <WorkflowSummaryPanel escalations={2} highPriority={3} queueDepth={7} />,
    );

    expect(screen.getByText("7")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("renders status badge tone labels", () => {
    render(<StatusBadge label="Healthy" tone="positive" />);

    expect(screen.getByText("Healthy")).toBeTruthy();
  });

  it("renders operational skills from metadata", () => {
    render(
      <OperationalSkillGrid
        skills={[
          {
            id: "lms-training-designer",
            moduleId: "lms",
            label: "LMS training designer",
            description: "Design and schedule training plans with approval.",
            problemTypes: ["skill_gap", "compliance_training"],
            readToolNames: ["analyzeTrainingNeeds", "reviewCertificationGaps"],
            draftToolNames: [
              "designTrainingPlan",
              "draftLearnerAssignments",
              "draftTrainingSchedule",
            ],
            approvalToolNames: ["proposeTrainingApproval"],
            approvalPolicy: "human-approval-required",
          },
        ]}
      />,
    );

    expect(screen.getByText("LMS training designer")).toBeTruthy();
    expect(screen.getByText("human approval required")).toBeTruthy();
    expect(screen.getByText(/skill_gap/)).toBeTruthy();
  });
});
