import { beforeEach, describe, expect, it, vi } from "vitest";

const emptyWindow = {
  rows: [],
  pageSize: 25,
  totalCount: 0,
  hasNextPage: false,
};

vi.mock("@afenda/db", async (importOriginal) => {
  const original = await importOriginal<typeof import("@afenda/db")>();

  const empty = async () => emptyWindow;

  return {
    ...original,
    syncHrComplianceFilings: vi.fn(async () => undefined),
    syncHrEmployeeLaborLawRequirements: vi.fn(async () => undefined),
    syncHrEmployeePolicyAcknowledgements: vi.fn(async () => undefined),
    syncHrEmployeeSafetyTrainingRequirements: vi.fn(async () => undefined),
    syncHrEmployeeWorkplaceSafetyRequirements: vi.fn(async () => undefined),
    ensureHrWorkEligibilityTracking: vi.fn(async () => undefined),
    ensureHrWorkAuthorizationDocuments: vi.fn(async () => undefined),
    syncHrComplianceExceptions: vi.fn(async () => undefined),
    listHrDepartments: vi.fn(async () => [{ id: "dept_1", name: "Legal" }]),
    listHrComplianceObligationsWindow: vi.fn(empty),
    listHrComplianceFilingsWindow: vi.fn(empty),
    listHrComplianceExceptionsWindow: vi.fn(empty),
    listHrEmployeeLaborLawRequirementsWindow: vi.fn(empty),
    listHrEmployeePolicyAcknowledgementsWindow: vi.fn(empty),
    listHrEmployeeSafetyTrainingRequirementsWindow: vi.fn(empty),
    listHrEmployeeWorkplaceSafetyRequirementsWindow: vi.fn(empty),
    listHrWorkEligibilityWindow: vi.fn(empty),
    listHrWorkAuthorizationDocumentsWindow: vi.fn(empty),
    listHrComplianceRegulatoryCalendarWindow: vi.fn(async () => ({
      ...emptyWindow,
      mergeTruncated: false,
    })),
    listHrComplianceAlertsWindow: vi.fn(async () => ({
      ...emptyWindow,
      mergeTruncated: false,
    })),
    listHrComplianceReviewQueueWindow: vi.fn(async () => ({
      ...emptyWindow,
      mergeTruncated: false,
    })),
    listHrEmployeeStatutoryRequirementsWindow: vi.fn(empty),
    loadHrComplianceOverviewSnapshot: vi.fn(async () => ({
      openExceptionCount: 0,
      criticalAlertCount: 0,
      overdueFilingCount: 0,
      pendingReviewCount: 0,
      atRiskRequirementCount: 0,
      overdueRequirementCount: 0,
      dimensionBreakdown: [],
    })),
    listHrComplianceEvidenceLinksWindow: vi.fn(empty),
    searchTenantAuditLogs: vi.fn(async () => ({ rows: [], totalCount: 0 })),
    listHrEmployeeDocumentsWindow: vi.fn(async () => ({
      rows: [
        {
          id: "doc_1",
          employeeId: "emp_1",
          title: "Work permit scan",
          documentType: "work_permit",
          employeeDisplayName: "Alex Operator",
        },
      ],
      pageSize: 25,
      totalCount: 1,
      hasNextPage: false,
    })),
    listHrEmployeeDirectoryWindow: vi.fn(async () => ({
      rows: [
        {
          id: "emp_active",
          employeeNumber: "E-100",
          displayName: "Alex Operator",
          email: "alex@example.com",
          employmentStatus: "active",
          departmentName: "Ops",
          positionTitle: "Operator",
          managerDisplayName: null,
          updatedAt: new Date("2026-05-01T12:00:00.000Z"),
        },
        {
          id: "emp_separated",
          employeeNumber: "E-999",
          displayName: "Former Staff",
          email: "former@example.com",
          employmentStatus: "terminated",
          departmentName: null,
          positionTitle: null,
          managerDisplayName: null,
          updatedAt: new Date("2026-04-01T12:00:00.000Z"),
        },
      ],
      pageSize: 25,
      totalCount: 2,
      hasNextPage: false,
    })),
  };
});

