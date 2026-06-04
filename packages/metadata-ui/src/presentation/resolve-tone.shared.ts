import type {
  MetadataUiPresentationEmphasis,
  MetadataUiPresentationTone,
} from "../contracts/presentation.contract";
import {
  resolveMetadataUiPresentation,
  type MetadataUiPresentationResolutionInput,
} from "./resolve-presentation.shared";

export type MetadataUiResolvedPresentationTone = MetadataUiPresentationTone;

export type MetadataUiResolvedPresentationEmphasis =
  MetadataUiPresentationEmphasis;

export function resolveMetadataUiPresentationTone(
  input?: MetadataUiPresentationResolutionInput,
): MetadataUiResolvedPresentationTone {
  return resolveMetadataUiPresentation(input).chrome.tone;
}

export function resolveMetadataUiPresentationEmphasis(
  input?: MetadataUiPresentationResolutionInput,
): MetadataUiResolvedPresentationEmphasis {
  return resolveMetadataUiPresentation(input).chrome.emphasis;
}
