export type ListSurfaceHeaderInput = {
  /** Renderer/column registry key. Keep stable and machine-friendly. */
  columnsId: string;
  /** Human-facing title. Defaults to columnsId only for early scaffold safety. */
  title?: string;
  eyebrow?: string;
  description?: string;
};

/**
 * List surface header contract.
 *
 * Do not force human title to equal columnsId forever. Registry parity should be
 * audited separately; UI copy should remain readable for operators.
 */
export function listSurfaceHeader(input: ListSurfaceHeaderInput) {
  return {
    columnsId: input.columnsId,
    title: input.title ?? input.columnsId,
    ...(input.eyebrow ? { eyebrow: input.eyebrow } : {}),
    ...(input.description ? { description: input.description } : {}),
  };
}
