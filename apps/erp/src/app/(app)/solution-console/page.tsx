import { solutionConsolePageMetadata } from "@afenda/domain";
import { getCachedNavigationExtensionMetadata } from "@/lib/cached-module-metadata";
import { SolutionConsoleRoutePage } from "./solution-console-route";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const cachedMetadata =
    await getCachedNavigationExtensionMetadata("solution-console");

  return (
    cachedMetadata ?? {
      title: solutionConsolePageMetadata.title,
      description: solutionConsolePageMetadata.description,
    }
  );
}

export default SolutionConsoleRoutePage;
