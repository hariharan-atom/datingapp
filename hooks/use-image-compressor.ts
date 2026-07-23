"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  compressUserImage,
  type CompressedImage,
  ImageCompressionError,
} from "@/services/media/image-compressor";

export interface SelectedCompressedImage extends CompressedImage {
  previewUrl: string;
}

export function useImageCompressor() {
  const [images, setImages] = useState<SelectedCompressedImage[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string>();
  const controllerRef = useRef<AbortController | null>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      imagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    },
    [],
  );

  const addFiles = useCallback(async (files: FileList | File[]) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setCompressing(true);
    setError(undefined);

    try {
      const compressed: SelectedCompressedImage[] = [];
      for (const file of Array.from(files)) {
        const result = await compressUserImage(file, {
          signal: controller.signal,
        });
        compressed.push({
          ...result,
          previewUrl: URL.createObjectURL(result.file),
        });
      }
      setImages((current) => [...current, ...compressed]);
      return compressed;
    } catch (caught) {
      if (
        caught instanceof ImageCompressionError &&
        caught.code === "aborted"
      ) {
        return [];
      }
      const message =
        caught instanceof Error ? caught.message : "Image compression failed.";
      setError(message);
      throw caught;
    } finally {
      setCompressing(false);
    }
  }, []);

  const removeImage = useCallback((previewUrl: string) => {
    setImages((current) => {
      const removed = current.find((image) => image.previewUrl === previewUrl);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((image) => image.previewUrl !== previewUrl);
    });
  }, []);

  return {
    images,
    compressing,
    error,
    addFiles,
    removeImage,
    clearError: () => setError(undefined),
  };
}
