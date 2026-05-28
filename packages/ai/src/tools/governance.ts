import { AiPermissionError } from "../guardrails";
import type { GovernedToolMeta } from "./contracts";

export type GovernedToolAuditEvent = {
  toolName: string;
  meta: GovernedToolMeta;
  organizationId: string;
  userAuthId: string;
  input?: unknown;
  output?: unknown;
};

export type GovernedToolAuditLogger = (
  event: GovernedToolAuditEvent,
) => Promise<void> | void;

type ToolLike = {
  needsApproval?: boolean;
  execute?: (input: unknown, options?: unknown) => unknown;
};

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

function redactCredentialLikeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.slice(0, 20).map(redactCredentialLikeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        /(api[_-]?key|token|secret|password|credential)/i.test(key)
          ? "[redacted]"
          : redactCredentialLikeValue(entry),
      ]),
    );
  }

  if (typeof value === "string") {
    return value.length > 2_000 ? `${value.slice(0, 2_000)}...` : value;
  }

  return value;
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
              input: redactCredentialLikeValue(toolInput),
              output: redactCredentialLikeValue(output),
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
