import {
  linkHrCsfDevelopmentResourceInTx,
  listHrCsfDevelopmentLinksForRecommendation,
  listHrCsfDevelopmentRecommendationsForGap,
} from "@afenda/db";
import type { AfendaTransaction } from "@afenda/db";

export {
  linkHrCsfDevelopmentResourceInTx,
  listHrCsfDevelopmentLinksForRecommendation,
  listHrCsfDevelopmentRecommendationsForGap,
};

export async function linkGapDevelopmentResource(
  db: AfendaTransaction,
  input: Parameters<typeof linkHrCsfDevelopmentResourceInTx>[1],
) {
  return linkHrCsfDevelopmentResourceInTx(db, input);
}
