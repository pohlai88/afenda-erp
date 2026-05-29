import { getCachedNavigationExtensionMetadata } from "@/lib/cached-module-metadata";
import { LynxConsoleRoutePage } from "@/workspace-routes/lynx-console-route";
import type { WorkspaceRouteInstant } from "@/workspace-routes/workspace-route-instant";

export const unstable_instant = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;
import { lynxConsolePageMetadata } from "@afenda/feature-lynx/client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const cachedMetadata = await getCachedNavigationExtensionMetadata("lynx");

  return (
    cachedMetadata ?? {
      title: lynxConsolePageMetadata.title,
      description: lynxConsolePageMetadata.description,
    }
  );
}

export default LynxConsoleRoutePage;
