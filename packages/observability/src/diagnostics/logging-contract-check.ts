export function hasStructuredLogEvent(input: unknown) {
  return (
    typeof input === "object" &&
    input !== null &&
    "event" in input &&
    typeof (input as { event?: unknown }).event === "string"
  );
}
