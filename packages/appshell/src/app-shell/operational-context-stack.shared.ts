import { z } from "zod";

export const APP_SHELL_OPERATIONAL_CONTEXT_LEVELS = [
  "org",
  "workspace",
  "surface",
  "focus",
  "workflow",
] as const;

export type AppShellOperationalContextLevel =
  (typeof APP_SHELL_OPERATIONAL_CONTEXT_LEVELS)[number];

export const appShellOperationalContextNodeSchema = z
  .object({
    id: z.string().trim().min(1).max(160),
    label: z.string().trim().min(1).max(160),
    href: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).max(240).optional(),
    meta: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

export const appShellOperationalContextStackSchema = z
  .object({
    org: appShellOperationalContextNodeSchema,
    workspace: appShellOperationalContextNodeSchema,
    surface: appShellOperationalContextNodeSchema,
    focus: appShellOperationalContextNodeSchema.optional(),
    workflow: appShellOperationalContextNodeSchema.optional(),
  })
  .strict();

export type AppShellOperationalContextNode = z.infer<
  typeof appShellOperationalContextNodeSchema
>;

export const APP_SHELL_OPERATIONAL_CONTEXT_PRIORITY = {
  base: 0,
  surface: 10,
  workflow: 20,
  focus: 30,
} as const;

export type AppShellOperationalContextStackPatch = Partial<
  Record<AppShellOperationalContextLevel, AppShellOperationalContextNode | null>
>;

export type AppShellOperationalContextStack = z.infer<
  typeof appShellOperationalContextStackSchema
>;

export function isAppShellOperationalContextStack(
  stack: Partial<AppShellOperationalContextStack> | null | undefined,
): stack is AppShellOperationalContextStack {
  return Boolean(stack?.org && stack.workspace && stack.surface);
}

export type AppShellOperationalContextEntry =
  AppShellOperationalContextNode & {
    level: AppShellOperationalContextLevel;
  };

export function parseAppShellOperationalContextStack(data: unknown) {
  return appShellOperationalContextStackSchema.parse(
    data,
  ) as AppShellOperationalContextStack;
}

export function appShellOperationalContextStackToEntries(
  stack: AppShellOperationalContextStack | null | undefined,
) {
  if (!isAppShellOperationalContextStack(stack)) {
    return [];
  }

  const entries: AppShellOperationalContextEntry[] = [
    { level: "org", ...stack.org },
    { level: "workspace", ...stack.workspace },
    { level: "surface", ...stack.surface },
  ];

  if (stack.focus) {
    entries.push({ level: "focus", ...stack.focus });
  }

  if (stack.workflow) {
    entries.push({ level: "workflow", ...stack.workflow });
  }

  return entries;
}
