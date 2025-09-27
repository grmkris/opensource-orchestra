"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAddress } from "viem";
import { useAccount } from "wagmi";
import { SubdomainProfile } from "@/components/ens/SubdomainProfile";
import { Loader } from "@/components/loader";
import { useEnsName } from "@/hooks/useEnsName";
import { ENS_CHAIN } from "@/lib/ens/ens-contracts";

export default function MePage() {
  const router = useRouter();
  const { address } = useAccount();

  const userSubdomain = useEnsName({
    address: getAddress(
      address || "0x0000000000000000000000000000000000000000"
    ),
    l1ChainId: 1,
    l2ChainId: ENS_CHAIN.id,
  });

  // Redirect to /onboarding if user doesn't have a subdomain
  useEffect(() => {
    if (!userSubdomain.isLoading && !userSubdomain.data && address) {
      router.push("/onboarding");
    }
  }, [userSubdomain.data, userSubdomain.isLoading, address, router]);

  // Redirect to wallet connection if no wallet connected
  useEffect(() => {
    if (!userSubdomain.isLoading && !address) {
      router.push("/onboarding");
    }
  }, [address, userSubdomain.isLoading, router]);

  if (userSubdomain.isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <Loader className="mx-auto mb-4 h-8 w-8" />
          <h1 className="mb-2 font-semibold text-2xl">Loading...</h1>
          <p className="text-muted-foreground">Loading your profile</p>
        </div>
      </div>
    );
  }

  // Don't render if redirecting
  if (!userSubdomain.data || !address) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <button
              type="button"
              className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Orchestra</span>
            </button>
          </Link>

          {/* Wallet Button */}
          <ConnectButton />
        </div>

        <SubdomainProfile ensName={userSubdomain.data} />
      </div>
    </div>
  );
}
