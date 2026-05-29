/**
 * HR record contracts — extend as Slice 1 workforce types land in @afenda/db.
 * Until schema/hr exists, routes use kernel erp_module_records compatibility.
 */
export type HrRecordKind = "employee" | "department" | "position" | "assignment";

export type HrRecordRef = {
  readonly id: string;
  readonly kind: HrRecordKind;
};
