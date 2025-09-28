"use client";

import { ArrowRight, CheckCircle, SkipForward, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { sepolia } from "viem/chains";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterArtist } from "@/lib/pyusd/pyUsdHooks";

interface StepArtistRegistrationProps {
  ensName: string;
  onNext: () => void;
  onSkip: () => void;
  avatarUrl?: string;
}

export function StepArtistRegistration({
  ensName,
  onNext,
  onSkip,
  avatarUrl,
}: StepArtistRegistrationProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [wantsToRegister, setWantsToRegister] = useState(false);
  const [artistName, setArtistName] = useState(ensName || "");
  const [imageUrl, setImageUrl] = useState(avatarUrl || "");

  const registerArtist = useRegisterArtist();

  const isOnSepolia = chainId === sepolia.id;
  const canRegister = address && artistName && imageUrl && isOnSepolia;

  useEffect(() => {
    if (ensName) {
      setArtistName(ensName);
    }
  }, [ensName]);

  useEffect(() => {
    if (avatarUrl) {
      setImageUrl(avatarUrl);
    }
  }, [avatarUrl]);

  const handleSwitchToSepolia = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
    } catch (error) {
      console.error("Failed to switch to Sepolia:", error);
    }
  };

  const handleRegisterArtist = async () => {
    if (!address || !artistName || !imageUrl) return;

    try {
      await registerArtist.mutateAsync({
        name: artistName,
        address,
        imageUrl,
      });
    } catch (error) {
      console.error("Artist registration failed:", error);
    }
  };

  const handleComplete = async () => {
    if (wantsToRegister && !registerArtist.isSuccess) {
      await handleRegisterArtist();
    }
    if (!wantsToRegister || registerArtist.isSuccess) {
      onNext();
    }
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
          Artist Registration
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
          Register as an artist on the PYUSD platform to receive gifts and build
          your community.
        </span>
      </div>

      {/* Registration Option */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="register-artist"
            checked={wantsToRegister}
            onCheckedChange={(checked) => setWantsToRegister(!!checked)}
          />
          <Label htmlFor="register-artist" className="font-medium">
            Register as an artist on PYUSD
          </Label>
        </div>

        {wantsToRegister && (
          <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
            <div className="space-y-2">
              <Label htmlFor="artist-name">Artist Name</Label>
              <Input
                id="artist-name"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Your artist name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Profile Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or ipfs://..."
              />
              <p className="text-gray-500 text-sm">
                This will be your artist profile image on PYUSD
              </p>
            </div>

            {/* Network Check */}
            {!isOnSepolia && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-800">
                      Switch to Sepolia Testnet
                    </p>
                    <p className="text-sm text-yellow-700">
                      PYUSD registration requires Sepolia testnet
                    </p>
                  </div>
                  <Button
                    onClick={handleSwitchToSepolia}
                    variant="outline"
                    size="sm"
                  >
                    Switch Network
                  </Button>
                </div>
              </div>
            )}

            {/* Registration Status */}
            {registerArtist.isPending && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-blue-800">
                  🔄 Registering artist on PYUSD...
                </p>
              </div>
            )}

            {registerArtist.isSuccess && (
              <div className="flex items-center rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                <p className="text-green-800">
                  Successfully registered as an artist!
                </p>
              </div>
            )}

            {registerArtist.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-800">
                  ❌ Registration failed: {registerArtist.error?.message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Benefits Info */}
      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <h3 className="mb-3 font-semibold text-gray-900">
          Benefits of Artist Registration:
        </h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li className="flex items-start">
            <span className="mr-2 text-blue-500">•</span>
            Receive PYUSD gifts from your community
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-blue-500">•</span>
            Track your earnings and withdrawals
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-blue-500">•</span>
            Build a monetized fan base on-chain
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-blue-500">•</span>
            Participate in the decentralized music economy
          </li>
        </ul>
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
          onClick={handleComplete}
          disabled={
            (wantsToRegister && !canRegister) || registerArtist.isPending
          }
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
          <span>
            {wantsToRegister && !registerArtist.isSuccess
              ? "Register & Continue"
              : "Complete Setup"}
          </span>
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
          You can always register as an artist later from your profile settings.
        </p>
      </div>
    </div>
  );
}
