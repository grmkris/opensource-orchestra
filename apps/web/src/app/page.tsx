"use client";

import { useRouter } from "next/navigation";
import { ENSAvatar } from "@/components/ens/ENSAvatar";
import { GiftPopover } from "@/components/ens/GiftPopover";
import { GlobalDonationsFeed } from "@/components/ens/GlobalDonationsFeed";
import { PyusdGiftPopover } from "@/components/ens/PyusdGiftPopover";

export default function Home() {
	const router = useRouter();

	// Artist data positioned precisely on visible music stands in pit.png
	const pendingArtists = [
		{ id: "vitalik.eth", x: 20, y: 62, avatar: "/artist1.png" }, // Left front stand
		{ id: "sassal.eth", x: 50, y: 66, avatar: "/artist2.png" }, // Center front stand
		{ id: "cdixon.eth", x: 80, y: 62, avatar: "/artist3.png" }, // Right front stand
		{ id: "punk6529.eth", x: 30, y: 54, avatar: "/artist4.png" }, // Left back stand
		{ id: "pranksy.eth", x: 70, y: 54, avatar: "/artist5.png" }, // Right back stand
		{ id: "coopahtroopa.eth", x: 50, y: 48, avatar: "/artist6.png" }, // Center back stand
	];

	const handleArtistClick = (artistId: string) => {
		// Navigate to public profile page
		router.push(`/profile/${artistId}`);
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
				{/* 						<iframe
							src="https://player.twitch.tv/?channel=shakalei&parent=opensource-orchestra-web.vercel.app"
							height="480"
							width="720"
							title="Shakalei"
						/>
 */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div>
					<iframe width="720" height="480" src="https://www.youtube.com/watch?v=hyWmLBrLcow" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"/>
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
										onClick={() => router.push("/profile/shaka.osopit.eth")}
										className="cursor-pointer text-left font-bold text-lg transition-colors duration-200 hover:text-amber-300"
									>
										shaka.osopit.eth
									</button>
									<p className="text-gray-300 text-sm">
										Green Room Set (Maka's Birthday, Rome)
									</p>
								</div>
							</div>
							<div className="flex space-x-2">
								<GiftPopover
									recipientAddress="0x1234567890123456789012345678901234567890"
									recipientName="shaka.osopit.eth"
									theme="amber"
								/>
								<PyusdGiftPopover
									recipientAddress="0x1234567890123456789012345678901234567890"
									recipientName="shaka.osopit.eth"
									theme="amber"
								/>
							</div>
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
						className="group absolute h-24 w-24 cursor-pointer"
						style={{
							left: `${artist.x}%`,
							top: `${artist.y}%`,
							transform: "translate(-50%, -50%)",
						}}
						onClick={() => handleArtistClick(artist.id)}
					>
						{/* Artist avatar */}
						<div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-amber-300 bg-amber-500/10 shadow-lg transition-all duration-300 group-hover:scale-125">
							<ENSAvatar
								src={artist.avatar}
								alt={`${artist.id} profile picture`}
								size="md"
								className="h-full w-full"
								rounded={true}
							/>
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
