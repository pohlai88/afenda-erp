import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { hrDocumentsRoutePaths } from "../contracts/hr.workforce.documents-route.contract";
import { toDocumentsActionFailure } from "../data/hr.workforce.documents-action-result.shared";

const DOCUMENTS_REVALIDATE_PATH = hrDocumentsRoutePaths.documents;

export { toDocumentsActionFailure } from "../data/hr.workforce.documents-action-result.shared";

export async function finalizeDocumentsMutation(
  mutate: () => Promise<void>,
): Promise<ActionResult> {
  try {
    await mutate();
  } catch (error) {
    return toDocumentsActionFailure(error);
  }

  revalidatePath(DOCUMENTS_REVALIDATE_PATH);
  return actionSuccess(undefined);
}
