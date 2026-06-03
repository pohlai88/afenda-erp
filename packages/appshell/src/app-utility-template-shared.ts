export const APP_SHELL_UTILITY_TEMPLATE_VERSION = 1;

export const APP_SHELL_UTILITY_TEMPLATE_SURFACE_KINDS = [
  "button",
  "dropdown",
  "popover",
  "sheet",
  "dialog",
  "custom",
] as const;

export type AppShellUtilityTemplateSurfaceKind =
  (typeof APP_SHELL_UTILITY_TEMPLATE_SURFACE_KINDS)[number];
