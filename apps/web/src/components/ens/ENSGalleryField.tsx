"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { TextRecordKey } from "@/lib/ens/ens-contracts";
import { useENSFields } from "./ENSFieldsProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ENSGalleryFieldProps {
  artKey: TextRecordKey;
  label: string;
  isOwner: boolean;
}

export function ENSGalleryField({
  artKey,
  label,
  isOwner,
}: ENSGalleryFieldProps) {
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { getValue, setValue, isLoading } = useENSFields();

  // Local state for uploads only
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const value = getValue(artKey);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use the appropriate endpoint based on file type
      const isVideo = file.type.startsWith("video/");
      const isAudio = file.type.startsWith("audio/");
      const endpoint = isVideo || isAudio ? "/api/upload" : "/api/upload/image";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();

      // Handle different response formats
      if (isVideo) {
        // Video upload returns fileName, construct the URL
        if (data.fileName) {
          const videoUrl = `/api/video/${encodeURIComponent(data.fileName)}`;
          setValue(artKey, videoUrl);
        } else if (data.url) {
          setValue(artKey, data.url);
        }
      } else if (isAudio) {
        // Audio upload returns fileName, construct the URL
        if (data.fileName) {
          const audioUrl = `/api/audio/${encodeURIComponent(data.fileName)}`;
          setValue(artKey, audioUrl);
        } else if (data.url) {
          setValue(artKey, data.url);
        }
      } else {
        // Image upload returns url directly
        if (data.url) {
          setValue(artKey, data.url);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setValue(artKey, "");
  };

  const isVideo = (url: string) => {
    return url.includes("/api/video/") || url.match(/\.(mp4|webm|avi|mov)$/i);
  };

  const isAudio = (url: string) => {
    return (
      url.includes("/api/audio/") || url.match(/\.(mp3|wav|ogg|m4a|flac)$/i)
    );
  };

  // Media display (always show this if there's content)
  const mediaDisplay = (
    <div className="mb-4 flex justify-center">
      {isLoading ? (
        <div className="h-32 w-32 animate-pulse rounded-lg bg-muted" />
      ) : (
        value && (
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
            {isVideo(value) ? (
              <video
                src={value}
                className="h-full w-full object-cover"
                controls
                muted
                playsInline
              />
            ) : isAudio(value) ? (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <audio src={value} controls className="w-full" />
              </div>
            ) : (
              <Image
                src={value}
                alt={`${label} media`}
                fill
                className="object-cover"
                unoptimized={value.startsWith("data:")}
              />
            )}
          </div>
        )
      )}
    </div>
  );

  // If not owner, just show the media
  if (!isOwner) {
    return value ? mediaDisplay : null;
  }

  // Loading state for the input
  if (isLoading) {
    return (
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{label}</h4>
        </div>
        <div className="mb-4 flex justify-center">
          <div className="h-32 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  // Editable view for owners
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">{label}</h4>
        {value && (
          <button
            onClick={handleRemove}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Media Preview */}
      {value && (
        <div className="mb-4 flex justify-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
            {isVideo(value) ? (
              <video
                src={value}
                className="h-full w-full object-cover"
                controls
                muted
                playsInline
              />
            ) : isAudio(value) ? (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <audio src={value} controls className="w-full" />
              </div>
            ) : (
              <Image
                src={value}
                alt={`${label} media`}
                fill
                className="object-cover"
                unoptimized={value.startsWith("data:")}
              />
            )}
          </div>
        </div>
      )}

      {/* File Upload */}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Label htmlFor={fieldId}>{label}</Label>
          <Input
            id={fieldId}
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="cursor-pointer"
          />
          {isUploading && (
            <p className="mt-1 text-muted-foreground text-sm">
              Uploading media...
            </p>
          )}
          {uploadError && (
            <p className="mt-1 text-red-500 text-sm">{uploadError}</p>
          )}
          {value && !isUploading && !uploadError && (
            <p className="mt-1 text-green-600 text-sm">
              Media uploaded successfully
            </p>
          )}
        </div>

        {/* <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
          disabled={isUploading}
        /> */}

        {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
      </div>
    </div>
  );
}
