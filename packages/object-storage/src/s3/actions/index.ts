/**
 * Re-export S3 upload handler — presign/complete mirrors R2 with SSE-KMS PutObject.
 */
export { handleS3UploadPost } from "../api/upload-handler.server";
