export const UCB_LIST_SURFACE_IDS = {
  unions: "hrm:ucb:unions",
  agreements: "hrm:ucb:agreements",
  memberships: "hrm:ucb:memberships",
  cbaRules: "hrm:ucb:cba-rules",
  seniority: "hrm:ucb:seniority",
  compliance: "hrm:ucb:compliance",
  dues: "hrm:ucb:dues",
  grievances: "hrm:ucb:grievances",
  representatives: "hrm:ucb:representatives",
  meetings: "hrm:ucb:lr-meetings",
  reports: "hrm:ucb:reports",
} as const

export type UcbListSurfaceId =
  (typeof UCB_LIST_SURFACE_IDS)[keyof typeof UCB_LIST_SURFACE_IDS]

export const UCB_STAT_SURFACE_KEY = "hrm:ucb:overview" as const
