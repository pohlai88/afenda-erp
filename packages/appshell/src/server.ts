import "server-only";

export {
  APP_SHELL_COMMAND_RECENTS_LIMIT,
  normalizeCommandRecentIds,
} from "./app-shell/command/command-recents.shared";
export {
  appShellCommandItemSchema,
  appShellCommandKindSchema,
  appShellCommandSearchText,
  appShellCommandSectionSchema,
  appShellChromeSchema,
  appShellPreferenceSnapshotSchema,
  appShellPreferenceUpdateSchema,
  appShellRailModeSchema,
  parseAppShellChrome,
  parseAppShellPreferenceSnapshot,
  parseAppShellPreferenceUpdate,
} from "./app-shell/appshell-props.shared";
export * from "./app-shell/appshell-props.shared";
export * from "./app-shell/iconography.shared";
export * from "./app-shell/left-rail-bar/appshell-primary-left-rail.schema";
export * from "./app-shell/operational-context-stack.shared";
export * from "./app-shell/top-utils-bar/metadata/utility-bar-metadata.shared";
