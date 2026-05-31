export const hrMcpRoutePaths = {
  hub: "/hr",
  multiCountryPayroll: "/hr/multi-country-payroll",
  countryConfigs: "/hr/multi-country-payroll/countries",
  legalEntities: "/hr/multi-country-payroll/legal-entities",
  rules: "/hr/multi-country-payroll/rules",
  calendars: "/hr/multi-country-payroll/calendars",
  classifications: "/hr/multi-country-payroll/classifications",
} as const;

export type HrMcpRoutePath =
  (typeof hrMcpRoutePaths)[keyof typeof hrMcpRoutePaths];

export const hrMcpActionNames = {
  upsertCountryConfig: "upsertCountryConfig",
  upsertLegalEntitySetup: "upsertLegalEntitySetup",
  upsertTaxRule: "upsertTaxRule",
  upsertStatutoryContributionRule: "upsertStatutoryContributionRule",
  upsertEmployerContributionRule: "upsertEmployerContributionRule",
  upsertPayComponentTreatment: "upsertPayComponentTreatment",
  upsertCurrencyConfig: "upsertCurrencyConfig",
  upsertExchangeRate: "upsertExchangeRate",
  upsertPayrollCalendar: "upsertPayrollCalendar",
  upsertCalendarPeriod: "upsertCalendarPeriod",
  upsertPublicHoliday: "upsertPublicHoliday",
  upsertStatutoryDeadline: "upsertStatutoryDeadline",
  upsertProrationRule: "upsertProrationRule",
  upsertOvertimeRule: "upsertOvertimeRule",
  upsertLeavePayrollTreatment: "upsertLeavePayrollTreatment",
  upsertEmployeeClassification: "upsertEmployeeClassification",
  createRuleVersion: "createRuleVersion",
  publishRuleVersion: "publishRuleVersion",
} as const;

export type HrMcpActionName =
  (typeof hrMcpActionNames)[keyof typeof hrMcpActionNames];
