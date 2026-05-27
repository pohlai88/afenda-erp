/** List surface header: `title` must match `columnsId` for renderer registry parity. */
export function listSurfaceHeader(columnsId: string) {
  return { title: columnsId };
}
