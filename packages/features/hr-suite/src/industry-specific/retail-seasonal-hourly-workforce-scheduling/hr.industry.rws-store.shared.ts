import type {
  HrRwsAttendanceOutcomeReference,
  HrRwsCoverageGapReference,
  HrRwsIntegrationExposureReference,
  HrRwsOpenShiftEligibilityReference,
  HrRwsPayrollScheduleReferenceExport,
} from "./hr.industry.rws.contract";
import {
  hrIndustryRwsAuditActions,
  type HrIndustryRwsAuditAction,
} from "./hr.industry.rws.event";
import type { HrRwsReportGroupBy } from "./hr.industry.rws-constants.shared";
import type {
  HrRwsAttendanceComparisonInput,
  HrRwsAvailabilityPreferenceInput,
  HrRwsBlockedDateInput,
  HrRwsComplianceFindingInput,
  HrRwsCoverageRequirementInput,
  HrRwsIntegrationExposureInput,
  HrRwsLaborBudgetSnapshotInput,
  HrRwsLaborDemandReferenceInput,
  HrRwsNotificationInput,
  HrRwsOpenShiftInput,
  HrRwsPayrollReferenceInput,
  HrRwsRetailScheduleInput,
  HrRwsShiftAssignmentInput,
  HrRwsShiftSwapRequestInput,
} from "./hr.industry.rws.schema";

export const HR_INDUSTRY_RWS_REFERENCE_DATE = "2026-05-31";

export type HrIndustryRwsAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrIndustryRwsAuditAction;
  readonly actorId: string;
  readonly targetType:
    | "schedule"
    | "assignment"
    | "availability"
    | "blocked_date"
    | "coverage"
    | "open_shift"
    | "shift_swap"
    | "labor_demand"
    | "labor_budget"
    | "overtime_risk"
    | "compliance"
    | "notification"
    | "attendance"
    | "payroll_reference"
    | "integration"
    | "report";
  readonly targetId: string;
  readonly employeeId?: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrIndustryRwsReportRow = {
  readonly id: string;
  readonly groupLabel: string;
  readonly scheduleCount: number;
  readonly assignmentCount: number;
  readonly scheduledHours: number;
  readonly scheduledLaborCost: number;
  readonly budgetVariance: number;
  readonly coverageGapCount: number;
  readonly overtimeRiskCount: number;
  readonly complianceFindingCount: number;
};

export type HrIndustryRwsStore = {
  retailSchedules: HrRwsRetailScheduleInput[];
  shiftAssignments: HrRwsShiftAssignmentInput[];
  availabilityPreferences: HrRwsAvailabilityPreferenceInput[];
  blockedDates: HrRwsBlockedDateInput[];
  coverageRequirements: HrRwsCoverageRequirementInput[];
  openShifts: HrRwsOpenShiftInput[];
  shiftSwapRequests: HrRwsShiftSwapRequestInput[];
  laborDemandReferences: HrRwsLaborDemandReferenceInput[];
  laborBudgetSnapshots: HrRwsLaborBudgetSnapshotInput[];
  complianceFindings: HrRwsComplianceFindingInput[];
  notifications: HrRwsNotificationInput[];
  attendanceComparisons: HrRwsAttendanceComparisonInput[];
  payrollReferences: HrRwsPayrollReferenceInput[];
  integrationExposures: HrRwsIntegrationExposureInput[];
  auditEvents: HrIndustryRwsAuditEvent[];
};

type EmployeeScoped = { readonly employeeId?: string };

const stores = new Map<string, HrIndustryRwsStore>();

function withOrg<T extends { organizationId: string }>(
  organizationId: string,
  rows: readonly Omit<T, "organizationId">[],
): T[] {
  return rows.map((row) => ({ ...row, organizationId }) as T);
}

function hasEmployeeAccess(
  row: EmployeeScoped,
  visibleEmployeeIds: readonly string[] | null,
) {
  return (
    !row.employeeId ||
    visibleEmployeeIds === null ||
    visibleEmployeeIds.includes(row.employeeId)
  );
}

