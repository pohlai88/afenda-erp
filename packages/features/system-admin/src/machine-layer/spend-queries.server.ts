import "server-only";

import { listAiUsageEvents } from "@afenda/db";

export type TenantAiSpendEntry = {
  model: string;
  feature: string;
  totalCost: string;
  totalTokens: string;
};

export async function getTenantAiSpendEntries(input: {
  organizationId: string;
  limit?: number;
}): Promise<readonly TenantAiSpendEntry[]> {
  const events = await listAiUsageEvents({
    organizationId: input.organizationId,
    limit: input.limit ?? 500,
  });

  const grouped = new Map<
    string,
    { model: string; feature: string; totalTokens: number; requestCount: number }
  >();

  for (const event of events) {
    const key = `${event.model}:${event.feature}`;
    const current = grouped.get(key) ?? {
      model: event.model,
      feature: event.feature,
      totalTokens: 0,
      requestCount: 0,
    };
    grouped.set(key, {
      ...current,
      totalTokens: current.totalTokens + event.totalTokens,
      requestCount: current.requestCount + 1,
    });
  }

  return [...grouped.values()]
    .sort((left, right) => right.totalTokens - left.totalTokens)
    .map((entry) => ({
      model: entry.model,
      feature: entry.feature,
      totalCost: "-",
      totalTokens: String(entry.totalTokens),
    }));
}
