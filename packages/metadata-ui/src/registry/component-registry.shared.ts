import {
  parseMetadataUiComponentContract,
  type MetadataUiComponentContract,
  type MetadataUiComponentContractForKind,
  type MetadataUiComponentContractInput,
  type MetadataUiComponentId,
  type MetadataUiComponentKind,
  type MetadataUiComponentRuntime,
} from "../contracts/component.contract";

type MetadataUiComponentRegistryEntries =
  readonly MetadataUiComponentContract[];

type MetadataUiComponentContractFromInput<
  Input extends MetadataUiComponentContractInput,
> = MetadataUiComponentContract &
  Pick<Input, Extract<keyof Input, "id" | "kind" | "runtime">>;

type MetadataUiComponentContractsFromInputs<
  Entries extends readonly MetadataUiComponentContractInput[],
> = {
  readonly [Index in keyof Entries]: MetadataUiComponentContractFromInput<
    Entries[Index]
  >;
};

export type MetadataUiComponentRegistryEntry<
  Id extends MetadataUiComponentId = MetadataUiComponentId,
> = Extract<MetadataUiComponentContract, { id: Id }>;

export type MetadataUiComponentRegistryById<
  Entries extends MetadataUiComponentRegistryEntries,
> = {
  [Entry in Entries[number] as Entry["id"]]: Entry;
};

export type MetadataUiComponentRegistryIds<
  Entries extends MetadataUiComponentRegistryEntries,
> = Entries[number]["id"];

export type MetadataUiComponentRegistryEntriesForKind<
  Entries extends MetadataUiComponentRegistryEntries,
  Kind extends MetadataUiComponentKind,
> = Extract<Entries[number], { kind: Kind }>;

export type MetadataUiComponentRegistryEntriesForRuntime<
  Entries extends MetadataUiComponentRegistryEntries,
  Runtime extends MetadataUiComponentRuntime,
> = Extract<Entries[number], { runtime: Runtime }>;

function defineMetadataUiComponent<
  const Input extends MetadataUiComponentContractInput,
>(input: Input): MetadataUiComponentContract {
  return parseMetadataUiComponentContract(input);
}

function defineMetadataUiComponents<
  const Entries extends readonly MetadataUiComponentContractInput[],
>(entries: Entries): MetadataUiComponentContractsFromInputs<Entries> {
  return entries.map((entry) =>
    defineMetadataUiComponent(entry),
  ) as MetadataUiComponentContractsFromInputs<Entries>;
}

