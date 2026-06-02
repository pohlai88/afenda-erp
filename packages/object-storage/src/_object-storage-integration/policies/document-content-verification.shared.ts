import { documentUploadContentTypes } from "./document-upload-policy.shared";

const MAGIC_BYTE_PREFIX_BYTES = 16;

type MagicSignature = {
  contentType: (typeof documentUploadContentTypes)[number];
  matches: (bytes: Uint8Array) => boolean;
};

const magicSignatures: readonly MagicSignature[] = [
  {
    contentType: "application/pdf",
    matches: (bytes) =>
      bytes.length >= 4 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46,
  },
  {
    contentType: "image/png",
    matches: (bytes) =>
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  {
    contentType: "image/jpeg",
    matches: (bytes) =>
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff,
  },
  {
    contentType: "image/webp",
    matches: (bytes) =>
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
];

export const documentMagicBytePrefixBytes = MAGIC_BYTE_PREFIX_BYTES;

export function detectContentTypeFromMagicBytes(
  bytes: Uint8Array,
): (typeof documentUploadContentTypes)[number] | null {
  for (const signature of magicSignatures) {
    if (signature.matches(bytes)) {
      return signature.contentType;
    }
  }

  return null;
}

export function magicBytesMatchDeclaredContentType(
  declaredContentType: string,
  bytes: Uint8Array,
): boolean {
  const detected = detectContentTypeFromMagicBytes(bytes);
  if (!detected) {
    return true;
  }

  return detected === declaredContentType;
}
