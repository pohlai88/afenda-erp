import { randomUUID } from "node:crypto";

export function createEntityId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
}
