import { z } from "zod"

export const listSurfaceToolbarParamSchema = z.string().trim().min(1)

export const listSurfaceToolbarExportSchema = z
  .object({
    actionId: z.string().trim().min(1),
    label: z.string().trim().min(1),
    formats: z.array(z.literal("csv")).min(1),
    /** Clicks this element id when export is a client-triggered download. */
    triggerElementId: z.string().trim().min(1).optional(),
  })
  .strict()

export const listSurfaceToolbarSearchSchema = z
  .object({
    param: listSurfaceToolbarParamSchema,
    label: z.string().trim().min(1),
    placeholder: z.string().trim().min(1).optional(),
    value: z.string().optional(),
  })
  .strict()

export const listSurfaceToolbarFilterOptionSchema = z
  .object({
    label: z.string().trim().min(1),
    value: z.string().trim().min(1),
    count: z.number().int().nonnegative().optional(),
  })
  .strict()

export const listSurfaceToolbarFilterSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    param: listSurfaceToolbarParamSchema,
    value: z.string().trim().min(1).optional(),
    options: z.array(listSurfaceToolbarFilterOptionSchema).min(1),
  })
  .strict()

export const listSurfaceToolbarSortOptionSchema = z
  .object({
    label: z.string().trim().min(1),
    value: z.string().trim().min(1),
    columnId: z.string().trim().min(1),
    direction: z.enum(["asc", "desc"]),
  })
  .strict()

export const listSurfaceToolbarSortSchema = z
  .object({
    label: z.string().trim().min(1),
    param: listSurfaceToolbarParamSchema,
    value: z.string().trim().min(1).optional(),
    options: z.array(listSurfaceToolbarSortOptionSchema).min(1),
  })
  .strict()

export const listSurfaceToolbarSavedViewSchema = z
  .object({
    label: z.string().trim().min(1),
    activeLabel: z.string().trim().min(1).optional(),
    href: z.string().trim().min(1).optional(),
    items: z
      .array(
        z
          .object({
            id: z.string().trim().min(1).optional(),
            label: z.string().trim().min(1),
            href: z.string().trim().min(1),
            active: z.boolean().optional(),
            icon: z.string().trim().min(1).nullable().optional(),
          })
          .strict()
      )
      .optional(),
  })
  .strict()

export const listSurfaceToolbarBulkActionSchema = z
  .object({
    actionId: z.string().trim().min(1),
    label: z.string().trim().min(1),
    disabledReason: z.string().trim().min(1).optional(),
  })
  .strict()

export const listSurfaceToolbarSchema = z
  .object({
    export: listSurfaceToolbarExportSchema.optional(),
    search: listSurfaceToolbarSearchSchema.optional(),
    filters: z.array(listSurfaceToolbarFilterSchema).optional(),
    sort: listSurfaceToolbarSortSchema.optional(),
    savedView: listSurfaceToolbarSavedViewSchema.optional(),
    bulkActions: z.array(listSurfaceToolbarBulkActionSchema).optional(),
    densityToggle: z.boolean().optional(),
    columnPicker: z.boolean().optional(),
    resetParams: z.array(listSurfaceToolbarParamSchema).optional(),
  })
  .strict()

export type ListSurfaceToolbarExport = z.infer<
  typeof listSurfaceToolbarExportSchema
>
export type ListSurfaceToolbarSearch = z.infer<
  typeof listSurfaceToolbarSearchSchema
>
export type ListSurfaceToolbarFilterOption = z.infer<
  typeof listSurfaceToolbarFilterOptionSchema
>
export type ListSurfaceToolbarFilter = z.infer<
  typeof listSurfaceToolbarFilterSchema
>
export type ListSurfaceToolbarSortOption = z.infer<
  typeof listSurfaceToolbarSortOptionSchema
>
export type ListSurfaceToolbarSort = z.infer<
  typeof listSurfaceToolbarSortSchema
>
export type ListSurfaceToolbarSavedView = z.infer<
  typeof listSurfaceToolbarSavedViewSchema
>
export type ListSurfaceToolbarSavedViewItem = NonNullable<
  ListSurfaceToolbarSavedView["items"]
>[number]
export type ListSurfaceToolbarBulkAction = z.infer<
  typeof listSurfaceToolbarBulkActionSchema
>
export type ListSurfaceToolbar = z.infer<typeof listSurfaceToolbarSchema>
