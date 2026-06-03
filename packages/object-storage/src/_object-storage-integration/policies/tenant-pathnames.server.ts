import "server-only";

import { randomUUID } from "node:crypto";

/** Collision-safe key suffix (mirrors Vercel Blob `addRandomSuffix`). */
export function addRandomPathSuffix(pathname: string) {
  const lastSlash = pathname.lastIndexOf("/");
  const directory = lastSlash >= 0 ? pathname.slice(0, lastSlash + 1) : "";
  const filename = lastSlash >= 0 ? pathname.slice(lastSlash + 1) : pathname;
  const dotIndex = filename.lastIndexOf(".");
  const suffix = randomUUID().slice(0, 8);

  if (dotIndex > 0) {
    return `${directory}${filename.slice(0, dotIndex)}-${suffix}${filename.slice(dotIndex)}`;
  }

  return `${directory}${filename}-${suffix}`;
}

