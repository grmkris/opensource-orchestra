"use client";

import { useRouter } from "next/navigation";
import { GlobalDonationsFeed } from "@/components/ens/GlobalDonationsFeed";
import { GiftPopover } from "@/components/ens/GiftPopover";

export default function Home() {
  const router = useRouter();

  // Artist data positioned precisely on visible music stands in pit.png
  const pendingArtists = [
    { id: "artist1.eth", name: "DJ Crypto", x: 35, y: 68 }, // Left-center front stand
    { id: "artist2.eth", name: "The Degens", x: 50, y: 70 }, // Center front stand
    { id: "artist3.eth", name: "NFT Beats", x: 65, y: 68 }, // Right-center front stand
    { id: "artist4.eth", name: "Web3 Symphony", x: 45, y: 57 }, // Back center-left stand
    { id: "artist5.eth", name: "Blockchain Band", x: 55, y: 57 }, // Back center-right stand
  ];

  const handleArtistClick = (artistId: string) => {
    // Navigate to ENS profile page
    router.push(`/ens/${artistId}`);
  };

  return (
    <div className="w-full bg-black">
      {/* Stage Section - Main performance area */}
      <div className="relative h-screen w-full">
        {/* Stage background image */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/stage.png')",
          }}
        />

        {/* YouTube video iframe positioned in the center black area of the stage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <iframe
              src="https://player.twitch.tv/?channel=shakalei&parent=localhost"
              height="480"
              width="720"
            ></iframe>
          </div>
        </div>

        {/* Currently Playing Artist Info */}
        <div className="absolute bottom-8 left-8 z-10">
          <div className="rounded-lg border border-amber-300/30 bg-black/70 p-4 text-white backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <div>
                  <p className="font-medium text-amber-300 text-sm">
                    Now Playing
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/ens/plswork.catmisha.eth")}
                    className="cursor-pointer text-left font-bold text-lg transition-colors duration-200 hover:text-amber-300"
                  >
                    plswork.catmisha.eth
                  </button>
                  <p className="text-gray-300 text-sm">
                    Green Room Set (Maka's Birthday, Rome)
                  </p>
                </div>
              </div>
              <GiftPopover
                recipientAddress="0x1234567890123456789012345678901234567890"
                recipientName="plswork.catmisha.eth"
                theme="amber"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PIT Section - Pending artists area */}
      <div
        className="relative h-screen w-full bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/pit.png')",
        }}
      >
        {/* Clickable artist positions - positioned on music stands */}
        {pendingArtists.map((artist) => (
          <button
            type="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleArtistClick(artist.id);
              }
            }}
            key={artist.id}
            className="group absolute h-16 w-16 cursor-pointer"
            style={{
              left: `${artist.x}%`,
              top: `${artist.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => handleArtistClick(artist.id)}
          >
            {/* Artist avatar/circle */}
            <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-amber-300 bg-amber-500 bg-opacity-80 shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:bg-amber-400">
              <div className="text-center">
                <div className="font-bold text-white text-xs">
                  {artist.name}
                </div>
              </div>
            </div>

            {/* Pulse animation for pending status */}
            <div className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-15" />

            {/* Tooltip on hover */}
            <div className="-top-8 -translate-x-1/2 absolute left-1/2 transform whitespace-nowrap rounded bg-black bg-opacity-90 px-2 py-1 text-white text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {artist.id}
            </div>
          </button>
        ))}
      </div>

      {/* Global Donations Feed Section */}
      <GlobalDonationsFeed />
    </div>
  );
}
