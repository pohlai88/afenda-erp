import type { MetadataUiPresentationVisibilityState } from "../contracts/presentation.contract";
import {
  resolveMetadataUiPresentation,
  type MetadataUiPresentationResolutionInput,
} from "./resolve-presentation.shared";

export type MetadataUiResolvedPresentationVisibility =
  MetadataUiPresentationVisibilityState;

export function resolveMetadataUiPresentationVisibility(
  input?: MetadataUiPresentationResolutionInput,
): MetadataUiResolvedPresentationVisibility {
  return resolveMetadataUiPresentation(input).visibility;
}

export function shouldRenderMetadataUiPresentationHeader(
  input?: MetadataUiPresentationResolutionInput,
): boolean {
  return resolveMetadataUiPresentation(input).visibility.showHeader;
}

export function shouldRenderMetadataUiPresentationDescription(
  input?: MetadataUiPresentationResolutionInput,
): boolean {
  return resolveMetadataUiPresentation(input).visibility.showDescription;
}
