import {
  compressUserImage,
  type CompressedImage,
  MAX_USER_IMAGE_BYTES,
} from "@/services/media/image-compressor";
import { createClient } from "@/supabase/client";

export type UserImagePurpose =
  "profile" | "chat" | "group" | "verification" | "report";

export interface UploadUserImageInput {
  file: File;
  purpose: UserImagePurpose;
  ownerId: string;
  targetId?: string;
  signal?: AbortSignal;
}

export interface UploadedUserImage extends CompressedImage {
  bucket: string;
  path: string;
}

function resolveStorageTarget({
  purpose,
  ownerId,
  targetId,
}: Omit<UploadUserImageInput, "file" | "signal">) {
  const id = crypto.randomUUID();

  switch (purpose) {
    case "profile":
      return {
        bucket: "profile-photos",
        path: `${ownerId}/${id}.webp`,
      };
    case "chat":
      if (!targetId) throw new Error("A chat ID is required for chat images.");
      return {
        bucket: "chat-media",
        path: `${targetId}/${ownerId}/${id}.webp`,
      };
    case "verification":
      return {
        bucket: "verification",
        path: `${ownerId}/images/${id}.webp`,
      };
    case "group":
    case "report":
      return {
        bucket: "user-images",
        path: `${ownerId}/${purpose}/${targetId ?? "general"}/${id}.webp`,
      };
  }
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
  const target = resolveStorageTarget(input);
  const { error } = await createClient()
    .storage.from(target.bucket)
    .upload(target.path, compressed.file, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: false,
    });

  if (error) throw error;
  return { ...compressed, ...target };
}
