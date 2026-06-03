export const HRM_BENEFIT_CATEGORIES = [
  "health",
  "insurance",
  "retirement",
  "welfare",
  "transport",
  "meal",
  "housing",
  "education",
  "wellness",
] as const;

export const HRM_BENEFIT_COVERAGE_LEVELS = [
  "employee_only",
  "employee_spouse",
  "employee_children",
  "family",
] as const;

export const HRM_BENEFIT_DEPENDENT_RELATIONSHIPS = [
  "spouse",
  "child",
  "domestic_partner",
  "other",
] as const;

export const HRM_BENEFIT_ENROLLMENT_CHANNELS = [
  "new_hire",
  "open_enrollment",
  "life_event",
  "administrative",
] as const;

export const HRM_BENEFIT_LIFE_EVENT_KINDS = [
  "marriage",
  "divorce",
  "birth",
  "adoption",
  "death",
  "loss_of_coverage",
  "relocation",
  "other",
] as const;

export const HRM_BENEFIT_OPEN_ENROLLMENT_STATUSES = [
  "draft",
  "scheduled",
  "active",
  "closed",
] as const;
