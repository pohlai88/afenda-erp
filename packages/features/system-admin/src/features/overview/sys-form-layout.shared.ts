/**
 * Shared admin form grid layouts — single source for invite/assign field rows.
 * Role column uses minmax(9rem, 11.25rem) (~144–180px) for consistent control width.
 */
export const systemAdminEmailRoleActionFormGridClass =
  "grid gap-surface-md @md:grid-cols-[minmax(0,1fr)_minmax(9rem,11.25rem)_auto]";

export const systemAdminEmailRoleActionFormFooterClass =
  "@md:col-span-3 flex flex-col gap-surface-sm";

export const systemAdminInlineFormMaxWidthClass = "@container max-w-2xl";
