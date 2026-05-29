/** Crash on unexpected derivation output instead of silently coercing with `as`. */
export function toEnumMember<T extends string>(
  value: string,
  allowed: readonly T[],
  domain: string,
): T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`Unexpected ${domain} derivation result: ${value}`);
  }

  return value as T;
}
