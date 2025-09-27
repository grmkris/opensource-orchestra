"use client";

import { useRouter } from "next/navigation";
import { GlobalDonationsFeed } from "@/components/ens/GlobalDonationsFeed";
import { GiftPopover } from "@/components/ens/GiftPopover";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Home() {
	const router = useRouter();

	// Artist data positioned precisely on music stands in pit.png
	const pendingArtists = [
		{ id: "artist1.eth", name: "DJ Crypto", x: 20, y: 48 }, // Front left stand
		{ id: "artist2.eth", name: "The Degens", x: 50, y: 52 }, // Front center stand
		{ id: "artist3.eth", name: "NFT Beats", x: 80, y: 48 }, // Front right stand
		{ id: "artist4.eth", name: "Web3 Symphony", x: 35, y: 38 }, // Back left stand
		{ id: "artist5.eth", name: "Blockchain Band", x: 65, y: 38 }, // Back right stand
	];

	const handleArtistClick = (artistId: string) => {
		// Navigate to ENS profile page
		router.push(`/ens/${artistId}`);
	};

	const iframeRef = useRef<HTMLIFrameElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const [curtainsOpen, setCurtainsOpen] = useState(false);

	useEffect(() => {
		if (titleRef.current) {
			gsap.from(titleRef.current, { y: -50, opacity: 0, duration: 1.2, ease: "power3.out" });
		}
	}, []);

	useEffect(() => {
		// Load YouTube API
		const tag = document.createElement("script");
		tag.src = "https://www.youtube.com/iframe_api";
		document.body.appendChild(tag);

		// When API ready
		(window as any).onYouTubeIframeAPIReady = () => {
			const player = new (window as any).YT.Player("yt-player", {
				events: {
					onStateChange: (e: any) => {
						if (e.data === (window as any).YT.PlayerState.PLAYING) {
							setCurtainsOpen(true);
						} else if (
							e.data === (window as any).YT.PlayerState.PAUSED ||
							e.data === (window as any).YT.PlayerState.ENDED
						) {
							setCurtainsOpen(false);
						}
					},
				},
			});
			iframeRef.current = player;
		};
	}, []);

	return (
		<div className="w-full bg-black">
			<div className="text-center text-white text-lg font-semibold py-4">
				Welcome to the Web3 Symphony! Enjoy the performance and support your favorite artists.
			</div>
			
			{/* Stage Section */}
			<div className="relative h-[90vh] w-full">
				<div
					className="absolute inset-0 bg-cover bg-fit bg-no-repeat"
					style={{ backgroundImage: "url('/iterate-two.png')" }}
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none z-0" />
				<button
  onClick={() => setCurtainsOpen(!curtainsOpen)}
  className="absolute top-4 left-8 bg-black/50 text-white px-4 py-2 rounded-full z-30 hover:bg-amber-500/70 transition-colors"
>
Curtains {curtainsOpen ? "Close" : "Open "}
</button>
				<nav className="absolute top-4 right-8 flex space-x-6 bg-black/50 px-4 py-2 rounded-full z-30">
					<a href="#" className="text-white hover:text-amber-300 transition-colors">Home</a>
					<a href="#global" className="text-white hover:text-amber-300 transition-colors">Global</a>
					<a href="#live" className="text-white hover:text-amber-300 transition-colors">Live</a>
				</nav>

				{/* Stage with curtains + video */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="-translate-x-[3%] relative h-[58%] w-[62%] transform">
						
						<div className="relative h-full w-full overflow-hidden rounded-lg shadow-2xl border-0">
							{/* Curtains */}
							<motion.div
								className="absolute top-0 left-0 h-full w-1/2 z-20"
								style={{
									backgroundImage:
										"url('https://media.istockphoto.com/id/173588123/photo/theatre-curtains-background.jpg?s=612x612&w=0&k=20&c=q2STzMpACesSif9K_sUmow6nGeGnO-QNuqA9ZwEr0vQ=')",
									backgroundSize: "cover",
									pointerEvents: "none",
								}}
								initial={{ x: 0 }}
								animate={{ x: curtainsOpen ? "-100%" : 0 }}
								transition={{ duration: 1 }}
							/>
							<motion.div
								className="absolute top-0 right-0 h-full w-1/2 z-20"
								style={{
									backgroundImage:
										"url('https://media.istockphoto.com/id/173588123/photo/theatre-curtains-background.jpg?s=612x612&w=0&k=20&c=q2STzMpACesSif9K_sUmow6nGeGnO-QNuqA9ZwEr0vQ=')",
									backgroundSize: "cover",
									backgroundPosition: "right",
									pointerEvents: "none",
								}}
								initial={{ x: 0 }}
								animate={{ x: curtainsOpen ? "100%" : 0 }}
								transition={{ duration: 1 }}
							/>

							{/* YouTube iframe */}
							<iframe
								id="yt-player"
								ref={iframeRef}
								className="h-full w-full rounded-lg border-0"
								src="https://www.youtube.com/embed/o_N5JQYHJXk?controls=0&autoplay=1&loop=1&playlist=o_N5JQYHJXk&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&enablejsapi=1&autohide=1"
								title="YouTube video player"
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerPolicy="strict-origin-when-cross-origin"
								allowFullScreen
							/>
						</div>
					</div>
				</div>

				{/* Now Playing Info */}
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

			{/* PIT Section */}
			<div
				className="relative h-screen w-full bg-center bg-cover bg-no-repeat"
				style={{ backgroundImage: "url('/pit.png')" }}
			>
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
						<div className="flex h-full w-full items-center justify-center rounded-full border-2 border-amber-300 bg-amber-500 bg-opacity-80 shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:bg-amber-400">
							<div className="text-center">
								<div className="font-bold text-white text-xs">{artist.name}</div>
							</div>
						</div>
						<div className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-15" />
						<div className="-top-8 -translate-x-1/2 absolute left-1/2 transform whitespace-nowrap rounded bg-black bg-opacity-90 px-2 py-1 text-white text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100">
							{artist.id}
						</div>
					</button>
				))}
			</div>

			{/* Global Donations Feed */}
			<GlobalDonationsFeed />
		</div>
	);
}