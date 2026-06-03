import type { GovernedToolAuditLogger } from "./ai-governed-tool.event";
import { AiPermissionError } from "./ai-guardrails.policy";
import type { GovernedToolMeta } from "./ai-tools.contract";

type ToolLike = {
  needsApproval?: boolean;
  execute?: (input: unknown, options?: unknown) => unknown;
};

export type GovernedToolAuditRedactionOptions = {
  maxArrayItems?: number;
  maxDepth?: number;
  maxObjectKeys?: number;
  maxStringLength?: number;
};

const defaultAuditRedactionOptions = {
  maxArrayItems: 20,
  maxDepth: 6,
  maxObjectKeys: 40,
  maxStringLength: 2_000,
} satisfies Required<GovernedToolAuditRedactionOptions>;

function isCredentialLikeKey(key: string): boolean {
  return /(api[_-]?key|authorization|client[_-]?secret|cookie|credential|password|private[_-]?key|secret|token)/i.test(
    key,
  );
}

export function assertGovernedToolPolicy(input: {
  toolName: string;
  tool: unknown;
  meta: GovernedToolMeta | undefined;
  capabilities: readonly string[];
  highSensitivityCapability?: string;
}): void {
  if (!input.meta) {
    throw new Error(`Missing GovernedToolMeta for tool: ${input.toolName}.`);
  }

  if (
    input.meta.access === "write" &&
    !(input.tool as ToolLike).needsApproval
  ) {
    throw new Error(
      `Governed write tool ${input.toolName} must require approval.`,
    );
  }

  if (input.meta.dataSensitivity === "high") {
    const capability = input.highSensitivityCapability ?? "system-admin.view";
    if (!input.capabilities.includes(capability)) {
      throw new AiPermissionError(capability);
    }
  }
}

export function assertGovernedToolset(input: {
  tools: Record<string, unknown>;
  meta: Record<string, GovernedToolMeta>;
  capabilities: readonly string[];
  highSensitivityCapability?: string;
}): void {
  for (const [toolName, toolValue] of Object.entries(input.tools)) {
    assertGovernedToolPolicy({
      toolName,
      tool: toolValue,
      meta: input.meta[toolName],
      capabilities: input.capabilities,
      highSensitivityCapability: input.highSensitivityCapability,
    });
  }
}

export async function recordGovernedToolAudit(input: {
  logger?: GovernedToolAuditLogger;
  toolName: string;
  meta: GovernedToolMeta;
  organizationId: string;
  userAuthId: string;
  input?: unknown;
  output?: unknown;
}): Promise<void> {
  if (input.meta.audit !== "record" || !input.logger) {
    return;
  }

  await input.logger({
    toolName: input.toolName,
    meta: input.meta,
    organizationId: input.organizationId,
    userAuthId: input.userAuthId,
    input: input.input,
    output: input.output,
  });
}

function redactAuditValue(
  value: unknown,
  options: Required<GovernedToolAuditRedactionOptions>,
  seen: WeakSet<object>,
  depth: number,
): unknown {
  if (typeof value === "string") {
    return value.length > options.maxStringLength
      ? `${value.slice(0, options.maxStringLength)}...[truncated]`
      : value;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[circular]";
  }

  if (depth >= options.maxDepth) {
    return "[truncated-depth]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    const entries = value
      .slice(0, options.maxArrayItems)
      .map((entry) => redactAuditValue(entry, options, seen, depth + 1));

    if (value.length > options.maxArrayItems) {
      entries.push(
        `[truncated-array:${value.length - options.maxArrayItems}]`,
      );
    }

    return entries;
  }

  const objectEntries = Object.entries(value as Record<string, unknown>);
  const redactedEntries: Array<[string, unknown]> = objectEntries
    .slice(0, options.maxObjectKeys)
    .map(([key, entry]) => [
      key,
      isCredentialLikeKey(key)
        ? "[redacted]"
        : redactAuditValue(entry, options, seen, depth + 1),
    ]);

  if (objectEntries.length > options.maxObjectKeys) {
    redactedEntries.push([
      "__truncatedKeys",
      objectEntries.length - options.maxObjectKeys,
    ]);
  }

  return Object.fromEntries(redactedEntries);
}

export function redactGovernedToolAuditValue(
  value: unknown,
  options: GovernedToolAuditRedactionOptions = {},
): unknown {
  return redactAuditValue(
    value,
    {
      ...defaultAuditRedactionOptions,
      ...options,
    },
    new WeakSet(),
    0,
  );
}

export function wrapGovernedToolset<
  TTools extends Record<string, unknown>,
>(input: {
  tools: TTools;
  meta: Record<string, GovernedToolMeta>;
  capabilities: readonly string[];
  organizationId: string;
  userAuthId: string;
  logger?: GovernedToolAuditLogger;
  highSensitivityCapability?: string;
}): TTools {
  return Object.fromEntries(
    Object.entries(input.tools).map(([toolName, toolValue]) => {
      assertGovernedToolPolicy({
        toolName,
        tool: toolValue,
        meta: input.meta[toolName],
        capabilities: input.capabilities,
        highSensitivityCapability: input.highSensitivityCapability,
      });

      const toolRecord = toolValue as ToolLike;
      if (typeof toolRecord.execute !== "function") {
        return [toolName, toolValue];
      }

      const meta = input.meta[toolName]!;
      return [
        toolName,
        {
          ...(toolValue as Record<string, unknown>),
          execute: async (toolInput: unknown, options?: unknown) => {
            assertGovernedToolPolicy({
              toolName,
              tool: toolValue,
              meta,
              capabilities: input.capabilities,
              highSensitivityCapability: input.highSensitivityCapability,
            });

            const output = await toolRecord.execute!(toolInput, options);
            await recordGovernedToolAudit({
              logger: input.logger,
              toolName,
              meta,
              organizationId: input.organizationId,
              userAuthId: input.userAuthId,
              input: redactGovernedToolAuditValue(toolInput),
              output: redactGovernedToolAuditValue(output),
            });
            return output;
          },
        },
      ];
    }),
  ) as TTools;
}

export function createGovernedToolRegistry<
  TTools extends Record<string, unknown>,
>(input: {
  tools: TTools;
  meta: Record<string, GovernedToolMeta>;
  capabilities: readonly string[];
  organizationId: string;
  userAuthId: string;
  logger?: GovernedToolAuditLogger;
  highSensitivityCapability?: string;
}) {
  return {
    tools: wrapGovernedToolset(input),
    meta: input.meta,
  };
}
