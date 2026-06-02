import {
  assertObjectStorageConfigured,
  createObjectStore,
} from "@afenda/object-storage/server";

/** Removes stored object bytes after registry validation — provider selected from env. */
export async function purgeTenantDocumentObjectCommand(input: {
  pathname: string;
  blobUrl?: string;
}): Promise<void> {
  const store = createObjectStore(assertObjectStorageConfigured());

  await store.deleteObject({
    pathname: input.pathname,
    blobUrl: input.blobUrl,
  });
}