function scopedRows<T extends EmployeeScoped>(
  rows: readonly T[],
  visibleEmployeeIds: readonly string[] | null,
) {
  return rows.filter((row) => hasEmployeeAccess(row, visibleEmployeeIds));
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function createSeedStore(organizationId: string): HrIndustryRwsStore {
  const retailSchedules = withOrg<HrRwsRetailScheduleInput>(organizationId, [
    {
      id: "rws-sch-peak-nyc",
      scheduleCode: "NYC-PEAK-W23",
      title: "NYC flagship holiday peak roster",
      legalEntity: "US01",
      storeId: "store-nyc-flagship",
      storeName: "NYC Flagship",
      branchName: "Manhattan",
      departmentName: "Front of Store",
      teamName: "Holiday A",
      roleName: "cashier",
      managerEmployeeId: "emp-900",
      managerDisplayName: "Morgan Lee",
      periodType: "weekly",
      campaignRef: "retail-campaign-holiday-2026",
      seasonName: "Holiday peak",
      startDate: "2026-11-23",
      endDate: "2026-11-29",
      status: "draft",
      scheduledHours: 184,
      scheduledLaborCost: 3875.5,
      budgetAmount: 3600,
      budgetStatus: "over_budget",
      overtimeRiskCount: 2,
      coverageGapCount: 3,
      complianceFindingCount: 2,
    },
    {
      id: "rws-sch-chicago-backtoschool",
      scheduleCode: "CHI-BTS-W34",
      title: "Chicago back-to-school coverage",
      legalEntity: "US01",
      storeId: "store-chicago-west",
      storeName: "Chicago West",
      departmentName: "Sales Floor",
      teamName: "Back to School",
      roleName: "sales_associate",
      managerEmployeeId: "emp-901",
      managerDisplayName: "Priya Shah",
      periodType: "campaign",
      campaignRef: "retail-campaign-bts-2026",
      seasonName: "Back to school",
      startDate: "2026-08-17",
      endDate: "2026-08-30",
      status: "published",
      publishedAt: "2026-08-10",
      scheduledHours: 232,
      scheduledLaborCost: 4512,
      budgetAmount: 4700,
      budgetStatus: "within_budget",
      overtimeRiskCount: 0,
      coverageGapCount: 1,
      complianceFindingCount: 1,
    },
    {
      id: "rws-sch-kl-yearend",
      scheduleCode: "KUL-YE-W52",
      title: "Kuala Lumpur year-end late-night roster",
      legalEntity: "MY01",
      storeId: "store-klcc",
      storeName: "KLCC Retail",
      branchName: "Kuala Lumpur",
      departmentName: "Operations",
      teamName: "Year End",
      roleName: "key_holder",
      managerEmployeeId: "emp-902",
      managerDisplayName: "Farah Ismail",
      periodType: "seasonal",
      seasonName: "Year-end sale",
      startDate: "2026-12-21",
      endDate: "2027-01-03",
      status: "changed",
      publishedAt: "2026-12-15",
      scheduledHours: 196,
      scheduledLaborCost: 2980,
      budgetAmount: 3100,
      budgetStatus: "pending_review",
      overtimeRiskCount: 1,
      coverageGapCount: 0,
      complianceFindingCount: 2,
    },
  ]);

  const shiftAssignments = withOrg<HrRwsShiftAssignmentInput>(organizationId, [
    {
      id: "rws-asg-300-black-friday",
      scheduleId: "rws-sch-peak-nyc",
      employeeId: "emp-300",
      employeeDisplayName: "Alicia Moreno",
      workerType: "seasonal",
      storeId: "store-nyc-flagship",
      storeName: "NYC Flagship",
      departmentName: "Front of Store",
      roleName: "cashier",
      managerEmployeeId: "emp-900",
      managerDisplayName: "Morgan Lee",
      shiftType: "peak",
      shiftDate: "2026-11-27",
      startTime: "08:00",
      endTime: "16:00",
      scheduledHours: 8,
      actualHours: 8.5,
      availabilityStatus: "preferred",
      skillValidated: true,
      certificationRefs: ["pos-certified"],
      complianceStatus: "clear",
      payrollReferenceStatus: "ready",
    },
    {
      id: "rws-asg-301-closing",
      scheduleId: "rws-sch-peak-nyc",
      employeeId: "emp-301",
      employeeDisplayName: "Jamal Reed",
      workerType: "part_time",
      storeId: "store-nyc-flagship",
      storeName: "NYC Flagship",
      departmentName: "Front of Store",
      roleName: "key_holder",
      managerEmployeeId: "emp-900",
      managerDisplayName: "Morgan Lee",
      shiftType: "closing",
      shiftDate: "2026-11-28",
      startTime: "14:00",
      endTime: "23:00",
      scheduledHours: 9,
      actualHours: 9,
      availabilityStatus: "available",
      skillValidated: true,
      certificationRefs: ["key-holder-approved"],
      complianceStatus: "warning",
      payrollReferenceStatus: "ready",
    },
    {
      id: "rws-asg-302-minor",
      scheduleId: "rws-sch-chicago-backtoschool",
      employeeId: "emp-302",
      employeeDisplayName: "Mei Lin Tan",
      workerType: "minor",
      storeId: "store-chicago-west",
      storeName: "Chicago West",
      departmentName: "Sales Floor",
      roleName: "sales_associate",
      managerEmployeeId: "emp-901",
      managerDisplayName: "Priya Shah",
      shiftType: "weekend",
      shiftDate: "2026-08-22",
      startTime: "10:00",
      endTime: "18:30",
      scheduledHours: 8.5,
      actualHours: 7.75,
      availabilityStatus: "available",
      skillValidated: true,
      certificationRefs: [],
      complianceStatus: "blocked",
      payrollReferenceStatus: "blocked",
    },
    {
      id: "rws-asg-303-stockroom",
      scheduleId: "rws-sch-chicago-backtoschool",
      employeeId: "emp-303",
      employeeDisplayName: "Noah Kim",
      workerType: "temporary",
      storeId: "store-chicago-west",
      storeName: "Chicago West",
      departmentName: "Stockroom",
      roleName: "stockroom",
      managerEmployeeId: "emp-901",
      managerDisplayName: "Priya Shah",
      shiftType: "opening",
      shiftDate: "2026-08-21",
      startTime: "06:00",
      endTime: "14:00",
      scheduledHours: 8,
      actualHours: 8,
      availabilityStatus: "available",
      skillValidated: false,
      certificationRefs: [],
      complianceStatus: "warning",
      payrollReferenceStatus: "ready",
    },
    {
      id: "rws-asg-304-late-night",
      scheduleId: "rws-sch-kl-yearend",
      employeeId: "emp-304",
      employeeDisplayName: "Siti Rahman",
      workerType: "hourly",
      storeId: "store-klcc",
      storeName: "KLCC Retail",
      departmentName: "Operations",
      roleName: "supervisor",
      managerEmployeeId: "emp-902",
      managerDisplayName: "Farah Ismail",
      shiftType: "late_night",
      shiftDate: "2026-12-26",
      startTime: "16:00",
      endTime: "00:30",
      scheduledHours: 8.5,
      actualHours: 8,
      availabilityStatus: "unavailable",
      skillValidated: true,
      certificationRefs: ["supervisor-approved"],
      complianceStatus: "warning",
      payrollReferenceStatus: "exposed",
    },
  ]);

  const availabilityPreferences =
    withOrg<HrRwsAvailabilityPreferenceInput>(organizationId, [
      {
        id: "rws-avail-300-fri",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        dayOfWeek: "Friday",
        timeWindow: "08:00-18:00",
        shiftType: "peak",
        maxWeeklyHours: 32,
        status: "preferred",
      },
      {
        id: "rws-avail-301-weekend",
        employeeId: "emp-301",
        employeeDisplayName: "Jamal Reed",
        dayOfWeek: "Saturday",
        timeWindow: "12:00-22:00",
        shiftType: "closing",
        maxWeeklyHours: 24,
        status: "available",
      },
      {
        id: "rws-avail-302-school",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        dayOfWeek: "Weekday",
        timeWindow: "16:00-20:00",
        shiftType: "midday",
        maxWeeklyHours: 18,
        status: "available",
      },
      {
        id: "rws-avail-304-late",
        employeeId: "emp-304",
        employeeDisplayName: "Siti Rahman",
        dayOfWeek: "Saturday",
        timeWindow: "10:00-18:00",
        shiftType: "weekend",
        maxWeeklyHours: 40,
        status: "unavailable",
      },
    ]);

  const blockedDates = withOrg<HrRwsBlockedDateInput>(organizationId, [
    {
      id: "rws-block-302-school-exam",
      employeeId: "emp-302",
      employeeDisplayName: "Mei Lin Tan",
      blockedDate: "2026-08-22",
      reason: "School exam restriction",
      sourceRef: "student-rule-IL-2026",
      status: "active",
    },
    {
      id: "rws-block-304-family",
      employeeId: "emp-304",
      employeeDisplayName: "Siti Rahman",
      blockedDate: "2026-12-26",
      reason: "Unavailable preference",
      sourceRef: "availability-self-service",
      status: "active",
    },
  ]);

  const coverageRequirements =
    withOrg<HrRwsCoverageRequirementInput>(organizationId, [
      {
        id: "rws-cov-nyc-cashier-black-friday",
        scheduleId: "rws-sch-peak-nyc",
        storeName: "NYC Flagship",
        departmentName: "Front of Store",
        roleName: "cashier",
        coverageDate: "2026-11-27",
        hourWindow: "08:00-12:00",
        requiredCount: 6,
        scheduledCount: 4,
        status: "understaffed",
      },
      {
        id: "rws-cov-nyc-keyholder",
        scheduleId: "rws-sch-peak-nyc",
        storeName: "NYC Flagship",
        departmentName: "Front of Store",
        roleName: "key_holder",
        coverageDate: "2026-11-28",
        hourWindow: "18:00-23:00",
        requiredCount: 1,
        scheduledCount: 2,
        status: "overstaffed",
      },
      {
        id: "rws-cov-chi-sales",
        scheduleId: "rws-sch-chicago-backtoschool",
        storeName: "Chicago West",
        departmentName: "Sales Floor",
        roleName: "sales_associate",
        coverageDate: "2026-08-22",
        hourWindow: "10:00-18:00",
        requiredCount: 5,
        scheduledCount: 4,
        status: "understaffed",
      },
      {
        id: "rws-cov-kl-supervisor",
        scheduleId: "rws-sch-kl-yearend",
        storeName: "KLCC Retail",
        departmentName: "Operations",
        roleName: "supervisor",
        coverageDate: "2026-12-26",
        hourWindow: "16:00-00:30",
        requiredCount: 1,
        scheduledCount: 1,
        status: "balanced",
      },
    ]);

  const openShifts = withOrg<HrRwsOpenShiftInput>(organizationId, [
    {
      id: "rws-open-nyc-cashier-1127",
      scheduleId: "rws-sch-peak-nyc",
      storeName: "NYC Flagship",
      departmentName: "Front of Store",
      roleName: "cashier",
      shiftType: "peak",
      shiftDate: "2026-11-27",
      startTime: "12:00",
      endTime: "20:00",
      approvalRequired: true,
      claimantEmployeeId: "emp-300",
      claimantDisplayName: "Alicia Moreno",
      eligibleEmployeeIds: ["emp-300", "emp-301"],
      status: "pending_approval",
    },
    {
      id: "rws-open-chi-stockroom-0821",
      scheduleId: "rws-sch-chicago-backtoschool",
      storeName: "Chicago West",
      departmentName: "Stockroom",
      roleName: "stockroom",
      shiftType: "opening",
      shiftDate: "2026-08-21",
      startTime: "06:00",
      endTime: "14:00",
      approvalRequired: false,
      eligibleEmployeeIds: ["emp-303"],
      status: "posted",
    },
    {
      id: "rws-open-kl-keyholder-1228",
      scheduleId: "rws-sch-kl-yearend",
      storeName: "KLCC Retail",
      departmentName: "Operations",
      roleName: "key_holder",
      shiftType: "late_night",
      shiftDate: "2026-12-28",
      startTime: "16:00",
      endTime: "00:30",
      approvalRequired: true,
      eligibleEmployeeIds: ["emp-304"],
      status: "posted",
    },
  ]);

  const shiftSwapRequests =
    withOrg<HrRwsShiftSwapRequestInput>(organizationId, [
      {
        id: "rws-swap-301-300",
        scheduleId: "rws-sch-peak-nyc",
        requesterEmployeeId: "emp-301",
        requesterDisplayName: "Jamal Reed",
        replacementEmployeeId: "emp-300",
        replacementDisplayName: "Alicia Moreno",
        originalShiftRef: "rws-asg-301-closing",
        replacementShiftRef: "rws-asg-300-black-friday",
        validationFlags: ["rest_rule_clear", "role_match"],
        approvalWorkflowRef: "approval-rws-swap-301-300",
        status: "pending_approval",
      },
      {
        id: "rws-swap-302-303",
        scheduleId: "rws-sch-chicago-backtoschool",
        requesterEmployeeId: "emp-302",
        requesterDisplayName: "Mei Lin Tan",
        replacementEmployeeId: "emp-303",
        replacementDisplayName: "Noah Kim",
        originalShiftRef: "rws-asg-302-minor",
        replacementShiftRef: "rws-asg-303-stockroom",
        validationFlags: ["role_mismatch", "student_rule_block"],
        decisionReason: "Replacement lacks sales floor role and minor worker rule still blocks original shift.",
        decidedBy: "emp-901",
        status: "rejected",
      },
      {
        id: "rws-swap-304-301",
        scheduleId: "rws-sch-kl-yearend",
        requesterEmployeeId: "emp-304",
        requesterDisplayName: "Siti Rahman",
        replacementEmployeeId: "emp-301",
        replacementDisplayName: "Jamal Reed",
        originalShiftRef: "rws-asg-304-late-night",
        replacementShiftRef: "rws-asg-301-closing",
        validationFlags: ["availability_conflict", "late_night_rule"],
        decisionReason: "Area manager override due key holder coverage gap.",
        decidedBy: "emp-902",
        status: "overridden",
      },
    ]);

  const laborDemandReferences =
    withOrg<HrRwsLaborDemandReferenceInput>(organizationId, [
      {
        id: "rws-demand-nyc-footfall",
        storeName: "NYC Flagship",
        periodLabel: "Black Friday 08:00-20:00",
        demandSource: "footfall",
        demandValue: 4200,
        requiredHours: 144,
        referenceRef: "retail-forecast-nyc-bf-2026",
      },
      {
        id: "rws-demand-chi-promo",
        storeName: "Chicago West",
        periodLabel: "Back to school promotion",
        demandSource: "promotion_period",
        demandValue: 1,
        requiredHours: 220,
        referenceRef: "promotion-bts-2026",
      },
      {
        id: "rws-demand-kl-holiday",
        storeName: "KLCC Retail",
        periodLabel: "Year-end sale late-night window",
        demandSource: "holiday_period",
        demandValue: 12,
        requiredHours: 190,
        referenceRef: "holiday-calendar-my-yearend-2026",
      },
    ]);

  const laborBudgetSnapshots =
    withOrg<HrRwsLaborBudgetSnapshotInput>(organizationId, [
      {
        id: "rws-budget-nyc-front",
        scheduleId: "rws-sch-peak-nyc",
        storeName: "NYC Flagship",
        departmentName: "Front of Store",
        scheduledHours: 184,
        scheduledLaborCost: 3875.5,
        budgetAmount: 3600,
        varianceAmount: 275.5,
        status: "over_budget",
      },
      {
        id: "rws-budget-chi-sales",
        scheduleId: "rws-sch-chicago-backtoschool",
        storeName: "Chicago West",
        departmentName: "Sales Floor",
        scheduledHours: 232,
        scheduledLaborCost: 4512,
        budgetAmount: 4700,
        varianceAmount: -188,
        status: "within_budget",
      },
      {
        id: "rws-budget-kl-ops",
        scheduleId: "rws-sch-kl-yearend",
        storeName: "KLCC Retail",
        departmentName: "Operations",
        scheduledHours: 196,
        scheduledLaborCost: 2980,
        budgetAmount: 3100,
        varianceAmount: -120,
        status: "pending_review",
      },
    ]);

  const complianceFindings = withOrg<HrRwsComplianceFindingInput>(
    organizationId,
    [
      {
        id: "rws-comp-301-rest",
        scheduleId: "rws-sch-peak-nyc",
        employeeId: "emp-301",
        employeeDisplayName: "Jamal Reed",
        rule: "minimum_rest_period",
        finding: "Closing shift follows prior late shift with less than configured rest threshold.",
        severity: "warning",
        overrideRequired: true,
      },
      {
        id: "rws-comp-302-minor",
        scheduleId: "rws-sch-chicago-backtoschool",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        rule: "minor_worker",
        finding: "Minor worker scheduled beyond local school-hour restriction.",
        severity: "blocker",
        overrideRequired: true,
      },
      {
        id: "rws-comp-304-late-night",
        scheduleId: "rws-sch-kl-yearend",
        employeeId: "emp-304",
        employeeDisplayName: "Siti Rahman",
        rule: "late_night",
        finding: "Late-night premium reference required for payroll handoff.",
        severity: "warning",
        overrideRequired: false,
      },
      {
        id: "rws-comp-nyc-budget",
        scheduleId: "rws-sch-peak-nyc",
        rule: "peak_season",
        finding: "Holiday peak schedule exceeds approved labor budget before publication.",
        severity: "warning",
        overrideRequired: true,
      },
    ],
  );

  const notifications = withOrg<HrRwsNotificationInput>(organizationId, [
    {
      id: "rws-note-nyc-publish",
      notificationType: "schedule_published",
      employeeId: "emp-300",
      employeeDisplayName: "Alicia Moreno",
      targetRef: "rws-sch-peak-nyc",
      recipients: ["emp-300", "emp-301"],
      generatedAt: "2026-11-20T12:00:00.000Z",
      status: "queued",
    },
    {
      id: "rws-note-open-shift",
      notificationType: "open_shift",
      targetRef: "rws-open-nyc-cashier-1127",
      recipients: ["emp-300", "emp-301"],
      generatedAt: "2026-11-21T09:00:00.000Z",
      status: "sent",
    },
    {
      id: "rws-note-swap-reject",
      notificationType: "swap_rejected",
      employeeId: "emp-302",
      employeeDisplayName: "Mei Lin Tan",
      targetRef: "rws-swap-302-303",
      recipients: ["emp-302", "emp-303", "emp-901"],
      generatedAt: "2026-08-18T15:30:00.000Z",
      status: "acknowledged",
    },
  ]);

  const attendanceComparisons =
    withOrg<HrRwsAttendanceComparisonInput>(organizationId, [
      {
        id: "rws-att-300",
        scheduleId: "rws-sch-peak-nyc",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        scheduledHours: 8,
        actualHours: 8.5,
        varianceHours: 0.5,
        attendanceOutcomeRef: "att-outcome-300-bf",
        status: "variance",
      },
      {
        id: "rws-att-303",
        scheduleId: "rws-sch-chicago-backtoschool",
        employeeId: "emp-303",
        employeeDisplayName: "Noah Kim",
        scheduledHours: 8,
        actualHours: 8,
        varianceHours: 0,
        attendanceOutcomeRef: "att-outcome-303-bts",
        status: "matched",
      },
      {
        id: "rws-att-304",
        scheduleId: "rws-sch-kl-yearend",
        employeeId: "emp-304",
        employeeDisplayName: "Siti Rahman",
        scheduledHours: 8.5,
        actualHours: 8,
        varianceHours: -0.5,
        attendanceOutcomeRef: "att-outcome-304-yearend",
        status: "variance",
      },
    ]);

  const payrollReferences = withOrg<HrRwsPayrollReferenceInput>(
    organizationId,
    [
      {
        id: "rws-pay-300",
        scheduleId: "rws-sch-peak-nyc",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        scheduledHours: 8,
        actualHoursRef: "att-outcome-300-bf",
        shiftPremiumRef: "premium-peak-nyc",
        holidayWorkRef: "holiday-black-friday",
        attendanceOutcomeRef: "att-outcome-300-bf",
        status: "ready",
      },
      {
        id: "rws-pay-302",
        scheduleId: "rws-sch-chicago-backtoschool",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        scheduledHours: 8.5,
        attendanceOutcomeRef: "att-outcome-302-bts",
        status: "blocked",
      },
      {
        id: "rws-pay-304",
        scheduleId: "rws-sch-kl-yearend",
        employeeId: "emp-304",
        employeeDisplayName: "Siti Rahman",
        scheduledHours: 8.5,
        actualHoursRef: "att-outcome-304-yearend",
        shiftPremiumRef: "premium-late-night-my",
        holidayWorkRef: "holiday-yearend-my",
        attendanceOutcomeRef: "att-outcome-304-yearend",
        status: "exposed",
      },
    ],
  );

  const integrationExposures =
    withOrg<HrRwsIntegrationExposureInput>(organizationId, [
      {
        id: "rws-int-payroll-300",
        integrationTarget: "payroll_processing",
        sourceRef: "rws-pay-300",
        summary: "Scheduled hours, peak premium, holiday work, and actual attendance reference ready for payroll.",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        exposedAt: "2026-11-30T08:00:00.000Z",
        status: "ready",
      },
      {
        id: "rws-int-attendance-304",
        integrationTarget: "attendance_outcomes",
        sourceRef: "rws-att-304",
        summary: "Late-night scheduled-vs-actual comparison exposed through attendance outcomes.",
        employeeId: "emp-304",
        employeeDisplayName: "Siti Rahman",
        exposedAt: "2026-12-27T09:00:00.000Z",
        status: "exposed",
      },
      {
        id: "rws-int-forecast-nyc",
        integrationTarget: "retail_operations",
        sourceRef: "rws-demand-nyc-footfall",
        summary: "Footfall demand reference consumed for holiday peak coverage planning.",
        exposedAt: "2026-11-19T10:00:00.000Z",
        status: "exposed",
      },
    ]);

  const auditEvents = withOrg<HrIndustryRwsAuditEvent>(organizationId, [
    {
      id: "rws-audit-draft",
      action: hrIndustryRwsAuditActions.scheduleDraftCreated,
      actorId: "emp-900",
      targetType: "schedule",
      targetId: "rws-sch-peak-nyc",
      summary: "Draft holiday peak roster created for NYC Flagship.",
      occurredAt: "2026-11-18T09:00:00.000Z",
    },
    {
      id: "rws-audit-budget",
      action: hrIndustryRwsAuditActions.budgetWarningRaised,
      actorId: "system",
      targetType: "labor_budget",
      targetId: "rws-budget-nyc-front",
      summary: "Over-budget warning raised before schedule publication.",
      occurredAt: "2026-11-18T09:05:00.000Z",
    },
    {
      id: "rws-audit-open-claim",
      action: hrIndustryRwsAuditActions.openShiftClaimed,
      actorId: "emp-300",
      targetType: "open_shift",
      targetId: "rws-open-nyc-cashier-1127",
      employeeId: "emp-300",
      summary: "Employee claimed eligible peak open shift pending manager approval.",
      occurredAt: "2026-11-21T10:00:00.000Z",
    },
    {
      id: "rws-audit-swap-reject",
      action: hrIndustryRwsAuditActions.swapRejected,
      actorId: "emp-901",
      targetType: "shift_swap",
      targetId: "rws-swap-302-303",
      employeeId: "emp-302",
      summary: "Shift swap rejected with required reason after validation failure.",
      occurredAt: "2026-08-18T15:30:00.000Z",
    },
    {
      id: "rws-audit-payroll",
      action: hrIndustryRwsAuditActions.payrollReferenceExposed,
      actorId: "system",
      targetType: "payroll_reference",
      targetId: "rws-pay-304",
      employeeId: "emp-304",
      summary: "Late-night premium schedule reference exposed through attendance outcomes.",
      occurredAt: "2026-12-27T09:00:00.000Z",
    },
  ]);

  return {
    retailSchedules,
    shiftAssignments,
    availabilityPreferences,
    blockedDates,
    coverageRequirements,
    openShifts,
    shiftSwapRequests,
    laborDemandReferences,
    laborBudgetSnapshots,
    complianceFindings,
    notifications,
    attendanceComparisons,
    payrollReferences,
    integrationExposures,
    auditEvents,
  };
}

export function getHrIndustryRwsStore(organizationId: string): HrIndustryRwsStore {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function resetHrIndustryRwsStore(organizationId: string): HrIndustryRwsStore {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function filterHrIndustryRwsRecordsForAccess(input: {
  readonly store: HrIndustryRwsStore;
  readonly visibleEmployeeIds: readonly string[] | null;
}): HrIndustryRwsStore {
  const { store, visibleEmployeeIds } = input;
  return {
    ...store,
    shiftAssignments: scopedRows(store.shiftAssignments, visibleEmployeeIds),
    availabilityPreferences: scopedRows(
      store.availabilityPreferences,
      visibleEmployeeIds,
    ),
    blockedDates: scopedRows(store.blockedDates, visibleEmployeeIds),
    openShifts: store.openShifts.filter(
      (row) =>
        visibleEmployeeIds === null ||
        !row.claimantEmployeeId ||
        visibleEmployeeIds.includes(row.claimantEmployeeId) ||
        row.eligibleEmployeeIds.some((employeeId) =>
          visibleEmployeeIds.includes(employeeId),
        ),
    ),
    shiftSwapRequests: store.shiftSwapRequests.filter(
      (row) =>
        visibleEmployeeIds === null ||
        visibleEmployeeIds.includes(row.requesterEmployeeId) ||
        visibleEmployeeIds.includes(row.replacementEmployeeId),
    ),
    complianceFindings: scopedRows(store.complianceFindings, visibleEmployeeIds),
    notifications: scopedRows(store.notifications, visibleEmployeeIds),
    attendanceComparisons: scopedRows(
      store.attendanceComparisons,
      visibleEmployeeIds,
    ),
    payrollReferences: scopedRows(store.payrollReferences, visibleEmployeeIds),
    integrationExposures: scopedRows(
      store.integrationExposures,
      visibleEmployeeIds,
    ),
    auditEvents: store.auditEvents.filter(
      (row) =>
        !row.employeeId ||
        visibleEmployeeIds === null ||
        visibleEmployeeIds.includes(row.employeeId),
    ),
  };
}

export function listHrIndustryRwsOpenShiftEligibilityRefs(
  store: HrIndustryRwsStore,
): HrRwsOpenShiftEligibilityReference[] {
  return store.openShifts.flatMap((shift) =>
    shift.eligibleEmployeeIds.map((employeeId) => ({
      id: `${shift.id}-${employeeId}`,
      openShiftId: shift.id,
      employeeId,
      employeeDisplayName:
        store.shiftAssignments.find((row) => row.employeeId === employeeId)
          ?.employeeDisplayName ?? employeeId,
      status: shift.status,
      eligibilityFlags: [
        shift.approvalRequired ? "manager_approval_required" : "auto_claim",
        `${shift.roleName}_role_required`,
      ],
    })),
  );
}

export function listHrIndustryRwsCoverageGapRefs(
  store: HrIndustryRwsStore,
): HrRwsCoverageGapReference[] {
  return store.coverageRequirements
    .filter((row) => row.status !== "balanced")
    .map((row) => ({ ...row, roleName: row.roleName }));
}

export function listHrIndustryRwsAttendanceOutcomeRefs(
  store: HrIndustryRwsStore,
): HrRwsAttendanceOutcomeReference[] {
  return store.attendanceComparisons.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeDisplayName: row.employeeDisplayName,
    scheduleId: row.scheduleId,
    scheduledHours: row.scheduledHours,
    actualHours: row.actualHours,
    varianceHours: row.varianceHours,
    attendanceOutcomeRef: row.attendanceOutcomeRef,
  }));
}

