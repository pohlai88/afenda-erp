import type { AppCapability } from "@afenda/kernel";

export const __CONSTANT_PREFIX___READ_CAPABILITY =
  "hr.view" satisfies AppCapability;

export const __CONSTANT_PREFIX___RECORD_STATUSES = [
  "draft",
  "active",
  "inactive",
  "archived",
] as const;

export const __CONSTANT_PREFIX___REPORT_GROUP_BY = [
  "status",
  "owner",
] as const;

export const __CONSTANT_PREFIX___STATUS_FILTERS = [
  "all",
  ...__CONSTANT_PREFIX___RECORD_STATUSES,
] as const;

export type __IDENTIFIER__RecordStatus =
  (typeof __CONSTANT_PREFIX___RECORD_STATUSES)[number];
export type __IDENTIFIER__ReportGroupBy =
  (typeof __CONSTANT_PREFIX___REPORT_GROUP_BY)[number];
export type __IDENTIFIER__StatusFilter =
  (typeof __CONSTANT_PREFIX___STATUS_FILTERS)[number];
