import type { ListSurfaceToolbar } from "./schemas/list-surface-toolbar.schema"

const LOCAL_URL_BASE = "http://localhost"

export const DEFAULT_GOVERNED_LIST_TOOLBAR_RESET_PARAMS = [
  "page",
  "cursor",
] as const

export type GovernedListSavedViewSource = {
  readonly id: string
  readonly label: string
  readonly href: string
  readonly icon?: string | null
}

export type GovernedListSavedViewItem = {
  readonly id?: string
  readonly label: string
  readonly href: string
  readonly active?: boolean
  readonly icon?: string | null
}

function toLocalUrl(href: string): URL {
  return new URL(href || "/", LOCAL_URL_BASE)
}

function serializeLocalUrl(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`
}

function normalizeHash(hash: string | null | undefined): string {
  if (!hash) return ""
  const trimmed = hash.trim()
  if (!trimmed) return ""
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`
}

function uniqueParams(
  params: readonly (string | null | undefined)[]
): string[] {
  return Array.from(
    new Set(params.map((param) => param?.trim()).filter(Boolean) as string[])
  )
}

export function governedListToolbarOwnedParams(
  toolbar: ListSurfaceToolbar | undefined
): string[] {
  if (!toolbar) return []
  return uniqueParams([
    toolbar.search?.param,
    ...(toolbar.filters ?? []).map((filter) => filter.param),
    toolbar.sort?.param,
  ])
}

export function governedListToolbarResetParams(
  toolbar: ListSurfaceToolbar | undefined
): string[] {
  return uniqueParams([
    ...DEFAULT_GOVERNED_LIST_TOOLBAR_RESET_PARAMS,
    ...(toolbar?.resetParams ?? []),
  ])
}

export function buildGovernedListToolbarParamHref(input: {
  readonly currentHref: string
  readonly param: string
  readonly value: string | null | undefined
  readonly resetParams?: readonly string[]
}): string {
  const url = toLocalUrl(input.currentHref)
  const next = input.value?.trim() ?? ""

  if (next) {
    url.searchParams.set(input.param, next)
  } else {
    url.searchParams.delete(input.param)
  }

  for (const param of uniqueParams(input.resetParams ?? [])) {
    if (param !== input.param) {
      url.searchParams.delete(param)
    }
  }

  return serializeLocalUrl(url)
}

export function buildGovernedListToolbarClearHref(input: {
  readonly currentHref: string
  readonly ownedParams: readonly string[]
  readonly resetParams?: readonly string[]
}): string {
  const url = toLocalUrl(input.currentHref)

  for (const param of uniqueParams([
    ...input.ownedParams,
    ...(input.resetParams ?? []),
  ])) {
    url.searchParams.delete(param)
  }

  return serializeLocalUrl(url)
}

export function buildGovernedListToolbarCanonicalHref(input: {
  readonly currentHref: string
  readonly ownedParams: readonly string[]
  readonly hash?: string | null
}): string {
  const url = toLocalUrl(input.currentHref)
  const owned = uniqueParams(input.ownedParams).sort()
  const nextSearch = new URLSearchParams()

  for (const param of owned) {
    const values = url.searchParams
      .getAll(param)
      .map((value) => value.trim())
      .filter(Boolean)
      .sort()

    for (const value of values) {
      nextSearch.append(param, value)
    }
  }

  url.search = nextSearch.toString()
  if (input.hash !== undefined) {
    url.hash = normalizeHash(input.hash)
  }

  return serializeLocalUrl(url)
}

export function buildGovernedListToolbarSavedViewItems(input: {
  readonly views: readonly GovernedListSavedViewSource[]
  readonly currentHref: string
  readonly ownedParams: readonly string[]
  readonly sectionHash?: string | null
}): GovernedListSavedViewItem[] {
  const sectionHash = normalizeHash(input.sectionHash)
  const currentCanonical = buildGovernedListToolbarCanonicalHref({
    currentHref: input.currentHref,
    ownedParams: input.ownedParams,
    ...(sectionHash ? { hash: sectionHash } : {}),
  })
  const currentUrl = toLocalUrl(currentCanonical)

  return input.views
    .filter((view) => {
      const viewUrl = toLocalUrl(view.href)
      if (viewUrl.pathname !== currentUrl.pathname) return false
      if (sectionHash && viewUrl.hash !== sectionHash) return false
      return true
    })
    .map((view) => {
      const canonical = buildGovernedListToolbarCanonicalHref({
        currentHref: view.href,
        ownedParams: input.ownedParams,
      })
      return {
        id: view.id,
        label: view.label,
        href: canonical,
        active: canonical === currentCanonical,
        icon: view.icon ?? null,
      }
    })
}
