export const __IDENTIFIER_CAMEL__AuditActions = {
  scaffoldViewed: "__DOMAIN_KEY__.scaffold.viewed",
} as const;

export type __IDENTIFIER__AuditAction =
  (typeof __IDENTIFIER_CAMEL__AuditActions)[keyof typeof __IDENTIFIER_CAMEL__AuditActions];
