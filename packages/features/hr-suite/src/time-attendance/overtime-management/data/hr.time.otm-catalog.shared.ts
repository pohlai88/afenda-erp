import {
  HRM_OTM_DAY_CATEGORIES,
  HRM_OTM_TIMING_KINDS,
  type HrOvertimeTimingKind,
  type HrOvertimeType,
} from "@afenda/db";

export { HRM_OTM_DAY_CATEGORIES, HRM_OTM_TIMING_KINDS };

export const HR_OTM_DAY_CATEGORY_LABELS: Record<HrOvertimeType, string> = {
  regular: "Normal day",
  rest_day: "Rest day",
  off_day: "Off day",
  public_holiday: "Public holiday",
  night: "Night overtime",
  emergency: "Emergency overtime",
  weekend: "Weekend",
  holiday: "Holiday",
};

export const HR_OTM_TIMING_KIND_LABELS: Record<HrOvertimeTimingKind, string> = {
  planned: "Planned overtime",
  actual: "Actual overtime",
};

export const HR_OTM_DAY_CATEGORY_OPTIONS = HRM_OTM_DAY_CATEGORIES.map(
  (value) => ({
    value,
    label: HR_OTM_DAY_CATEGORY_LABELS[value],
  }),
);

export const HR_OTM_TIMING_KIND_OPTIONS = HRM_OTM_TIMING_KINDS.map((value) => ({
  value,
  label: HR_OTM_TIMING_KIND_LABELS[value],
}));
