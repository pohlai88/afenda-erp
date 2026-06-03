export type ListSurfaceHeaderInput = {
  /** Stable registry id used by the renderer / columns registry. */
  columnsId: string;
  /** Human-readable title. Defaults to columnsId only as a safe fallback. */
  title?: string;
  eyebrow?: string;
  description?: string;
};

export function listSurfaceHeader(input: string | ListSurfaceHeaderInput) {
  if (typeof input === "string") {
    return { title: input };
  }
  return {
    title: input.title ?? input.columnsId,
    ...(input.eyebrow ? { eyebrow: input.eyebrow } : {}),
    ...(input.description ? { description: input.description } : {}),
  };
}
