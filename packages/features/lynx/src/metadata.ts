/**
 * Governed metadata public door for @afenda/feature-lynx.
 */
export const lynxAiFeatureFlags = [
  "solution-provider",
  "lynx-truth",
  "lynx-operator",
] as const;

export type LynxAiFeatureFlag = (typeof lynxAiFeatureFlags)[number];

export * from "./surface";
export { LYNX_MODULE_ID } from "./contracts/lynx.core.contract";
export { lynxConsoleStatSurfaceKey } from "./surface/lynx.console.surface";
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
} from "./surface/lynx.console-ui.copy.shared";
