import type {
  MetadataUiPresentationAlignment,
  MetadataUiPresentationLayout,
  MetadataUiPresentationWidth,
} from "../contracts/presentation.contract";
import {
  resolveMetadataUiPresentation,
  type MetadataUiPresentationResolutionInput,
} from "./resolve-presentation.shared";

export type MetadataUiResolvedPresentationLayout =
  MetadataUiPresentationLayout;

export type MetadataUiResolvedPresentationAlignment =
  MetadataUiPresentationAlignment;

export type MetadataUiResolvedPresentationWidth = MetadataUiPresentationWidth;

export type MetadataUiResolvedPresentationLayoutIntent = Readonly<{
  layout: MetadataUiResolvedPresentationLayout;
  alignment: MetadataUiResolvedPresentationAlignment;
  width: MetadataUiResolvedPresentationWidth;
}>;

export function resolveMetadataUiPresentationLayout(
  input?: MetadataUiPresentationResolutionInput,
): MetadataUiResolvedPresentationLayoutIntent {
  return resolveMetadataUiPresentation(input).layout;
}
