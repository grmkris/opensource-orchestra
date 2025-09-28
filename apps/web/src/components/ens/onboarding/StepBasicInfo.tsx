"use client";

import { ArrowRight, SkipForward } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StepBasicInfoProps {
  ensName: string;
  onNext: (data?: { description?: string }) => void;
  onSkip: () => void;
  initialData?: { description?: string };
}

export function StepBasicInfo({
  ensName,
  onNext,
  onSkip,
  initialData,
}: StepBasicInfoProps) {
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  const handleNext = () => {
    onNext({ description });
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
          Tell us about yourself
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
          Add your display name and a short bio to help others know who you are.
        </span>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="description"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#2f3044",
              marginBottom: "8px",
            }}
          >
            Bio
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about yourself, your music, or your role in the community..."
            rows={4}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "14px",
              border: "1px solid #2f304466",
              borderRadius: "6px",
              background: "#ffffff",
              color: "#2f3044",
              resize: "vertical",
              minHeight: "100px",
            }}
          />
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
          Your information will be saved when you complete the onboarding.
        </p>
      </div>
    </div>
  );
}
