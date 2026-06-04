import type { MetadataUiPresentationDensity } from "../contracts/presentation.contract";
import {
  resolveMetadataUiPresentation,
  type MetadataUiPresentationResolutionInput,
} from "./resolve-presentation.shared";

export type MetadataUiResolvedPresentationDensity =
  MetadataUiPresentationDensity;

export function resolveMetadataUiPresentationDensity(
  input?: MetadataUiPresentationResolutionInput,
): MetadataUiResolvedPresentationDensity {
  return resolveMetadataUiPresentation(input).chrome.density;
}
