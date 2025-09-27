"use client";

import Image from "next/image";
import { useEnsText } from "wagmi";
import { Card } from "@/components/ui/card";
import { TEXT_RECORD_KEYS } from "@/lib/ens/ens-contracts";

interface ENSGalleryPublicProps {
  ensName: string;
}

function GalleryItem({ ensName, artKey }: { ensName: string; artKey: string }) {
  const { data: artUrl, isLoading } = useEnsText({
    name: ensName,
    key: artKey,
    query: { enabled: !!ensName },
    chainId: 1,
  });

  if (isLoading) {
    return <div className="aspect-square animate-pulse rounded-lg bg-muted" />;
  }

  if (!artUrl) return null;

  const isVideo = (url: string) => {
    return url.includes("/api/video/") || url.match(/\.(mp4|webm|avi|mov)$/i);
  };

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border">
      {isVideo(artUrl) ? (
        <video
          src={artUrl}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          controls
          muted
          playsInline
        />
      ) : (
        <Image
          src={artUrl}
          alt={`Gallery item`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          unoptimized={artUrl.startsWith("data:")}
        />
      )}
    </div>
  );
}

export function ENSGalleryPublic({ ensName }: ENSGalleryPublicProps) {
  const galleryKeys = [
    TEXT_RECORD_KEYS.ART1,
    TEXT_RECORD_KEYS.ART2,
    TEXT_RECORD_KEYS.ART3,
    TEXT_RECORD_KEYS.ART4,
    TEXT_RECORD_KEYS.ART5,
    TEXT_RECORD_KEYS.ART6,
    TEXT_RECORD_KEYS.ART7,
    TEXT_RECORD_KEYS.ART8,
  ];

  // Check if any gallery items exist
  const galleryItems = galleryKeys.map((key) => (
    <GalleryItem key={key} ensName={ensName} artKey={key} />
  ));

  // We'll render the section and let individual items decide if they should show
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Media Gallery</h3>
        <p className="text-muted-foreground text-sm">
          Explore {ensName}'s collection of images and videos
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {galleryItems}
      </div>
    </Card>
  );
}
