export const MAX_USER_IMAGE_BYTES = 150 * 1024;
export const MAX_USER_IMAGE_INPUT_BYTES = 20 * 1024 * 1024;

const KNOWN_IMAGE_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "gif",
  "heic",
  "heif",
  "jfif",
  "jpeg",
  "jpg",
  "png",
  "tif",
  "tiff",
  "webp",
]);
const OUTPUT_TYPE = "image/jpeg";
const OUTPUT_EXTENSION = "jpg";
const MAX_DIMENSION = 1600;
const MIN_DIMENSION = 160;
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

  return `${base}.${OUTPUT_EXTENSION}`;
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}

async function decodeImage(file: File) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      } satisfies DecodedImage;
    } catch {
      try {
        const bitmap = await createImageBitmap(file);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          close: () => bitmap.close(),
        } satisfies DecodedImage;
      } catch {
        // Safari can decode some native photo formats through an image element
        // even when createImageBitmap cannot.
      }
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();

    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error("The decoded image has no dimensions.");
    }

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(objectUrl),
    } satisfies DecodedImage;
  } catch {
    URL.revokeObjectURL(objectUrl);
    throw new ImageCompressionError(
      "decode_failed",
      "We could not read this image. Choose any photo format supported by your device.",
    );
  }
}

function isSupportedImageInput(file: File) {
  if (file.type.toLowerCase().startsWith("image/")) return true;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return Boolean(extension && KNOWN_IMAGE_EXTENSIONS.has(extension));
}

/**
 * Decodes any browser-supported image and normalizes it to JPEG, the most
 * consistently encodable format across iOS Safari, Android, and Chromium.
 * Metadata, including EXIF location data, is removed because the pixels are
 * redrawn onto a fresh canvas.
 */
export async function compressUserImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<CompressedImage> {
  const maxBytes = options.maxBytes ?? MAX_USER_IMAGE_BYTES;
  const maxDimension = options.maxDimension ?? MAX_DIMENSION;

  if (!isSupportedImageInput(file)) {
    throw new ImageCompressionError(
      "unsupported_type",
      "Choose an image file supported by your device.",
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
      const context = canvas.getContext("2d", { alpha: false });

      if (!context) {
        throw new ImageCompressionError(
          "compression_failed",
          "This browser does not support image compression.",
        );
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(bitmap.source, 0, 0, width, height);

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
      type: best.blob.type || OUTPUT_TYPE,
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
