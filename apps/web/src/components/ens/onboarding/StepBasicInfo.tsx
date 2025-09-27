"use client";

import { ArrowRight, SkipForward } from "lucide-react";
import { ENSTextField } from "@/components/ens/ENSTextField";
import { ENSFieldsProvider } from "@/components/ens/ENSFieldsProvider";
import { Button } from "@/components/ui/button";

interface StepBasicInfoProps {
  ensName: string;
  onNext: () => void;
  onSkip: () => void;
}

export function StepBasicInfo({ ensName, onNext, onSkip }: StepBasicInfoProps) {
  return (
    <ENSFieldsProvider ensName={ensName} isOwner={true}>
      <div
        className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-sm"
        style={{ fontFamily: "var(--font-roboto)" }}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
              <div className="h-8 w-8 rounded-lg bg-blue-500" />
            </div>
            <h2 className="mb-2 font-bold text-2xl text-gray-900">
              Tell us about yourself
            </h2>
            <p className="text-gray-600">
              Add your display name and a short bio to help others know who you
              are.
            </p>
          </div>

          <div className="space-y-6">
            <ENSTextField
              ensName={ensName}
              recordKey="description"
              label="Bio"
              placeholder="Tell us about yourself, your music, or your role in the community..."
              isOwner={true}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              onClick={onSkip}
              className="flex items-center space-x-2"
            >
              <SkipForward className="h-4 w-4" />
              <span>Skip for now</span>
            </Button>

            <Button onClick={onNext} className="flex items-center space-x-2">
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm">
              You can always edit this information later in your profile.
            </p>
          </div>
        </div>
      </div>
    </ENSFieldsProvider>
  );
}
