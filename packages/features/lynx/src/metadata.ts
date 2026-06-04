/**
 * Governed metadata public door for @afenda/feature-lynx.
 */
export const lynxAiFeatureFlags = [
  "solution-provider",
  "lynx-truth",
  "lynx-operator",
] as const;

export type LynxAiFeatureFlag = (typeof lynxAiFeatureFlags)[number];

export * from "./lyn-surface.shared";
export { LYNX_MODULE_ID } from "./lyn-core.contract";
export { lynxConsoleStatSurfaceKey } from "./lyn-console.surface";
export {
  getLynxConsoleSection,
  getLynxConsoleUxCards,
  getLynxNavigationExtensionHeroCopy,
  lynxConsoleAgentCopy,
  lynxConsoleHeroFallback,
  lynxConsoleMetrics,
  lynxConsolePageMetadata,
  lynxConsoleSections,
  lynxConsoleUxCards,
} from "./lyn-console-ui.copy.shared";
