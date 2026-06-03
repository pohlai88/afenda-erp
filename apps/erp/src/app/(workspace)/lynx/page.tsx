import { getCachedNavigationExtensionMetadata } from "@/lib/cached-module-metadata";
import { LynxConsoleRoutePage } from "@/routes/workspace/lynx/lynx-console-route";
import { lynxConsolePageMetadata } from "@afenda/feature-lynx/client";
import type { Metadata } from "next";

export const unstable_instant = false;

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
