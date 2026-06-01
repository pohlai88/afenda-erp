export const __IDENTIFIER_CAMEL__RoutePaths = {
  hub: "__ROUTE_PATH__",
} as const;

export type __IDENTIFIER__RoutePath =
  (typeof __IDENTIFIER_CAMEL__RoutePaths)[keyof typeof __IDENTIFIER_CAMEL__RoutePaths];
