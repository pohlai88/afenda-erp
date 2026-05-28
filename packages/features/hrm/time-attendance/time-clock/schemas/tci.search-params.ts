import {
  createLoader,
  createSerializer,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server"

import {
  TCI_WORKBENCH_BAND_VALUES,
  TCI_WORKBENCH_SEARCH_PARAMS,
} from "../tci-search-params.shared"

export const tciWorkbenchSearchParams = {
  [TCI_WORKBENCH_SEARCH_PARAMS.band]: parseAsStringLiteral(
    TCI_WORKBENCH_BAND_VALUES
  ),
  [TCI_WORKBENCH_SEARCH_PARAMS.focus]: parseAsString,
  [TCI_WORKBENCH_SEARCH_PARAMS.device]: parseAsString,
}

export const loadTciWorkbenchSearchParams = createLoader(
  tciWorkbenchSearchParams
)

export const serializeTciWorkbenchSearchParams = createSerializer(
  tciWorkbenchSearchParams
)

export type TciWorkbenchSearchParamsLoaded = Awaited<
  ReturnType<typeof loadTciWorkbenchSearchParams>
>
