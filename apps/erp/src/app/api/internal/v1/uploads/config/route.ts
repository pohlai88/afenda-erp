import { NextResponse } from "next/server";
import { handleObjectStorageUploadConfigGet } from "@afenda/object-storage/server";

export async function GET(request: Request): Promise<NextResponse> {
  const result = await handleObjectStorageUploadConfigGet(request);
  return NextResponse.json(result.body, { status: result.status });
}
