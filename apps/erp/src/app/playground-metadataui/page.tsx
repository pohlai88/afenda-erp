import { MetadataUiRenderStack } from "@afenda/metadata-ui/server";

import {
  createMetadataUiPlaygroundRenderContext,
  createMetadataUiPlaygroundStack,
} from "./_fixtures/stack.fixture";

export default function MetadataUiPlaygroundPage() {
  return (
    <main className="@container mx-auto w-full max-w-[min(1680px,calc(100vw-1.5rem))] px-3 py-surface-lg sm:px-4 lg:px-6">
      <MetadataUiRenderStack
        className="metadata-ui-render-stack grid grid-cols-12 gap-surface-lg"
        sections={createMetadataUiPlaygroundStack()}
        context={createMetadataUiPlaygroundRenderContext()}
      />
    </main>
  );
}
