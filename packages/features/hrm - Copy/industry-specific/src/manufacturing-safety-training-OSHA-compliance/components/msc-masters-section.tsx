import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import {
  buildMscMachinesListSurfaceConfiguration,
  buildMscSitesListSurfaceConfiguration,
} from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type {
  MscMachineRow,
  MscSiteChoiceRow,
  MscSiteMasterRow,
} from "../data/msc.types.shared"
import { MscMachineCreateDialog } from "./msc-machine-create-dialog.client"
import { MscSiteCreateDialog } from "./msc-site-create-dialog.client"

export async function MscMastersSection({
  sites,
  siteMasters,
  machines,
  canManage,
  parentAccessAllowed = true,
}: {
  sites: readonly MscSiteChoiceRow[]
  siteMasters: readonly MscSiteMasterRow[]
  machines: readonly MscMachineRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const sitesConfiguration = buildMscSitesListSurfaceConfiguration(
    siteMasters,
    {
      empty: t("sitesEmpty"),
      colCode: t("fieldSiteCode"),
      colName: t("fieldSiteName"),
      colCountry: t("fieldCountry"),
      colOsha: t("fieldOshaRecordkeeping"),
      yesNo: (value) => (value ? t("yes") : t("no")),
      notRecorded: t("notRecorded"),
    }
  )

  const machinesConfiguration = buildMscMachinesListSurfaceConfiguration(
    machines,
    {
      empty: t("machinesEmpty"),
      colCode: t("fieldMachineCode"),
      colName: t("fieldMachineName"),
      colSite: t("colSite"),
      notRecorded: t("notRecorded"),
    }
  )

  return (
    <Card size="sm" id="msc-masters-section" data-testid="msc-masters-section">
      <CardHeader>
        <CardTitle>{t("mastersTitle")}</CardTitle>
        <CardDescription>{t("mastersDescription")}</CardDescription>
        {canManage ? (
          <CardAction className="flex flex-wrap items-center justify-end gap-2">
            <MscSiteCreateDialog />
            <MscMachineCreateDialog sites={sites} />
          </CardAction>
        ) : null}
      </CardHeader>
      <div className="flex flex-col gap-6 px-6 pb-6">
        <GovernedPatternCListSection
          layout="embedded"
          title={t("sitesTitle")}
          description={t("sitesDescription")}
          surfaceKey={MSC_LIST_SURFACE_IDS.sites}
          listConfiguration={sitesConfiguration}
          parentAccessAllowed={parentAccessAllowed}
        />
        <GovernedPatternCListSection
          layout="embedded"
          title={t("machinesTitle")}
          description={t("machinesDescription")}
          surfaceKey={MSC_LIST_SURFACE_IDS.machines}
          listConfiguration={machinesConfiguration}
          parentAccessAllowed={parentAccessAllowed}
        />
      </div>
    </Card>
  )
}
