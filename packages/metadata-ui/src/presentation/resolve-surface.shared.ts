import type { MetadataUiPresentationSurface } from "../contracts/presentation.contract";
import {
  resolveMetadataUiPresentation,
  type MetadataUiPresentationResolutionInput,
} from "./resolve-presentation.shared";

export type MetadataUiResolvedPresentationSurface =
  MetadataUiPresentationSurface;

export function resolveMetadataUiPresentationSurface(
  input?: MetadataUiPresentationResolutionInput,
): MetadataUiResolvedPresentationSurface {
  return resolveMetadataUiPresentation(input).chrome.surface;
}

export function shouldRenderMetadataUiPresentationChrome(
  input?: MetadataUiPresentationResolutionInput,
): boolean {
  const presentation = resolveMetadataUiPresentation(input);
  const surface = presentation.chrome.surface;

  return (
    presentation.visibility.showChrome &&
    surface !== "plain" &&
    surface !== "embedded"
  );
}