export function listHrIndustryRwsPayrollScheduleRefs(
  store: HrIndustryRwsStore,
): HrRwsPayrollScheduleReferenceExport[] {
  const budgetBySchedule = new Map(
    store.laborBudgetSnapshots.map((row) => [row.scheduleId, row.status]),
  );
  return store.payrollReferences.map((row) => ({
    id: row.id,
    scheduleId: row.scheduleId,
    employeeId: row.employeeId,
    employeeDisplayName: row.employeeDisplayName,
    scheduledHours: row.scheduledHours,
    actualHoursRef: row.actualHoursRef,
    shiftPremiumRef: row.shiftPremiumRef,
    holidayWorkRef: row.holidayWorkRef,
    attendanceOutcomeRef: row.attendanceOutcomeRef,
    budgetStatus: budgetBySchedule.get(row.scheduleId) ?? "pending_review",
  }));
}

export function listHrIndustryRwsIntegrationExposureRefs(
  store: HrIndustryRwsStore,
): HrRwsIntegrationExposureReference[] {
  return store.integrationExposures.map((row) => ({
    id: row.id,
    integrationTarget: row.integrationTarget,
    sourceRef: row.sourceRef,
    summary: row.summary,
    employeeId: row.employeeId,
    status: row.status,
  }));
}

