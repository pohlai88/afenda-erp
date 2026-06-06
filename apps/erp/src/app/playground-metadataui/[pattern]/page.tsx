import { MetadataUiRenderStack } from "@afenda/metadata-ui/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  METADATA_UI_PLAYGROUND_PATTERN_KEYS,
  createMetadataUiPlaygroundRenderContext,
  createMetadataUiPlaygroundStackForPattern,
  isMetadataUiPlaygroundPatternKey,
  type MetadataUiPlaygroundPatternKey,
} from "../_fixtures/stack.fixture";

type MetadataUiPlaygroundPatternPageProps = Readonly<{
  params: Promise<{
    pattern: string;
  }>;
}>;

export function generateStaticParams() {
  return METADATA_UI_PLAYGROUND_PATTERN_KEYS.filter(
    (pattern) => pattern !== "overview",
  ).map((pattern) => ({
    pattern,
  }));
}

export async function generateMetadata({
  params,
}: MetadataUiPlaygroundPatternPageProps): Promise<Metadata> {
  const { pattern } = await params;

  if (!isMetadataUiPlaygroundPatternKey(pattern)) {
    return {
      title: "Metadata UI Playground",
    };
  }

  return {
    title: `Metadata UI Playground - ${pattern}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

function resolveMetadataUiPlaygroundPattern(
  value: string,
): Exclude<MetadataUiPlaygroundPatternKey, "overview"> {
  if (!isMetadataUiPlaygroundPatternKey(value) || value === "overview") {
    notFound();
  }

  return value;
}

export default async function MetadataUiPlaygroundPatternPage({
  params,
}: MetadataUiPlaygroundPatternPageProps) {
  const { pattern } = await params;
  const resolvedPattern = resolveMetadataUiPlaygroundPattern(pattern);

  return (
    <main className="@container mx-auto w-full max-w-[min(1680px,calc(100vw-1.5rem))] px-3 py-surface-lg sm:px-4 lg:px-6">
      <MetadataUiRenderStack
        className="metadata-ui-render-stack grid grid-cols-12 gap-surface-lg"
        sections={createMetadataUiPlaygroundStackForPattern(resolvedPattern)}
        context={createMetadataUiPlaygroundRenderContext()}
      />
    </main>
  );
}
