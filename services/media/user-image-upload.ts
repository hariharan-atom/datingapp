import {
  compressUserImage,
  type CompressedImage,
  MAX_USER_IMAGE_BYTES,
} from "@/services/media/image-compressor";

export type UserImagePurpose =
  "profile" | "chat" | "group" | "verification" | "report";

export interface UploadUserImageInput {
  file: File;
  purpose: UserImagePurpose;
  targetId?: string;
  signal?: AbortSignal;
}

export interface UploadedUserImage extends CompressedImage {
  bucket: string;
  path: string;
}

/**
 * The only supported path for user-generated image uploads. Callers cannot
 * provide an already-compressed blob, which prevents accidental bypasses.
 */
export async function uploadUserImage(
  input: UploadUserImageInput,
): Promise<UploadedUserImage> {
  const compressed = await compressUserImage(input.file, {
    maxBytes: MAX_USER_IMAGE_BYTES,
    signal: input.signal,
  });
  const formData = new FormData();
  formData.set("file", compressed.file);
  formData.set("purpose", input.purpose);
  if (input.targetId) formData.set("targetId", input.targetId);

  const response = await fetch("/api/media/upload", {
    method: "POST",
    body: formData,
    signal: input.signal,
  });
  const result = (await response.json()) as {
    bucket?: string;
    path?: string;
    message?: string;
  };

  if (!response.ok || !result.bucket || !result.path) {
    throw new Error(result.message ?? "The image could not be uploaded.");
  }

  return {
    ...compressed,
    bucket: result.bucket,
    path: result.path,
  };
}
