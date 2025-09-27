"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useENSFields } from "./ENSFieldsProvider";
import { Loader } from "@/components/loader";

interface ENSHeaderFieldProps {
  isOwner: boolean;
  ensName: string;
  headerUrl: string;
}

export function ENSHeaderField({
  isOwner,
  ensName,
  headerUrl,
}: ENSHeaderFieldProps) {
  const fieldId = useId();
  const { getValue, setValue, isLoading } = useENSFields();

  // Local state for uploads only
  const [isUploading, setIsUploading] = useState(false);
  const value = getValue("header");

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
      console.log(url, "url");
      setValue("header", url);
    } catch (error) {
      console.error("Error uploading header image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove individual save - now handled by batch save

  // Clickable header preview for uploading
  const headerDisplay = (
    <div
      className="h-48 w-full relative group cursor-pointer overflow-hidden rounded-t-sm"
      onClick={() => isOwner && document.getElementById(fieldId)?.click()}
      style={{
        background:
          value || headerUrl
            ? "transparent"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {isLoading ? (
        <div className="h-48 w-full animate-pulse bg-muted" />
      ) : value || headerUrl ? (
        <>
          <Image
            src={value || headerUrl || ""}
            alt={`${ensName} header`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={(value || headerUrl || "").startsWith("data:")}
          />
          {isOwner && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="text-center">
                <div className="mb-2 h-12 w-12 mx-auto rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-white text-lg font-semibold drop-shadow-lg">
                  {isUploading ? "Uploading..." : "Change Header"}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-48 w-full flex items-center justify-center">
          {isOwner ? (
            <div className="text-center text-white">
              <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold drop-shadow-lg">
                Add Header Image
              </span>
              <p className="text-sm opacity-90 mt-1">
                Click to upload a cover image
              </p>
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-lg font-medium drop-shadow-lg">
                No Header Image
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Hidden file input
  const fileInput = isOwner ? (
    <input
      id={fieldId}
      type="file"
      accept="image/*"
      onChange={handleFileSelect}
      disabled={isUploading}
      className="hidden"
    />
  ) : null;

  return (
    <>
      {headerDisplay}
      {fileInput}
      {isUploading && (
        <div className="px-8 pt-2">
          <p className="text-center text-muted-foreground text-sm">
            Uploading header image...
          </p>
        </div>
      )}
    </>
  );
}
