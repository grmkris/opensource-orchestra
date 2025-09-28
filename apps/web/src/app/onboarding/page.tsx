"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAddress } from "viem";
import { useAccount, useEnsAvatar } from "wagmi";
import { OnboardingProgress } from "@/components/ens/OnboardingProgress";
import { StepArtistRegistration } from "@/components/ens/onboarding/StepArtistRegistration";
import { StepBasicInfo } from "@/components/ens/onboarding/StepBasicInfo";
import { StepSocials } from "@/components/ens/onboarding/StepSocials";
import { StepVisuals } from "@/components/ens/onboarding/StepVisuals";
import { StepWallet } from "@/components/ens/onboarding/StepWallet";
import { SubdomainRegistration } from "@/components/ens/SubdomainRegistration";
import { Loader } from "@/components/loader";
import { useEnsName } from "@/hooks/useEnsName";
import { useBatchSetTextRecords } from "@/hooks/useSetTextRecords";
import {
  ENS_CHAIN,
  TEXT_RECORD_KEYS,
  type TextRecordKey,
} from "@/lib/ens/ens-contracts";

// Types for collected onboarding data
interface OnboardingData {
  basic?: {
    description?: string;
  };
  visuals?: {
    avatar?: string;
    header?: string;
  };
  socials?: {
    twitter?: string;
    github?: string;
    discord?: string;
    telegram?: string;
    farcaster?: string;
    lens?: string;
    website?: string;
    email?: string;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isSaving, setIsSaving] = useState(false);

  const userSubdomain = useEnsName({
    address: getAddress(
      address || "0x0000000000000000000000000000000000000000"
    ),
    l1ChainId: 1,
    l2ChainId: ENS_CHAIN.id,
  });

  // Get avatar URL for artist registration
  const { data: avatarUrl } = useEnsAvatar({
    name: userSubdomain.data || "",
    query: { enabled: !!userSubdomain.data },
    chainId: 1,
  });

  const batchSetTextRecords = useBatchSetTextRecords();

  // Redirect to /me if user already has a subdomain and it is primary and they configured everything
  // useEffect(() => {
  // 	if (userSubdomain.data && !userSubdomain.isLoading) {
  // 		router.push("/me");
  // 	}
  // }, [userSubdomain.data, userSubdomain.isLoading, router]);

  const steps = [
    { id: "wallet", title: "Connect Wallet", required: true },
    { id: "username", title: "Choose Username", required: true },
    { id: "basic", title: "Basic Info", required: false },
    { id: "visuals", title: "Profile Images", required: false },
    { id: "socials", title: "Social Links", required: false },
    { id: "artist", title: "Artist Registration", required: false },
    { id: "complete", title: "Complete Setup", required: true },
  ];

  const saveAllOnboardingData = async () => {
    if (!userSubdomain.data) return;

    setIsSaving(true);
    try {
      const records: Array<{ key: TextRecordKey; value: string }> = [];

      // Add basic info
      if (onboardingData.basic?.description) {
        records.push({
          key: TEXT_RECORD_KEYS.DESCRIPTION,
          value: onboardingData.basic.description,
        });
      }

      // Add visuals
      if (onboardingData.visuals?.avatar) {
        records.push({
          key: TEXT_RECORD_KEYS.AVATAR,
          value: onboardingData.visuals.avatar,
        });
      }
      if (onboardingData.visuals?.header) {
        records.push({
          key: TEXT_RECORD_KEYS.HEADER,
          value: onboardingData.visuals.header,
        });
      }

      // Add socials
      if (onboardingData.socials) {
        const socialMappings: Record<string, TextRecordKey> = {
          twitter: TEXT_RECORD_KEYS.TWITTER,
          github: TEXT_RECORD_KEYS.GITHUB,
          discord: TEXT_RECORD_KEYS.DISCORD,
          telegram: TEXT_RECORD_KEYS.TELEGRAM,
          farcaster: TEXT_RECORD_KEYS.FARCASTER,
          lens: TEXT_RECORD_KEYS.LENS,
          website: TEXT_RECORD_KEYS.URL,
          email: TEXT_RECORD_KEYS.EMAIL,
        };

        Object.entries(onboardingData.socials).forEach(([key, value]) => {
          if (value && socialMappings[key]) {
            records.push({
              key: socialMappings[key],
              value: value,
            });
          }
        });
      }

      // Only save if there are records to save
      if (records.length > 0) {
        console.log("Saving records:", records); // Debug log
        await batchSetTextRecords.mutateAsync({
          label: userSubdomain.data,
          records,
        });
        console.log("Records saved successfully"); // Debug log
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      // Don't throw the error, just log it so the user can still navigate
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Save all data before completing onboarding
      await saveAllOnboardingData();
      // Onboarding complete - redirect to /me
      router.push("/me");
    }
  };

  const handleSkip = () => {
    if (steps[currentStep]?.required) {
      return; // Cannot skip required steps
    }
    handleNext();
  };

  // Auto-advance from wallet step when connected
  const handleWalletConnected = () => {
    setCurrentStep(1);
  };

  // Handle data collection from steps
  const handleBasicInfoNext = (data?: { description?: string }) => {
    if (data) {
      setOnboardingData((prev) => ({ ...prev, basic: data }));
    }
    handleNext();
  };

  const handleVisualsNext = (data?: { avatar?: string; header?: string }) => {
    if (data) {
      setOnboardingData((prev) => ({ ...prev, visuals: data }));
    }
    handleNext();
  };

  const handleSocialsNext = (data?: {
    twitter?: string;
    github?: string;
    discord?: string;
    telegram?: string;
    farcaster?: string;
    lens?: string;
    website?: string;
    email?: string;
  }) => {
    if (data) {
      setOnboardingData((prev) => ({ ...prev, socials: data }));
    }
    handleNext();
  };

  // Completion step component
  const CompletionStep = () => {
    const hasData =
      onboardingData.basic || onboardingData.visuals || onboardingData.socials;

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
            🎉 Ready to Complete Setup!
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
            {hasData
              ? "Your profile information is ready to be saved to the blockchain."
              : "Complete your setup to join the Orchestra community."}
          </span>
        </div>

        {hasData && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Profile Summary:
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {onboardingData.basic?.description && (
                  <li>
                    ✓ Bio: {onboardingData.basic.description.substring(0, 50)}
                    ...
                  </li>
                )}
                {onboardingData.visuals?.avatar && (
                  <li>✓ Profile picture uploaded</li>
                )}
                {onboardingData.visuals?.header && (
                  <li>✓ Cover image uploaded</li>
                )}
                {onboardingData.socials &&
                  Object.values(onboardingData.socials).some((v) => v) && (
                    <li>
                      ✓ Social links:{" "}
                      {
                        Object.values(onboardingData.socials).filter((v) => v)
                          .length
                      }{" "}
                      connected
                    </li>
                  )}
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <button
            onClick={async () => {
              await saveAllOnboardingData();
              router.push("/me");
            }}
            disabled={isSaving}
            className="flex items-center space-x-2"
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#ffffff",
              background: isSaving ? "#6b7280" : "#156fb3",
              border: `1px solid ${isSaving ? "#6b7280" : "#156fb3"}`,
              borderRadius: "6px",
              padding: "12px 32px",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? "Saving to Blockchain..." : "Complete Setup"}
          </button>
        </div>

        <div className="text-center">
          <p
            style={{
              fontSize: "14px",
              color: "#2f3044aa",
              marginTop: "16px",
            }}
          >
            {hasData
              ? "This will save all your information to the blockchain in a single transaction."
              : "You can always add more information later in your profile."}
          </p>
        </div>
      </div>
    );
  };

