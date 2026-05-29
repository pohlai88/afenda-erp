/**
 * Governed metadata public door for @afenda/feature-lynx.
 */
export * from "./surfaces";
export { LYNX_MODULE_ID } from "./contracts/lynx.core.contract";
export { lynxConsoleStatSurfaceKey } from "./surfaces/lynx.console.surface";
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
} from "./shell/lynx-console-copy.shared";
