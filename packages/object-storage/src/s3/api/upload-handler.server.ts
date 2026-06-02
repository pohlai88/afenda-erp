/** S3 presign/complete uses the same handler shape as R2 (SSE-KMS on presign). */
export { handleR2UploadPost as handleS3UploadPost } from "../../r2/api/upload-handler.server";
