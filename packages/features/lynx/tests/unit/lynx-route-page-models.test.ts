import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getLynxRunAnalytics: vi.fn(),
  listLynxRunLedger: vi.fn(),
}));

vi.mock("../../src/data/lynx.run-ledger.repository.server", () => ({
  getLynxRunAnalytics: mocks.getLynxRunAnalytics,
  listLynxRunLedger: mocks.listLynxRunLedger,
}));

vi.mock("../../src/data/lynx.workflow-session.repository.server", () => ({
  getLynxWorkflowSession: vi.fn(),
  listLynxWorkflowSessions: vi.fn(),
}));

import { buildLynxRunManagementPageModel } from "../../src/lyn-route-page-models.server";

describe("Lynx route page models", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listLynxRunLedger.mockResolvedValue([]);
    mocks.getLynxRunAnalytics.mockResolvedValue({
      totalRuns: 0,
      completedRuns: 0,
      failedRuns: 0,
      startedRuns: 0,
      averageLatencyMs: 0,
      toolCallCount: 0,
      evidenceReferenceCount: 0,
      feedbackCount: 0,
      negativeFeedbackCount: 0,
      failedQualityGateCount: 0,
      unsupportedClaimCount: 0,
      lowCitationPrecisionCount: 0,
    });
  });

  it("drops invalid URL enum filters before repository reads", async () => {
    await buildLynxRunManagementPageModel({
      organizationId: "org_1",
      searchParams: {
        qualityGate: "invalid",
        status: "deleted",
        q: "operator",
      },
    });

    expect(mocks.listLynxRunLedger).toHaveBeenCalledWith({
      organizationId: "org_1",
      filters: expect.objectContaining({
        qualityGate: undefined,
        search: "operator",
        status: undefined,
      }),
      limit: 101,
    });
  });
});
