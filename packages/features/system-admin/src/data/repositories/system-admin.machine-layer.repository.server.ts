import { listAiUsageEvents as listAiUsageEventsFromDb } from "@afenda/db";

export function listAiUsageEvents(
  input: Parameters<typeof listAiUsageEventsFromDb>[0],
) {
  return listAiUsageEventsFromDb(input);
}