function reportGroupLabel(input: {
  readonly schedule: HrRwsRetailScheduleInput | undefined;
  readonly assignment: HrRwsShiftAssignmentInput | undefined;
  readonly groupBy: HrRwsReportGroupBy;
}) {
  const { schedule, assignment, groupBy } = input;
  switch (groupBy) {
    case "store":
      return schedule?.storeName ?? assignment?.storeName ?? "Unassigned store";
    case "department":
      return schedule?.departmentName ?? assignment?.departmentName ?? "Unassigned department";
    case "employee":
      return assignment?.employeeDisplayName ?? "Schedule summary";
    case "manager":
      return schedule?.managerDisplayName ?? assignment?.managerDisplayName ?? "Unassigned manager";
    case "role":
      return schedule?.roleName ?? assignment?.roleName ?? "Mixed roles";
    case "shift":
      return assignment?.shiftType ?? "Schedule summary";
    case "labor_cost":
      return schedule?.scheduledLaborCost && schedule.scheduledLaborCost > 0
        ? "Labor cost scheduled"
        : "No cost reference";
    case "budget_variance":
      return schedule?.budgetStatus ?? "No budget status";
    case "coverage_gap":
      return (schedule?.coverageGapCount ?? 0) > 0 ? "Gap flagged" : "Balanced";
    case "period":
      return schedule?.periodType ?? "No period";
  }
}

