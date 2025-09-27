"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAddress } from "viem";
import { useAccount } from "wagmi";
import { OnboardingProgress } from "@/components/ens/OnboardingProgress";
import { StepBasicInfo } from "@/components/ens/onboarding/StepBasicInfo";
import { StepSocials } from "@/components/ens/onboarding/StepSocials";
import { StepVisuals } from "@/components/ens/onboarding/StepVisuals";
import { StepWallet } from "@/components/ens/onboarding/StepWallet";
import { SubdomainRegistration } from "@/components/ens/SubdomainRegistration";
import { Loader } from "@/components/loader";
import { useEnsName } from "@/hooks/useEnsName";
import { ENS_CHAIN } from "@/lib/ens/ens-contracts";

export default function OnboardingPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);

  const userSubdomain = useEnsName({
    address: getAddress(
      address || "0x0000000000000000000000000000000000000000"
    ),
    l1ChainId: 1,
    l2ChainId: ENS_CHAIN.id,
  });

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
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
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
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 3:
        return (
          <StepVisuals
            ensName={userSubdomain.data || ""}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 4:
        return (
          <StepSocials
            ensName={userSubdomain.data || ""}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
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
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
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

          {/* Modern Header Section */}
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
              OPENSOURCE ORCHESTRA PIT
            </h1>
            <p className="text-lg text-gray-600">
              Create your decentralized identity and join the movement.
            </p>
            {address && (
              <p className="mt-2 text-sm text-gray-500 font-mono">{address}</p>
            )}
          </div>

          {/* Progress Indicator Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <OnboardingProgress steps={steps} currentStep={currentStep} />
          </div>

          {/* Current Step Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
