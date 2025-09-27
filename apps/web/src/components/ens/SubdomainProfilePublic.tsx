"use client";

import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  Gift,
  LinkIcon,
} from "lucide-react";
import { useState } from "react";
import {
  useAccount,
  useEnsAddress,
  useEnsText,
  useSendTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { normalize } from "viem/ens";
import { ENSAvatar } from "@/components/ens/ENSAvatar";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ENSField {
  key: string;
  label: string;
  isUrl?: boolean;
  isEmail?: boolean;
  prefix?: string;
}

const ENS_FIELDS: ENSField[] = [
  { key: "description", label: "Description" },
  { key: "url", label: "Website", isUrl: true },
  { key: "email", label: "Email", isEmail: true },
  { key: "com.twitter", label: "Twitter", prefix: "https://twitter.com/" },
  { key: "com.github", label: "GitHub", prefix: "https://github.com/" },
  { key: "com.discord", label: "Discord" },
  { key: "com.telegram", label: "Telegram", prefix: "https://t.me/" },
];

function ENSFieldDisplay({
  ensName,
  field,
}: {
  ensName: string;
  field: ENSField;
}) {
  const { data, isLoading } = useEnsText({
    name: ensName,
    key: field.key,
    query: { enabled: !!ensName },
    chainId: 1,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-1 h-4 w-16 rounded bg-muted" />
        <div className="h-5 w-32 rounded bg-muted" />
      </div>
    );
  }

  if (!data) return null;

  const renderValue = () => {
    if (field.isUrl || field.isEmail) {
      const href = field.isEmail ? `mailto:${data}` : data;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
        >
          <span>{data}</span>
          <ExternalLinkIcon className="ml-1 h-3 w-3" />
        </a>
      );
    }

    if (field.prefix) {
      return (
        <a
          href={`${field.prefix}${data}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
        >
          <span>{data}</span>
          <ExternalLinkIcon className="ml-1 h-3 w-3" />
        </a>
      );
    }

    return <span className="text-foreground">{data}</span>;
  };

  return (
    <div>
      <span className="font-medium text-muted-foreground text-sm">
        {field.label}:
      </span>
      <div className="mt-1">{renderValue()}</div>
    </div>
  );
}

export function SubdomainProfilePublic({ ensName }: { ensName: string }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { address: userAddress } = useAccount();
  const { sendTransaction, isPending: isSending } = useSendTransaction();

  // Get the ENS name's address
  const { data: ensAddress, isLoading: addressLoading } = useEnsAddress({
    name: normalize(ensName || ""),
    query: { enabled: !!ensName },
    chainId: 1,
  });

  // Get header image
  const { data: headerUrl } = useEnsText({
    name: ensName,
    key: "header",
    query: { enabled: !!ensName },
    chainId: 1,
  });
  const { data: avatarUrl } = useEnsText({
    key: "avatar",
    name: ensName,
    query: { enabled: !!ensName },
    chainId: 1,
  });

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleGift = () => {
    if (!ensAddress) return;

    if (!userAddress) {
      // Trigger wallet connection if not connected
      alert("Please connect your wallet to send a gift");
      return;
    }

    sendTransaction({
      to: ensAddress as `0x${string}`,
      value: parseEther("0.001"), // Default 0.001 ETH gift
    });
  };

  if (addressLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader className="mr-2 h-6 w-6" />
          <span>Loading profile...</span>
        </div>
      </Card>
    );
  }

  if (!ensAddress) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Profile not found or not yet resolved
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header Image */}
      {headerUrl && (
        <div className="relative h-32 w-full">
          <ENSAvatar
            src={headerUrl}
            alt={`${ensName} header`}
            size="lg"
            rounded={false}
            className="h-32 w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-6 p-6">
        {/* Profile Header */}
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <ENSAvatar src={avatarUrl as string} size="lg" alt={ensName} />
          </div>

          {/* Profile Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-3">
              <h2 className="font-bold text-2xl text-foreground">{ensName}</h2>
              {userAddress?.toLowerCase() !== ensAddress?.toLowerCase() && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGift}
                  disabled={isSending}
                  className="flex items-center space-x-1 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Gift className="h-4 w-4" />
                  <span>{isSending ? "Sending..." : "Gift"}</span>
                </Button>
              )}
            </div>
            <div className="mt-1 flex items-center space-x-2 text-muted-foreground text-sm">
              <span>Owner: {ensAddress}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(ensAddress || "", "address")}
                className="h-6 w-6 p-0"
              >
                {copiedField === "address" ? (
                  <CheckIcon className="h-3 w-3" />
                ) : (
                  <CopyIcon className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {ENS_FIELDS.map((field) => (
            <ENSFieldDisplay key={field.key} ensName={ensName} field={field} />
          ))}
        </div>

        {/* Actions */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(ensName || "", "name")}
            >
              {copiedField === "name" ? (
                <CheckIcon className="mr-1 h-4 w-4" />
              ) : (
                <CopyIcon className="mr-1 h-4 w-4" />
              )}
              Copy Name
            </Button>

            <a
              href={`https://basescan.org/address/${ensAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:underline"
            >
              <span>View on Basescan</span>
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
