import { z } from "zod";

const contentIdSchema = z
  .string()
  .min(2)
  .regex(/^[a-z][a-z0-9-]*$/);

const nonEmptyTextSchema = z.string().trim().min(1);

const moduleStatusSchema = z.enum(["coverage", "planned", "hidden"]);

const commandMapNodeRoleSchema = z.enum([
  "source",
  "truth-engine",
  "decision-operator",
  "control",
]);

const commandMapLaneSchema = z.enum([
  "modules",
  "evidence",
  "lynx",
  "operator",
  "approval",
  "audit",
]);

const uniqueById = <T extends { id: string }>(
  items: readonly T[],
  context: z.RefinementCtx,
  path: string,
) => {
  const seen = new Set<string>();

  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate ${path} id: ${item.id}`,
        path: [path, index, "id"],
      });
    }

    seen.add(item.id);
  });
};

export const erpTruthHeroClaimSchema = z.object({
  eyebrow: nonEmptyTextSchema,
  headlineLines: z.array(nonEmptyTextSchema).min(2),
  supportingCopy: nonEmptyTextSchema,
  differentiation: nonEmptyTextSchema,
});

export const erpTruthFeaturePanelSchema = z.object({
  id: contentIdSchema,
  title: nonEmptyTextSchema,
  purpose: nonEmptyTextSchema,
  bullets: z.array(nonEmptyTextSchema).min(3),
});

export const erpTruthCommandMapNodeSchema = z.object({
  id: contentIdSchema,
  label: nonEmptyTextSchema,
  role: commandMapNodeRoleSchema,
  lane: commandMapLaneSchema,
  status: moduleStatusSchema,
});

export const erpTruthCommandMapSchema = z
  .object({
    heading: nonEmptyTextSchema,
    flow: z.array(nonEmptyTextSchema).min(4),
    nodes: z.array(erpTruthCommandMapNodeSchema).min(5),
  })
  .superRefine((commandMap, context) => {
    uniqueById(commandMap.nodes, context, "nodes");
  });

export const erpTruthCoverageItemSchema = z.object({
  id: contentIdSchema,
  label: nonEmptyTextSchema,
  status: moduleStatusSchema,
});

export const erpTruthCoverageGroupSchema = z
  .object({
    id: contentIdSchema,
    title: nonEmptyTextSchema,
    modules: z.array(erpTruthCoverageItemSchema).min(1),
  })
  .superRefine((group, context) => {
    uniqueById(group.modules, context, "modules");
  });

export const erpTruthSectionContentSchema = z
  .object({
    heroClaim: erpTruthHeroClaimSchema,
    featurePanels: z.array(erpTruthFeaturePanelSchema).length(2),
    commandMap: erpTruthCommandMapSchema,
    coverageGroups: z.array(erpTruthCoverageGroupSchema).min(1),
    closingStatement: nonEmptyTextSchema,
  })
  .superRefine((content, context) => {
    uniqueById(content.featurePanels, context, "featurePanels");
    uniqueById(content.coverageGroups, context, "coverageGroups");
  });

export type ErpTruthModuleStatus = z.infer<typeof moduleStatusSchema>;
export type ErpTruthHeroClaim = z.infer<typeof erpTruthHeroClaimSchema>;
export type ErpTruthFeaturePanel = z.infer<typeof erpTruthFeaturePanelSchema>;
export type ErpTruthCommandMapNode = z.infer<
  typeof erpTruthCommandMapNodeSchema
>;
export type ErpTruthCommandMap = z.infer<typeof erpTruthCommandMapSchema>;
export type ErpTruthCoverageItem = z.infer<typeof erpTruthCoverageItemSchema>;
export type ErpTruthCoverageGroup = z.infer<
  typeof erpTruthCoverageGroupSchema
>;
export type ErpTruthSectionContent = z.infer<
  typeof erpTruthSectionContentSchema
>;
