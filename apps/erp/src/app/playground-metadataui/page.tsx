import { Badge, Card, CardContent, CardHeader, CardTitle } from "@afenda/ui";

import { METADATA_UI_PLAYGROUND_FIXED_INSTANT } from "./_fixtures/constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_COPY } from "./_fixtures/sample-vocabulary.fixture";

export default function MetadataUiPlaygroundPage() {
  return (
    <main className="@container mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6">
      <section className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit">
          Developer only
        </Badge>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">
          {METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {METADATA_UI_PLAYGROUND_SAMPLE_COPY.appDescription}
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Slice 02 Ready</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
            <p>
              The route shell, production gate, static AppShell frame, fixture
              constants, sample vocabulary, and first metadata-ui stack fixture
              are in place.
            </p>
            <p>Fixture baseline: {METADATA_UI_PLAYGROUND_FIXED_INSTANT}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
