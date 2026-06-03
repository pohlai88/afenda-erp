export const hrExpenseRoutePaths = {
  hub: "/hr",
  expenses: "/hr/expenses",
} as const;

export type HrExpenseRoutePath =
  (typeof hrExpenseRoutePaths)[keyof typeof hrExpenseRoutePaths];
