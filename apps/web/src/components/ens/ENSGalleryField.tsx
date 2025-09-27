"use client";

import { CheckIcon, SaveIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { useEnsText } from "wagmi";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetTextRecords } from "@/hooks/useSetTextRecords";
import type { TextRecordKey } from "@/lib/ens/ens-contracts";

interface ENSGalleryFieldProps {
  ensName: string;
  artKey: TextRecordKey;
  label: string;
  isOwner: boolean;
}

export function ENSGalleryField({
  ensName,
  artKey,
  label,
  isOwner,
}: ENSGalleryFieldProps) {
  const fieldId = useId();

  // Fetch art data using the built-in wagmi hook
  const { data: artUrl, isLoading } = useEnsText({
    name: ensName,
    key: artKey,
    query: { enabled: !!ensName },
    chainId: 1,
  });

  // Local state for this field
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const setTextRecords = useSetTextRecords();

  // Update local state when data loads
  useEffect(() => {
    if (artUrl) {
      setValue(artUrl);
    }
  }, [artUrl]);

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
      const endpoint = isVideo ? "/api/upload" : "/api/upload/image";

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
          setValue(videoUrl);
        } else if (data.url) {
          setValue(data.url);
        }
      } else {
        // Image upload returns url directly
        if (data.url) {
          setValue(data.url);
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

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      await setTextRecords.mutateAsync({
        label: ensName,
        key: artKey,
        value,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(`Error saving ${artKey}:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      await setTextRecords.mutateAsync({
        label: ensName,
        key: artKey,
        value: "",
      });
      setValue("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(`Error removing ${artKey}:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const isVideo = (url: string) => {
    return url.includes("/api/video/") || url.match(/\.(mp4|webm|avi|mov)$/i);
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
      <div className="space-y-4 rounded-lg border p-4">
        {mediaDisplay}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Label>{label}</Label>
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  // Editable view for owners
  return (
    <div className="space-y-4 rounded-lg border p-4">
      {/* Media Preview */}
      {(value || artUrl) && (
        <div className="mb-4 flex justify-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
            {isVideo(value || artUrl || "") ? (
              <video
                src={value || artUrl || ""}
                className="h-full w-full object-cover"
                controls
                muted
                playsInline
              />
            ) : (
              <Image
                src={value || artUrl || ""}
                alt={`${label} media`}
                fill
                className="object-cover"
                unoptimized={(value || artUrl || "").startsWith("data:")}
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
            accept="image/*,video/*"
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

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isUploading || !value}
          >
            {isSaving ? (
              <Loader className="h-4 w-4" />
            ) : saved ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <SaveIcon className="h-4 w-4" />
            )}
          </Button>

          {(value || artUrl) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRemove}
              disabled={isSaving || isUploading}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
