export function decodeWindowOffset(cursor: string | undefined) {
  if (!cursor) {
    return 0;
  }

  const match = /^offset:(\d+)$/.exec(cursor);
  if (!match) {
    return 0;
  }

  return Number(match[1]);
}

export function encodeWindowOffset(offset: number) {
  return `offset:${offset}`;
}
