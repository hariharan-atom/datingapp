export const MAX_USER_IMAGE_BYTES = 150 * 1024;
export const MAX_USER_IMAGE_INPUT_BYTES = 20 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const OUTPUT_TYPE = "image/webp";
const MAX_DIMENSION = 1600;
const MIN_DIMENSION = 320;
const MIN_QUALITY = 0.18;
const MAX_QUALITY = 0.9;

export type ImageCompressionErrorCode =
  | "unsupported_type"
  | "input_too_large"
  | "decode_failed"
  | "compression_failed"
  | "aborted";

export class ImageCompressionError extends Error {
  constructor(
    readonly code: ImageCompressionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ImageCompressionError";
  }
}

export interface CompressedImage {
  file: File;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  quality: number;
  compressionRatio: number;
}

export interface CompressImageOptions {
  maxBytes?: number;
  maxDimension?: number;
  signal?: AbortSignal;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new ImageCompressionError(
      "aborted",
      "Image compression was cancelled.",
    );
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
  signal?: AbortSignal,
) {
  throwIfAborted(signal);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (signal?.aborted) {
          reject(
            new ImageCompressionError(
              "aborted",
              "Image compression was cancelled.",
            ),
          );
          return;
        }
        if (!blob) {
          reject(
            new ImageCompressionError(
              "compression_failed",
              "This browser could not compress the selected image.",
            ),
          );
          return;
        }
        resolve(blob);
      },
      OUTPUT_TYPE,
      quality,
    );
  });
}

function createOutputName(name: string) {
  const base =
    name
      .replace(/\.[^.]+$/, "")
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "image";

  return `${base}.webp`;
}

async function decodeImage(file: File) {
  try {
    return await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
  } catch {
    throw new ImageCompressionError(
      "decode_failed",
      "We could not read this image. Try a JPEG, PNG, or WebP file.",
    );
  }
}

/**
 * Converts a user image to WebP and finds the highest useful quality that fits
 * beneath the hard byte budget. Metadata, including EXIF location data, is
 * removed because the pixels are redrawn onto a fresh canvas.
 */
export async function compressUserImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<CompressedImage> {
  const maxBytes = options.maxBytes ?? MAX_USER_IMAGE_BYTES;
  const maxDimension = options.maxDimension ?? MAX_DIMENSION;

  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new ImageCompressionError(
      "unsupported_type",
      "Choose a JPEG, PNG, or WebP image.",
    );
  }
  if (file.size > MAX_USER_IMAGE_INPUT_BYTES) {
    throw new ImageCompressionError(
      "input_too_large",
      "Choose an image smaller than 20 MB.",
    );
  }

  throwIfAborted(options.signal);
  const bitmap = await decodeImage(file);

  try {
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    const initialScale = Math.min(1, maxDimension / longestEdge);
    let width = Math.max(1, Math.round(bitmap.width * initialScale));
    let height = Math.max(1, Math.round(bitmap.height * initialScale));
    let best:
      | {
          blob: Blob;
          width: number;
          height: number;
          quality: number;
        }
      | undefined;

    while (Math.max(width, height) >= MIN_DIMENSION) {
      throwIfAborted(options.signal);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });

      if (!context) {
        throw new ImageCompressionError(
          "compression_failed",
          "This browser does not support image compression.",
        );
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, width, height);

      let low = MIN_QUALITY;
      let high = MAX_QUALITY;
      let bestAtSize:
        | {
            blob: Blob;
            quality: number;
          }
        | undefined;

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const quality = (low + high) / 2;
        const blob = await canvasToBlob(canvas, quality, options.signal);

        if (blob.size <= maxBytes) {
          bestAtSize = { blob, quality };
          low = quality;
        } else {
          high = quality;
        }
      }

      if (bestAtSize) {
        best = {
          ...bestAtSize,
          width,
          height,
        };
        break;
      }

      width = Math.max(1, Math.round(width * 0.82));
      height = Math.max(1, Math.round(height * 0.82));
    }

    if (!best) {
      throw new ImageCompressionError(
        "compression_failed",
        "This image could not be reduced below 150 KB. Try a simpler or smaller image.",
      );
    }

    const output = new File([best.blob], createOutputName(file.name), {
      type: OUTPUT_TYPE,
      lastModified: Date.now(),
    });

    if (output.size > maxBytes) {
      throw new ImageCompressionError(
        "compression_failed",
        "The compressed image exceeded the 150 KB upload limit.",
      );
    }

    return {
      file: output,
      originalBytes: file.size,
      compressedBytes: output.size,
      width: best.width,
      height: best.height,
      quality: best.quality,
      compressionRatio: output.size / Math.max(file.size, 1),
    };
  } finally {
    bitmap.close();
  }
}

export function formatImageBytes(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