  if (userSubdomain.isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <Loader className="mx-auto mb-4 h-8 w-8" />
          <h1 className="mb-2 font-semibold text-2xl">Loading...</h1>
          <p className="text-muted-foreground">
            Checking your ENS subdomain status
          </p>
        </div>
      </div>
    );
  }

  // Render current onboarding step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <StepWallet onNext={handleWalletConnected} />;
      case 1:
        return <SubdomainRegistration onSuccess={handleNext} />;
      case 2:
        return (
          <StepBasicInfo
            ensName={userSubdomain.data || ""}
            onNext={handleBasicInfoNext}
            onSkip={handleSkip}
            initialData={onboardingData.basic}
          />
        );
      case 3:
        return (
          <StepVisuals
            ensName={userSubdomain.data || ""}
            onNext={handleVisualsNext}
            onSkip={handleSkip}
            initialData={onboardingData.visuals}
          />
        );
      case 4:
        return (
          <StepSocials
            ensName={userSubdomain.data || ""}
            onNext={handleSocialsNext}
            onSkip={handleSkip}
            initialData={onboardingData.socials}
          />
        );
      case 5:
        return (
          <StepArtistRegistration
            ensName={userSubdomain.data || ""}
            onNext={handleNext}
            onSkip={handleSkip}
            avatarUrl={avatarUrl || ""}
          />
        );
      case 6:
        return <CompletionStep />;
      default:
        return null;
    }
  };

  // Allow onboarding flow to continue even after subdomain registration
  // if (userSubdomain.data) {
  // 	return null;
  // }

  // Onboarding flow
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Back to Home Button */}
          <div className="flex justify-start">
            <Link href="/">
              <button
                type="button"
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Orchestra</span>
              </button>
            </Link>
          </div>

          {/* Modern Header Card */}
          <div
            style={{
              fontFamily:
                "system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
              background: "#ffffff",
              color: "#2f3044",
              border: "2px solid #2f3044",
              borderBottomWidth: "14px",
              borderRadius: "2px",
              maxWidth: "880px",
              lineHeight: "1.35",
              textAlign: "center",
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            <div style={{ padding: "28px 32px 36px" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "40px",
                  fontWeight: "800",
                  letterSpacing: "-0.3px",
                  marginBottom: "14px",
                }}
              >
                OPENSOURCE ORCHESTRA PIT
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "22px",
                  fontWeight: "500",
                  color: "#2f3044cc",
                  marginBottom: "26px",
                }}
              >
                Create your decentralized identity and join the movement.
              </span>
              {address && (
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "14px",
                    color: "#2f3044aa",
                    marginTop: "16px",
                  }}
                >
                  {address}
                </p>
              )}
            </div>
          </div>

          {/* Progress Indicator Card */}
          <div
            style={{
              fontFamily:
                "system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
              background: "#ffffff",
              color: "#2f3044",
              border: "2px solid #2f3044",
              borderBottomWidth: "14px",
              borderRadius: "2px",
              maxWidth: "880px",
              lineHeight: "1.35",
              textAlign: "left",
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            <div style={{ padding: "28px 32px 36px" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "32px",
                  fontWeight: "800",
                  letterSpacing: "-0.3px",
                  marginBottom: "26px",
                  textAlign: "center",
                }}
              >
                Setup Progress
              </span>
              <OnboardingProgress steps={steps} currentStep={currentStep} />
            </div>
          </div>

          {/* Current Step Card */}
          <div
            style={{
              fontFamily:
                "system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
              background: "#ffffff",
              color: "#2f3044",
              border: "2px solid #2f3044",
              borderBottomWidth: "14px",
              borderRadius: "2px",
              maxWidth: "880px",
              lineHeight: "1.35",
              textAlign: "left",
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            <div style={{ padding: "28px 32px 36px" }}>
              {renderCurrentStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
