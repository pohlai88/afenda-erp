import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  buildLynxConsolePageModel: vi.fn(),
  buildLynxRunDetailPageModel: vi.fn(),
  buildLynxRunManagementPageModel: vi.fn(),
  buildLynxWorkflowSessionDetailPageModel: vi.fn(),
  buildLynxWorkflowSessionListPageModel: vi.fn(),
  assertLynxReadAccess: vi.fn(),
  notFound: vi.fn(),
  requireExecutionContext: vi.fn(),
  resolveExecutionContext: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/link", () => ({
  default: ({ children }: { children: unknown }) => children,
}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));
vi.mock("@afenda/governed-surface/metadata", () => ({
  GovernedComponentRenderer: () => null,
}));
vi.mock("@afenda/kernel/server", () => ({
  requireExecutionContext: mocks.requireExecutionContext,
  resolveExecutionContext: mocks.resolveExecutionContext,
}));
vi.mock("@afenda/feature-lynx/server", () => ({
  LYNX_WORKSPACE_ROUTES: {
    console: "/lynx",
    workflows: "/lynx/workflows",
    workflowDetail: (sessionId: string) => `/lynx/workflows/${sessionId}`,
    runs: "/lynx/runs",
    runDetail: (runId: string) => `/lynx/runs/${runId}`,
  },
  buildLynxConsolePageModel: mocks.buildLynxConsolePageModel,
  buildLynxRunDetailPageModel: mocks.buildLynxRunDetailPageModel,
  buildLynxRunManagementPageModel: mocks.buildLynxRunManagementPageModel,
  buildLynxWorkflowSessionDetailPageModel:
    mocks.buildLynxWorkflowSessionDetailPageModel,
  buildLynxWorkflowSessionListPageModel:
    mocks.buildLynxWorkflowSessionListPageModel,
  assertLynxReadAccess: mocks.assertLynxReadAccess,
}));

import LynxPage from "@/app/(workspace)/(the-machine)/lynx/page";
import LynxRunsPage from "@/app/(workspace)/(the-machine)/lynx/runs/page";
import LynxRunDetailPage from "@/app/(workspace)/(the-machine)/lynx/runs/[runId]/page";
import LynxWorkflowsPage from "@/app/(workspace)/(the-machine)/lynx/workflows/page";
import LynxWorkflowSessionDetailPage from "@/app/(workspace)/(the-machine)/lynx/workflows/[sessionId]/page";

const executionContext = {
  organizationId: "org_1",
  organizationSlug: "afenda",
  userId: "user_1",
  membershipId: "membership_1",
  locale: "en-MY",
  actorType: "user",
  capabilities: ["system-admin.lynx.read"],
  role: "owner",
  sessionSource: "neon",
};

const listSurface = { items: [] };
const statSurface = { items: [] };

describe("Lynx workspace pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    mocks.requireExecutionContext.mockResolvedValue(executionContext);
    mocks.resolveExecutionContext.mockResolvedValue(executionContext);
    mocks.buildLynxConsolePageModel.mockResolvedValue({
      heroCopy: { title: "Lynx", description: "Tenant console" },
      statGrid: statSurface,
      activityLedgerList: listSurface,
      aiUsageList: listSurface,
      evidenceList: listSurface,
      playbookList: listSurface,
      skillsList: listSurface,
      readiness: { moduleList: listSurface },
    });
    mocks.buildLynxRunManagementPageModel.mockResolvedValue({
      overview: statSurface,
      quality: statSurface,
      runs: listSurface,
    });
    mocks.buildLynxRunDetailPageModel.mockResolvedValue({
      run: { id: "run_1", promptSummary: "Prompt" },
      overview: statSurface,
      events: listSurface,
      feedback: listSurface,
      claims: listSurface,
    });
    mocks.buildLynxWorkflowSessionListPageModel.mockResolvedValue({
      sessions: listSurface,
    });
    mocks.buildLynxWorkflowSessionDetailPageModel.mockResolvedValue({
      session: { id: "session_1", promptSummary: "Workflow" },
      overview: statSurface,
      linkedRuns: listSurface,
    });
  });

  it("/lynx requires execution context and uses tenant scope", async () => {
    await LynxPage();

    expect(mocks.requireExecutionContext).toHaveBeenCalledTimes(1);
    expect(mocks.buildLynxConsolePageModel).toHaveBeenCalledWith({
      organizationId: "org_1",
      capabilities: ["system-admin.lynx.read"],
      sessionSource: "neon",
    });
  });

  it("/lynx does not build data without execution context", async () => {
    mocks.requireExecutionContext.mockRejectedValueOnce(new Error("auth required"));

    await expect(LynxPage()).rejects.toThrow("auth required");
    expect(mocks.buildLynxConsolePageModel).not.toHaveBeenCalled();
  });

  it("/lynx/runs forwards server search params to Lynx reads", async () => {
    const searchParams = { status: "completed", actorType: "operator" };

    await LynxRunsPage({ searchParams: Promise.resolve(searchParams) });

    expect(mocks.buildLynxRunManagementPageModel).toHaveBeenCalledWith({
      organizationId: "org_1",
      searchParams,
    });
  });

  it("/lynx/workflows forwards server search params to Lynx reads", async () => {
    const searchParams = { status: "active", q: "recovery" };

    await LynxWorkflowsPage({ searchParams: Promise.resolve(searchParams) });

    expect(mocks.buildLynxWorkflowSessionListPageModel).toHaveBeenCalledWith({
      organizationId: "org_1",
      searchParams,
    });
  });

  it("/lynx/runs/[runId] returns notFound when the tenant read misses", async () => {
    mocks.buildLynxRunDetailPageModel.mockResolvedValueOnce(null);

    await expect(
      LynxRunDetailPage({ params: Promise.resolve({ runId: "missing_run" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.buildLynxRunDetailPageModel).toHaveBeenCalledWith({
      organizationId: "org_1",
      runId: "missing_run",
    });
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });

  it("/lynx/workflows/[sessionId] returns notFound when the tenant read misses", async () => {
    mocks.buildLynxWorkflowSessionDetailPageModel.mockResolvedValueOnce(null);

    await expect(
      LynxWorkflowSessionDetailPage({
        params: Promise.resolve({ sessionId: "missing_session" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.buildLynxWorkflowSessionDetailPageModel).toHaveBeenCalledWith({
      organizationId: "org_1",
      sessionId: "missing_session",
    });
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });
});
