"use client";

import { Camera, Check, GripVertical, LoaderCircle, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useImageCompressor } from "@/hooks/use-image-compressor";
import { formatImageBytes } from "@/services/media/image-compressor";
import { cn } from "@/utils/cn";

interface CompressedImagePickerProps {
  existingImages?: string[];
  maxImages?: number;
  onChange?: (files: File[]) => void;
  className?: string;
}

export function CompressedImagePicker({
  existingImages = [],
  maxImages = 6,
  onChange,
  className,
}: CompressedImagePickerProps) {
  const [existing, setExisting] = useState(existingImages);
  const inputRef = useRef<HTMLInputElement>(null);
  const { images, compressing, error, addFiles, removeImage } =
    useImageCompressor();
  const total = existing.length + images.length;
  const remaining = Math.max(0, maxImages - total);

  useEffect(() => {
    onChange?.(images.map((image) => image.file));
  }, [images, onChange]);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif,.avif"
        multiple
        className="sr-only"
        onChange={async (event) => {
          const selected = Array.from(event.target.files ?? []).slice(
            0,
            remaining,
          );
          event.target.value = "";
          if (selected.length) {
            try {
              await addFiles(selected);
            } catch {
              // The hook exposes a user-safe error message below.
            }
          }
        }}
      />

      <div className="grid grid-cols-3 gap-3">
        {existing.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-surface"
          >
            <Image
              src={src}
              alt={`Profile photo ${index + 1}`}
              fill
              sizes="33vw"
              className="object-cover"
            />
            <GripVertical className="absolute left-2 top-2 size-4 text-white drop-shadow" />
            {index === 0 && (
              <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-1 text-[8px] font-bold uppercase backdrop-blur">
                Main
              </span>
            )}
            <button
              type="button"
              aria-label={`Remove photo ${index + 1}`}
              onClick={() =>
                setExisting((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
              className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/35 text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {images.map((image, index) => (
          <div
            key={image.previewUrl}
            className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-surface"
          >
            <Image
              src={image.previewUrl}
              alt={`New compressed photo ${index + 1}`}
              fill
              unoptimized
              sizes="33vw"
              className="object-cover"
            />
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[8px] font-bold text-success backdrop-blur">
              <Check className="size-2.5" />
              {formatImageBytes(image.compressedBytes)}
            </span>
            <button
              type="button"
              aria-label={`Remove new photo ${index + 1}`}
              onClick={() => removeImage(image.previewUrl)}
              className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/35 text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {Array.from({ length: remaining }).map((_, index) => (
          <button
            type="button"
            key={`empty-${index}`}
            onClick={() => inputRef.current?.click()}
            disabled={compressing}
            className={cn(
              "grid aspect-[3/4] place-items-center rounded-[20px] border border-dashed border-secondary/30 bg-secondary/5 text-secondary",
              compressing && index === 0 && "border-solid",
            )}
            aria-label="Add and compress image"
          >
            {compressing && index === 0 ? (
              <span className="flex flex-col items-center gap-2 text-[9px] font-bold">
                <LoaderCircle className="size-5 animate-spin" />
                Compressing
              </span>
            ) : (
              <Camera className="size-5" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold text-success">
          <Check className="size-3.5" />
          Every image is auto-compressed to 150 KB or less
        </p>
        <p className="shrink-0 text-[10px] font-bold text-muted">
          {total}/{maxImages}
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs leading-5 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
