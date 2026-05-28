import { getTranslations } from "next-intl/server"

import { ModulePageHeader } from "@afenda/governed-surface/server"

import { loadSalaryBenchmarkingPageData } from "../data/salary-benchmarking-page.server"

import {
  SalaryBenchmarkAnalysisSection,
  SalaryBenchmarkMappingsSection,
  SalaryBenchmarkMarketDataSection,
  SalaryBenchmarkPayEquitySection,
  SalaryBenchmarkSurveySection,
} from "./salary-benchmarking-sections"

export async function SalaryBenchmarkingPage({ orgSlug }: { orgSlug: string }) {
  const t = await getTranslations("Erp.Hrm.salaryBenchmarking")
  const { surveys, marketRows, mappings, analyses, payEquityGroups } =
    await loadSalaryBenchmarkingPageData()

  return (
    <div className="flex flex-col gap-6 p-6">
      <ModulePageHeader
        eyebrow={t("eyebrow")}
        title={t("pageTitle")}
        description={t("pageDescription")}
      />
      <SalaryBenchmarkSurveySection rows={surveys} />
      <SalaryBenchmarkMarketDataSection rows={marketRows} />
      <SalaryBenchmarkMappingsSection rows={mappings} />
      <SalaryBenchmarkAnalysisSection orgSlug={orgSlug} rows={analyses} />
      <SalaryBenchmarkPayEquitySection rows={payEquityGroups} />
    </div>
  )
}
