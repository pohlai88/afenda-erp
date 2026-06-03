/**
 * Neon Auth UI styles — import exactly one path in the ERP app.
 * @see https://neon.com/docs/auth/reference/ui-components#styling
 */
/** Tailwind CSS v4 — append to `apps/erp` globals after `@import 'tailwindcss'` */
export const neonAuthUiTailwindStylesheet = "@neondatabase/auth-ui/tailwind" as const;

/** Non-Tailwind projects — pre-built bundle (~47KB minified) */
export const neonAuthUiBundledStylesheet = "@neondatabase/auth-ui/css" as const;
