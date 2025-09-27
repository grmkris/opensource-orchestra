"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
import { useId, useState } from "react";
import { ENSAvatar } from "@/components/ens/ENSAvatar";
import { useENSFields } from "@/components/ens/ENSFieldsProvider";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetTextRecords } from "@/hooks/useSetTextRecords";

interface ENSAvatarFieldProps {
  isOwner: boolean;
  ensName: string;
  avatarUrl: string;
}

export function ENSAvatarField({
  isOwner,
  ensName,
  avatarUrl,
}: ENSAvatarFieldProps) {
  const fieldId = useId();
  const { getValue, setValue, isLoading } = useENSFields();

  // Local state for uploads only
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const setTextRecords = useSetTextRecords();
  const value = getValue("avatar");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await response.json();
      setValue("avatar", url);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    // alert(value);
    try {
      await setTextRecords.mutateAsync({
        label: "",
        key: "avatar",
        value,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving avatar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar display (always show this)
  const avatarDisplay = (
    <div className="mb-4 flex justify-center">
      {isLoading ? (
        <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
      ) : (
        value && <ENSAvatar src={value || undefined} alt="Avatar" size="md" />
      )}
    </div>
  );

  // If not owner, just show the avatar
  if (!isOwner) {
    return avatarDisplay;
  }

  // Loading state for the input
  if (isLoading) {
    return (
      <div className="space-y-4">
        {avatarDisplay}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Label>Avatar URL</Label>
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  // Editable view for owners
  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div className="mb-4 flex justify-center">
        {isLoading ? (
          <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
        ) : (
          <ENSAvatar
            src={value || avatarUrl || undefined}
            alt={`${ensName} avatar`}
            size="md"
          />
        )}
      </div>

      {/* File Upload */}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Label htmlFor={fieldId}>Upload Avatar Image</Label>
          <Input
            id={fieldId}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="cursor-pointer"
          />
          {isUploading && (
            <p className="mt-1 text-muted-foreground text-sm">
              Uploading image...
            </p>
          )}
          {value && !isUploading && (
            <p className="mt-1 text-muted-foreground text-sm">
              Image uploaded successfully
            </p>
          )}
        </div>
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
      </div>
    </div>
  );
}