import {
  buildHrCompliancePageModel,
  runHrCompliancePageLoadSync,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance.page-model.server";
import { toHrCompliancePageModelInput } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-search-params.parse.shared";
import { HR_COMPLIANCE_LIST_SURFACE_KEYS } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-surface-metadata.shared";
import { hrWorkforceComplianceReadPermission } from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance.contract";

function assertJsonSerializable(label: string, value: unknown) {
  expect(() => JSON.stringify(value), label).not.toThrow();
}

describe("hr compliance page model (Next.js RSC serialization)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds a page model whose list configurations round-trip through JSON", async () => {
    const model = await buildHrCompliancePageModel({
      organizationId: "org-1",
      canWrite: true,
      canViewSensitive: true,
      exceptionSearch: "missing",
    });

    const listConfigurations = [
      model.alertsList,
      model.reviewQueueList,
      model.obligationsList,
      model.filingsList,
      model.regulatoryCalendarList,
      model.policyAcknowledgementsList,
      model.laborLawRequirementsList,
      model.statutoryRequirementsList,
      model.safetyTrainingRequirementsList,
      model.workplaceSafetyRequirementsList,
      model.workEligibilityList,
      model.workAuthDocumentsList,
      model.exceptionsList,
      model.evidenceLinksList,
      model.auditTrailList,
    ] as const;

    expect(listConfigurations).toHaveLength(15);
    for (const [index, configuration] of listConfigurations.entries()) {
      assertJsonSerializable(`listConfiguration[${index}]`, configuration);
      expect(configuration.dataNature).toBe("table");
      expect(configuration.requiresErpPermission).toEqual(
        hrWorkforceComplianceReadPermission,
      );
    }

    assertJsonSerializable("departments", model.departments);
    assertJsonSerializable("documentPickerOptions", model.documentPickerOptions);
    assertJsonSerializable("employeePickerOptions", model.employeePickerOptions);

    expect(model.employeePickerOptions).toEqual([
      {
        value: "emp_active",
        label: "Alex Operator (E-100)",
      },
    ]);

    expect(model.exceptionsList.presentation?.toolbar?.search?.value).toBe(
      "missing",
    );
    expect(model.documentPickerOptions).toEqual([
      {
        value: "doc_1",
        label: "Work permit scan (Alex Operator · work_permit)",
        employeeId: "emp_1",
      },
    ]);
    expect(model.canWrite).toBe(true);
    expect(model.canViewSensitive).toBe(true);
  });

  it("excludes restricted documents from picker options without sensitive read", async () => {
    const { listHrEmployeeDocumentsWindow } = await import("@afenda/db");
    vi.mocked(listHrEmployeeDocumentsWindow).mockResolvedValueOnce({
      rows: [
        {
          id: "doc_internal",
          employeeId: "emp_1",
          title: "Safety induction",
          documentType: "training",
          employeeDisplayName: "Alex Operator",
          classification: "internal",
        },
        {
          id: "doc_restricted",
          employeeId: "emp_1",
          title: "Passport scan",
          documentType: "passport",
          employeeDisplayName: "Alex Operator",
          classification: "restricted",
        },
      ],
      pageSize: 25,
      totalCount: 2,
      hasNextPage: false,
    });

    const model = await buildHrCompliancePageModel({
      organizationId: "org-1",
      canWrite: true,
      canViewSensitive: false,
    });

    expect(model.documentPickerOptions).toEqual([
      {
        value: "doc_internal",
        label: "Safety induction (Alex Operator · training)",
        employeeId: "emp_1",
      },
    ]);
  });

  it("load-error placeholders remain JSON-serializable with governed empty copy", async () => {
    const { listHrComplianceObligationsWindow } = await import("@afenda/db");
    vi.mocked(listHrComplianceObligationsWindow).mockRejectedValueOnce(
      new Error("connection refused"),
    );

    const model = await buildHrCompliancePageModel({
      organizationId: "org-1",
      canWrite: false,
      canViewSensitive: false,
    });

    expect(model.obligationsLoadError?.variant).toBe("error");
    assertJsonSerializable("obligationsListLoadErrorPlaceholder", model.obligationsList);
    expect(model.obligationsList.surface?.empty?.title).toBeTruthy();
    expect(model.obligationsList.surface?.empty?.description).toBeTruthy();
  });

  it("runs materialization sync before batched list window loads", async () => {
    const callOrder: string[] = [];

    const { syncHrComplianceExceptions, listHrComplianceObligationsWindow } =
      await import("@afenda/db");

    vi.mocked(syncHrComplianceExceptions).mockImplementation(async () => {
      callOrder.push("exceptions");
    });
    vi.mocked(listHrComplianceObligationsWindow).mockImplementation(async () => {
      callOrder.push("obligations-window");
      return emptyWindow;
    });

    await buildHrCompliancePageModel({
      organizationId: "org-1",
      canWrite: false,
      canViewSensitive: false,
    });

    expect(callOrder.indexOf("exceptions")).toBeLessThan(
      callOrder.indexOf("obligations-window"),
    );
  });

  it("exposes fifteen governed list surface keys for Pattern C sections", () => {
    expect(HR_COMPLIANCE_LIST_SURFACE_KEYS).toHaveLength(15);
  });

  it("maps App Router searchParams to page-model input via metadata registry", () => {
    expect(
      toHrCompliancePageModelInput({
        organizationId: "org-1",
        canWrite: false,
        canViewSensitive: false,
        searchParams: { complianceFilingSearch: "epf" },
      }),
    ).toEqual({
      organizationId: "org-1",
      canWrite: false,
      canViewSensitive: false,
      alertsSearch: undefined,
      reviewQueueSearch: undefined,
      obligationSearch: undefined,
      exceptionSearch: undefined,
      laborLawSearch: undefined,
      statutorySearch: undefined,
      policyAcknowledgementSearch: undefined,
      safetyTrainingSearch: undefined,
      workplaceSafetySearch: undefined,
      workEligibilitySearch: undefined,
      workAuthDocumentSearch: undefined,
      filingSearch: "epf",
      regulatoryCalendarSearch: undefined,
      evidenceLinksSearch: undefined,
      auditTrailSearch: undefined,
    });
  });

  it("forwards evidence link search into the governed list toolbar and window query", async () => {
    const { listHrComplianceEvidenceLinksWindow } = await import("@afenda/db");

    const model = await buildHrCompliancePageModel({
      organizationId: "org-1",
      canWrite: false,
      canViewSensitive: false,
      evidenceLinksSearch: "submitted",
    });

    expect(
      model.evidenceLinksList.presentation?.toolbar?.search?.value,
    ).toBe("submitted");
    expect(vi.mocked(listHrComplianceEvidenceLinksWindow)).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        search: "submitted",
      }),
    );
  });

  it("page load sync remains ordered: sources then exceptions", async () => {
    const callOrder: string[] = [];
    const { syncHrComplianceExceptions, syncHrComplianceFilings } =
      await import("@afenda/db");

    vi.mocked(syncHrComplianceFilings).mockImplementation(async () => {
      callOrder.push("filings");
    });
    vi.mocked(syncHrComplianceExceptions).mockImplementation(async () => {
      callOrder.push("exceptions");
    });

    await runHrCompliancePageLoadSync({ organizationId: "org-1" });

    expect(callOrder).toEqual(["filings", "exceptions"]);
  });
});
