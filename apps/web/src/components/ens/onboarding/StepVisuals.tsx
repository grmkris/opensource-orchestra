"use client";

import { ArrowRight, SkipForward, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface StepVisualsProps {
  ensName: string;
  onNext: (data?: { avatar?: string; header?: string }) => void;
  onSkip: () => void;
  initialData?: { avatar?: string; header?: string };
}

export function StepVisuals({
  ensName,
  onNext,
  onSkip,
  initialData,
}: StepVisualsProps) {
  const [avatar, setAvatar] = useState(initialData?.avatar || "");
  const [header, setHeader] = useState(initialData?.header || "");
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, type: "avatar" | "header") => {
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
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const imageUrl = data.url;

      if (type === "avatar") {
        setAvatar(imageUrl);
      } else {
        setHeader(imageUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    onNext({ avatar, header });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span
          style={{
            display: "block",
            fontSize: "32px",
            fontWeight: "800",
            letterSpacing: "-0.3px",
            marginBottom: "14px",
          }}
        >
          Visual Identity
        </span>
        <span
          style={{
            display: "block",
            fontSize: "18px",
            fontWeight: "500",
            color: "#2f3044cc",
            marginBottom: "32px",
          }}
        >
          Upload a profile picture and header image to personalize your profile.
        </span>
      </div>

      <div className="space-y-8">
        {/* Avatar Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div
              className="h-6 w-1 rounded-full"
              style={{ backgroundColor: "#2f3044" }}
            />
            <h4
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#2f3044",
              }}
            >
              Profile Picture
            </h4>
          </div>

          <div className="flex justify-center">
            <div className="space-y-4">
              <div
                className="group relative cursor-pointer"
                onClick={() => !isUploading && avatarInputRef.current?.click()}
              >
                {avatar ? (
                  <>
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      className="h-32 w-32 rounded-full object-cover"
                      style={{ border: "2px solid #2f3044" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="font-medium text-sm text-white">
                        {isUploading ? "Uploading..." : "Click to change"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatar("");
                      }}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">
                        {isUploading ? "Uploading..." : "Click to upload"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "avatar");
                }}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        {/* Header Image Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div
              className="h-6 w-1 rounded-full"
              style={{ backgroundColor: "#2f3044" }}
            />
            <h4
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#2f3044",
              }}
            >
              Cover Image
            </h4>
          </div>

          <div className="flex justify-center">
            <div className="space-y-4">
              <div
                className="group relative cursor-pointer overflow-hidden rounded-lg"
                onClick={() => !isUploading && headerInputRef.current?.click()}
              >
                {header ? (
                  <>
                    <img
                      src={header}
                      alt="Header preview"
                      className="h-32 w-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ border: "2px solid #2f3044" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-20">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-white drop-shadow-lg">
                          {isUploading ? "Uploading..." : "Change Header"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeader("");
                      }}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div
                    className="flex h-32 w-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-100"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-20">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-semibold text-white drop-shadow-lg">
                        {isUploading ? "Uploading..." : "Upload Header"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={headerInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "header");
                }}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="flex items-center space-x-2"
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#2f3044aa",
            background: "transparent",
            border: "1px solid #2f304466",
            borderRadius: "6px",
            padding: "8px 16px",
          }}
        >
          <SkipForward className="h-4 w-4" />
          <span>Skip for now</span>
        </Button>

        <Button
          onClick={handleNext}
          disabled={isUploading}
          className="flex items-center space-x-2"
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
            background: "#2f3044",
            border: "1px solid #2f3044",
            borderRadius: "6px",
            padding: "8px 16px",
          }}
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center">
        <p
          style={{
            fontSize: "14px",
            color: "#2f3044aa",
            marginTop: "16px",
          }}
        >
          Images will be saved when you complete the onboarding.
        </p>
      </div>
    </div>
  );
}
