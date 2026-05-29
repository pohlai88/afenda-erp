export type UcbSeniorityRankInput = {
  membershipId: string
  employeeId: string
  employeeLabel: string
  seniorityDate: string
  departmentRef?: string | null
  roleRef?: string | null
  locationRef?: string | null
}

export function rankUcbSeniorityProfiles(
  profiles: readonly UcbSeniorityRankInput[],
  tieBreakRule: "seniority_date_asc" | "seniority_date_desc" = "seniority_date_asc"
): Array<UcbSeniorityRankInput & { rank: number }> {
  const sorted = [...profiles].sort((a, b) => {
    const cmp = a.seniorityDate.localeCompare(b.seniorityDate)
    return tieBreakRule === "seniority_date_asc" ? cmp : -cmp
  })
  return sorted.map((row, index) => ({ ...row, rank: index + 1 }))
}
