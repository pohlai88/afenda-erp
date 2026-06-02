import {
  hrGeoUiCopy,
} from "@afenda/feature-hr-suite/metadata";
import {
  renderHrGeoPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrGeoUiCopy.page.title} — HR`,
  description: hrGeoUiCopy.page.description,
};

export default async function HrGeolocationRemoteCheckinPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrGeoPage(searchParams);
}
