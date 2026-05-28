export function formatFrmEmployeeLabel(input: {
  employeeNumber: string
  legalName: string
  preferredName: string | null
}): string {
  const name = input.preferredName?.trim() || input.legalName
  return `${input.employeeNumber} · ${name}`
}

export function formatFrmWorksiteLabel(input: {
  code: string
  name: string
}): string {
  return `${input.code} · ${input.name}`
}