export function buildHrIndustryRwsReportRows(input: {
  readonly store: HrIndustryRwsStore;
  readonly groupBy: HrRwsReportGroupBy;
}): HrIndustryRwsReportRow[] {
  const schedulesById = new Map(
    input.store.retailSchedules.map((schedule) => [schedule.id, schedule]),
  );
  const groups = new Map<string, HrIndustryRwsReportRow>();

  for (const assignment of input.store.shiftAssignments) {
    const schedule = schedulesById.get(assignment.scheduleId);
    const label = reportGroupLabel({
      schedule,
      assignment,
      groupBy: input.groupBy,
    });
    const existing = groups.get(label);
    groups.set(label, {
      id: `rws-report-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      groupLabel: label,
      scheduleCount: existing?.scheduleCount ?? (schedule ? 1 : 0),
      assignmentCount: (existing?.assignmentCount ?? 0) + 1,
      scheduledHours: roundMoney(
        (existing?.scheduledHours ?? 0) + assignment.scheduledHours,
      ),
      scheduledLaborCost: roundMoney(
        (existing?.scheduledLaborCost ?? 0) +
          (schedule?.scheduledLaborCost ?? 0) / Math.max(1, input.store.shiftAssignments.length),
      ),
      budgetVariance: roundMoney(
        (existing?.budgetVariance ?? 0) +
          ((schedule?.scheduledLaborCost ?? 0) - (schedule?.budgetAmount ?? 0)) /
            Math.max(1, input.store.shiftAssignments.length),
      ),
      coverageGapCount:
        (existing?.coverageGapCount ?? 0) + (schedule?.coverageGapCount ?? 0),
      overtimeRiskCount:
        (existing?.overtimeRiskCount ?? 0) + (schedule?.overtimeRiskCount ?? 0),
      complianceFindingCount:
        (existing?.complianceFindingCount ?? 0) +
        (assignment.complianceStatus === "blocked" ? 1 : 0),
    });
  }

  return [...groups.values()];
}

export function emitHrIndustryRwsAuditEvent(input: {
  readonly store: HrIndustryRwsStore;
  readonly action: HrIndustryRwsAuditAction;
  readonly actorId: string;
  readonly targetType: HrIndustryRwsAuditEvent["targetType"];
  readonly targetId: string;
  readonly employeeId?: string;
  readonly summary: string;
}) {
  const event: HrIndustryRwsAuditEvent = {
    id: `rws-audit-${input.store.auditEvents.length + 1}`,
    organizationId: input.store.retailSchedules[0]?.organizationId ?? "unknown",
    action: input.action,
    actorId: input.actorId,
    targetType: input.targetType,
    targetId: input.targetId,
    employeeId: input.employeeId,
    summary: input.summary,
    occurredAt: new Date().toISOString(),
  };
  input.store.auditEvents = [event, ...input.store.auditEvents];
  return event;
}
