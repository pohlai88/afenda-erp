import type { ListSurfacePresentation } from "../schemas/list-surface-renderer.schema";
import type { StatCardDensity } from "../schemas/stat-card.schema";
import type {
  ListPresentationProfileId,
  StatPresentationProfileId,
} from "../schemas/presentation-profile.schema";

export type GovernedListPresentationProfileDefaults = ListSurfacePresentation;

export type GovernedStatPresentationProfileDefaults = {
  density: StatCardDensity;
};

export type GovernedListPresentationProfiles = Readonly<
  Record<ListPresentationProfileId, GovernedListPresentationProfileDefaults>
>;

export type GovernedStatPresentationProfiles = Readonly<
  Record<StatPresentationProfileId, GovernedStatPresentationProfileDefaults>
>;
