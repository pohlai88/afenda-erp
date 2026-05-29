/**
 * Indonesia national holidays and collective leave — 2026.
 *
 * Source: SKB 3 Menteri 2026 national holiday and collective leave schedule.
 * Rule-pack version: ID-HOLIDAY-2026
 */

export const HOLIDAYS_ID_2026_CODE = "ID-HOLIDAY-2026" as const

const ID_2026: readonly { readonly date: string; readonly nameKey: string }[] =
  [
    { date: "2026-01-01", nameKey: "Erp.Hrm.rulePackId.holidayNewYear" },
    {
      date: "2026-01-16",
      nameKey: "Erp.Hrm.rulePackId.holidayIsraMiraj",
    },
    {
      date: "2026-02-17",
      nameKey: "Erp.Hrm.rulePackId.holidayChineseNewYear",
    },
    { date: "2026-03-19", nameKey: "Erp.Hrm.rulePackId.holidayNyepi" },
    { date: "2026-03-21", nameKey: "Erp.Hrm.rulePackId.holidayEidFitr" },
    {
      date: "2026-03-22",
      nameKey: "Erp.Hrm.rulePackId.holidayEidFitrSecondDay",
    },
    {
      date: "2026-04-03",
      nameKey: "Erp.Hrm.rulePackId.holidayGoodFriday",
    },
    { date: "2026-04-05", nameKey: "Erp.Hrm.rulePackId.holidayEaster" },
    { date: "2026-05-01", nameKey: "Erp.Hrm.rulePackId.holidayLabour" },
    {
      date: "2026-05-14",
      nameKey: "Erp.Hrm.rulePackId.holidayAscension",
    },
    { date: "2026-05-27", nameKey: "Erp.Hrm.rulePackId.holidayEidAdha" },
    { date: "2026-05-31", nameKey: "Erp.Hrm.rulePackId.holidayVesak" },
    {
      date: "2026-06-01",
      nameKey: "Erp.Hrm.rulePackId.holidayPancasila",
    },
    {
      date: "2026-06-16",
      nameKey: "Erp.Hrm.rulePackId.holidayIslamicNewYear",
    },
    {
      date: "2026-08-17",
      nameKey: "Erp.Hrm.rulePackId.holidayIndependence",
    },
    { date: "2026-08-25", nameKey: "Erp.Hrm.rulePackId.holidayMawlid" },
    {
      date: "2026-12-25",
      nameKey: "Erp.Hrm.rulePackId.holidayChristmas",
    },
  ]

export function getIndonesiaHolidaysV2026(
  year: number,
  _provinceCodes: readonly string[]
): readonly { readonly date: string; readonly nameKey: string }[] {
  if (year !== 2026) return []
  return ID_2026
}