export const METADATA_UI_COMPONENT_REGISTRY = defineMetadataUiComponents([
  {
    id: "metadata-ui.section.list",
    kind: "section",
    runtime: "server",
    label: "List section",
    description: "Server section entry for metadata-driven lists.",
    capabilities: ["render", "compose"],
    metadata: { sectionKind: "list" },
  },
  {
    id: "metadata-ui.section.stat",
    kind: "section",
    runtime: "server",
    label: "Stat section",
    description: "Server section entry for metadata-driven stat groups.",
    capabilities: ["render", "compose"],
    metadata: { sectionKind: "stat" },
  },
  {
    id: "metadata-ui.section.chart",
    kind: "section",
    runtime: "server",
    label: "Chart section",
    description: "Server section entry for metadata-driven charts.",
    capabilities: ["render", "compose"],
    metadata: { sectionKind: "chart" },
  },
  {
    id: "metadata-ui.section.action-bar",
    kind: "section",
    runtime: "server",
    label: "Action bar section",
    description: "Server section entry for metadata-driven action bars.",
    capabilities: ["render", "compose", "interact"],
    metadata: { sectionKind: "action-bar" },
  },
  {
    id: "metadata-ui.section.form",
    kind: "section",
    runtime: "server",
    label: "Form section",
    description: "Server section entry for metadata-driven forms.",
    capabilities: ["render", "compose", "submit"],
    metadata: { sectionKind: "form" },
  },
  {
    id: "metadata-ui.section.kanban",
    kind: "section",
    runtime: "server",
    label: "Kanban section",
    description: "Server section entry for metadata-driven kanban boards.",
    capabilities: ["render", "compose", "interact"],
    metadata: { sectionKind: "kanban" },
  },
  {
    id: "metadata-ui.section.audit-panel",
    kind: "section",
    runtime: "server",
    label: "Audit panel section",
    description: "Server section entry for metadata-driven audit panels.",
    capabilities: ["render", "compose"],
    metadata: { sectionKind: "audit-panel" },
  },
  {
    id: "metadata-ui.section.detail-tabs",
    kind: "section",
    runtime: "server",
    label: "Detail tabs section",
    description: "Server section entry for metadata-driven detail tabs.",
    capabilities: ["render", "compose", "navigate"],
    metadata: { sectionKind: "detail-tabs" },
  },
  {
    id: "metadata-ui.section.page-header",
    kind: "section",
    runtime: "server",
    label: "Page header section",
    description: "Server section entry for metadata-driven page headers.",
    capabilities: ["render", "compose", "navigate"],
    metadata: { sectionKind: "page-header" },
  },
  {
    id: "metadata-ui.renderer.list",
    kind: "renderer",
    runtime: "server",
    label: "List renderer",
    description: "Registered server renderer for list sections.",
    capabilities: ["render"],
    rendererId: "metadata-ui.renderer.list",
    metadata: { sectionKind: "list" },
  },
  {
    id: "metadata-ui.renderer.stat",
    kind: "renderer",
    runtime: "server",
    label: "Stat renderer",
    description: "Registered server renderer for stat sections.",
    capabilities: ["render"],
    rendererId: "metadata-ui.renderer.stat",
    metadata: { sectionKind: "stat" },
  },
  {
    id: "metadata-ui.renderer.chart",
    kind: "renderer",
    runtime: "server",
    label: "Chart renderer",
    description: "Registered server renderer for chart sections.",
    capabilities: ["render"],
    rendererId: "metadata-ui.renderer.chart",
    metadata: { sectionKind: "chart" },
  },
  {
    id: "metadata-ui.renderer.action-bar",
    kind: "renderer",
    runtime: "server",
    label: "Action bar renderer",
    description: "Registered server renderer for action-bar sections.",
    capabilities: ["render"],
    rendererId: "metadata-ui.renderer.action-bar",
    metadata: { sectionKind: "action-bar" },
  },
  {
    id: "metadata-ui.renderer.form",
    kind: "renderer",
    runtime: "server",
    label: "Form renderer",
    description: "Registered server renderer for form sections.",
    capabilities: ["render"],
    rendererId: "metadata-ui.renderer.form",
    metadata: { sectionKind: "form" },
  },
  {
    id: "metadata-ui.renderer.kanban",
    kind: "renderer",
    runtime: "server",
    label: "Kanban renderer",
    description: "Registered server renderer for kanban sections.",
    capabilities: ["render"],
    rendererId: "metadata-ui.renderer.kanban",
    metadata: { sectionKind: "kanban" },
  },
  {
    id: "metadata-ui.renderer.audit-panel",
    kind: "renderer",
    runtime: "server",
    label: "Audit panel renderer",
    description: "Registered server renderer for audit-panel sections.",
    capabilities: ["render"],
    rendererId: "metadata-ui.renderer.audit-panel",
    metadata: { sectionKind: "audit-panel" },
  },
  {
    id: "metadata-ui.renderer.detail-tabs",
    kind: "renderer",
    runtime: "server",
    label: "Detail tabs renderer",
    description: "Registered server renderer for detail-tabs sections.",
    capabilities: ["render"],
    rendererId: "metadata-ui.renderer.detail-tabs",
    metadata: { sectionKind: "detail-tabs" },
  },
  {
    id: "metadata-ui.renderer.page-header",
    kind: "renderer",
    runtime: "server",
    label: "Page header renderer",
    description: "Registered server renderer for page-header sections.",
    capabilities: ["render"],
    rendererId: "metadata-ui.renderer.page-header",
    metadata: { sectionKind: "page-header" },
  },
  {
    id: "metadata-ui.client.list-table",
    kind: "client-island",
    runtime: "client",
    label: "List table client island",
    description: "Client island for interactive list table behavior.",
    capabilities: ["interact"],
    metadata: { sectionKind: "list" },
  },
  {
    id: "metadata-ui.client.chart-body",
    kind: "client-island",
    runtime: "client",
    label: "Chart body client island",
    description: "Client island for chart body rendering.",
    capabilities: ["interact"],
    metadata: { sectionKind: "chart" },
  },
  {
    id: "metadata-ui.client.form",
    kind: "client-island",
    runtime: "client",
    label: "Form client island",
    description: "Client island for metadata-driven form interactions.",
    capabilities: ["interact", "submit"],
    metadata: { sectionKind: "form" },
  },
  {
    id: "metadata-ui.client.kanban-drag-board",
    kind: "client-island",
    runtime: "client",
    label: "Kanban drag board client island",
    description: "Client island for kanban drag interactions.",
    capabilities: ["interact"],
    metadata: { sectionKind: "kanban" },
  },
] as const);

export const METADATA_UI_COMPONENT_REGISTRY_BY_ID =
  Object.fromEntries(
    METADATA_UI_COMPONENT_REGISTRY.map((component) => [
      component.id,
      component,
    ]),
  ) as MetadataUiComponentRegistryById<
    typeof METADATA_UI_COMPONENT_REGISTRY
  >;

export type MetadataUiRegisteredComponentId =
  MetadataUiComponentRegistryIds<typeof METADATA_UI_COMPONENT_REGISTRY>;

export function getMetadataUiComponentById<
  Id extends MetadataUiRegisteredComponentId,
>(id: Id): MetadataUiComponentRegistryById<
  typeof METADATA_UI_COMPONENT_REGISTRY
>[Id] {
  return METADATA_UI_COMPONENT_REGISTRY_BY_ID[id];
}

export function getMetadataUiComponentsByKind<
  Kind extends MetadataUiComponentKind,
>(kind: Kind): MetadataUiComponentContractForKind<Kind>[] {
  return METADATA_UI_COMPONENT_REGISTRY.filter(
    (component) => component.kind === kind,
  ) as unknown as MetadataUiComponentContractForKind<Kind>[];
}

export function getMetadataUiComponentsByRuntime<
  Runtime extends MetadataUiComponentRuntime,
>(runtime: Runtime): MetadataUiComponentRegistryEntriesForRuntime<
  typeof METADATA_UI_COMPONENT_REGISTRY,
  Runtime
>[] {
  return METADATA_UI_COMPONENT_REGISTRY.filter(
    (
      component,
    ): component is MetadataUiComponentRegistryEntriesForRuntime<
      typeof METADATA_UI_COMPONENT_REGISTRY,
      Runtime
    > => component.runtime === runtime,
  );
}
