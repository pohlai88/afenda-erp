"use client"

import { useEffect } from "react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { parseAsStringLiteral, useQueryState } from "nuqs"

import {
  TCI_WORKBENCH_BAND_VALUES,
  TCI_WORKBENCH_SEARCH_PARAMS,
} from "../tci-search-params.shared"

function TimeClockBandFocusInner() {
  const [band] = useQueryState(
    TCI_WORKBENCH_SEARCH_PARAMS.band,
    parseAsStringLiteral([...TCI_WORKBENCH_BAND_VALUES])
  )

  useEffect(() => {
    if (!band) return
    const target = document.getElementById(`time-clock-${band}`)
    target?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [band])

  return null
}

/**
 * Scrolls to the TCI band section when `?band=` is present (bookmarkable ops state).
 * Scoped `NuqsAdapter` keeps nuqs off the global org layout.
 */
export function TimeClockBandFocusClient() {
  return (
    <NuqsAdapter>
      <TimeClockBandFocusInner />
    </NuqsAdapter>
  )
}
