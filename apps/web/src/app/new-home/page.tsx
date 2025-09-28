"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ENSAvatar } from "@/components/ens/ENSAvatar";
import { GiftPopover } from "@/components/ens/GiftPopover";
import { PyusdGiftPopover } from "@/components/ens/PyusdGiftPopover";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import styles from "./hero.module.css";

export default function HeroPage() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollY, setScrollY] = useState(0);
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

	// Fireflies animation (keeping your existing logic)
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const fireflies: Array<{
			x: number;
			y: number;
			vx: number;
			vy: number;
			opacity: number;
			opacityDirection: number;
		}> = [];

		for (let i = 0; i < 30; i++) {
			fireflies.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				opacity: Math.random(),
				opacityDirection: Math.random() > 0.5 ? 1 : -1,
			});
		}

		function animate() {
			if (!ctx || !canvas) return;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			fireflies.forEach((firefly) => {
				firefly.x += firefly.vx;
				firefly.y += firefly.vy;

				if (firefly.x <= 0 || firefly.x >= canvas.width) firefly.vx *= -1;
				if (firefly.y <= 0 || firefly.y >= canvas.height) firefly.vy *= -1;

				firefly.opacity += firefly.opacityDirection * 0.02;
				if (firefly.opacity <= 0 || firefly.opacity >= 1) {
					firefly.opacityDirection *= -1;
				}

				ctx.beginPath();
				ctx.arc(firefly.x, firefly.y, 2, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 255, 150, ${firefly.opacity})`;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(firefly.x, firefly.y, 8, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 255, 150, ${firefly.opacity * 0.1})`;
				ctx.fill();
			});

			requestAnimationFrame(animate);
		}

		const resizeCanvas = () => {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);
		animate();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
		};
	}, []);

	// Scroll parallax effect
	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Mouse parallax effect
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const { clientX, clientY } = e;
			const { innerWidth, innerHeight } = window;

			const xPercent = (clientX / innerWidth - 0.5) * 100;
			const yPercent = (clientY / innerHeight - 0.5) * 100;

			const backdrop = document.querySelector(
				`.${styles.hero_backdrop__9Yayu}`,
			) as HTMLElement;
			if (backdrop) {
				// Preserve the zoom animation by using CSS custom properties for parallax
				backdrop.style.setProperty("--parallax-x", `${xPercent * -0.5}px`);
				backdrop.style.setProperty("--parallax-y", `${yPercent * -0.3}px`);
			}

			const leftBush = document.querySelector(
				`.${styles.hero_left__MMFhv}`,
			) as HTMLElement;
			const rightBush = document.querySelector(
				`.${styles.hero_right__pFSLQ}`,
			) as HTMLElement;

			if (leftBush) {
				leftBush.style.transform = `translateX(${
					xPercent * -0.3
				}px) translateY(${yPercent * -0.4}px)`;
			}

			if (rightBush) {
				rightBush.style.transform = `translateX(${
					xPercent * -0.3
				}px) translateY(${yPercent * -0.4}px)`;
			}

			// Add subtle parallax to the stream container wrapper (separate from 3D card transforms)
			const streamContainer = document.querySelector(
				".stream-container",
			) as HTMLElement;
			if (streamContainer) {
				// Use CSS custom properties to avoid conflicting with 3D card transforms
				streamContainer.style.setProperty(
					"--parallax-x",
					`${xPercent * -0.05}px`,
				);
				streamContainer.style.setProperty(
					"--parallax-y",
					`${yPercent * -0.1}px`,
				);

				// Apply a more subtle parallax that works alongside the 3D card
				const _currentTransform = streamContainer.style.transform;
				const baseTransform = "translate(-50%, -50%)";
				streamContainer.style.transform = `${baseTransform} translateX(calc(var(--parallax-x, 0px))) translateY(calc(var(--parallax-y, 0px)))`;
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<>
			{/* Hero Section with Parallax */}
			<div
				ref={containerRef}
				className="relative h-screen w-full overflow-hidden bg-amber-300 pt-16"
				style={{
					transform: `translateY(${scrollY * 0.5}px)`,
				}}
			>
				<div className="absolute inset-0">
					<div className={styles.hero_devcon_7_background__M_iqf}>
						{/* Backdrop Image - Covers entire screen */}
						<div
							className={styles.hero_backdrop__9Yayu}
							style={
								{
									"--scroll-y": `${scrollY * 0.2}px`,
								} as React.CSSProperties
							}
						>
							<img
								alt="Infinite Garden leading to Southeast Asia"
								width="1978"
								height="1223"
								src="./backdrop.png"
								className="h-full w-full object-contain"
							/>
							<div className="absolute inset-0">
								<canvas
									ref={canvasRef}
									id="lower-fireflies"
									className="h-full w-full"
								/>
							</div>
						</div>

						{/* Left Bush - Extends beyond left edge */}
						<div
							className={styles.hero_left__MMFhv}
							style={{
								transform: `translateY(${scrollY * 0.3}px)`,
							}}
						>
							<img
								alt="Left Bush"
								width="944"
								height="1646"
								src="https://devcon.org/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Fleft.feb2c158.png&w=1920&q=75"
								className="h-full w-full object-cover object-right-bottom"
							/>
						</div>

						{/* Right Bush - Extends beyond right edge */}
						<div
							className={styles.hero_right__pFSLQ}
							style={{
								transform: `translateY(${scrollY * 0.3}px)`,
							}}
						>
							<img
								alt="Right Bush"
								width="915"
								height="1546"
								src="https://devcon.org/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Fright.75682aba.png&w=1920&q=75"
								className="h-full w-full object-cover object-left-bottom"
							/>
						</div>
						{/* PIT Section - Pending artists area */}

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
								className="group absolute z-40 h-14 w-14 cursor-pointer"
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

						{/* Twitch Stream Container with 3D Effects - Positioned at top 30% */}
						<div
							className="stream-container absolute top-[30%] left-1/2 z-40"
							style={{ transform: "translate(-50%, -50%)" }}
						>
							<CardContainer className="inter-var" containerClassName="py-0">
								<CardBody className="group/card relative h-auto w-auto rounded-xl border-black/[0.1] bg-transparent p-6 hover:shadow-2xl hover:shadow-emerald-500/[0.1]">
									{/* Magical Frame Effect */}
									<CardItem
										translateZ="100"
										className="-inset-4 absolute animate-pulse rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400 opacity-75 blur-sm"
									>
										<div />
									</CardItem>
									<CardItem
										translateZ="80"
										className="-inset-2 absolute rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 opacity-50 blur-sm"
									>
										<div />
									</CardItem>

									{/* Inner glow */}
									<CardItem
										translateZ="60"
										className="-inset-1 absolute rounded-lg bg-white opacity-20 blur-sm"
									>
										<div />
									</CardItem>

									{/* Main container */}
									<CardItem
										translateZ="50"
										className="relative rounded-lg border border-white/30 bg-black/20 p-4 shadow-2xl backdrop-blur-sm"
									>
										{/* Decorative corners */}
										<CardItem
											translateZ="120"
											rotateX={10}
											rotateY={-10}
											className="-top-2 -left-2 absolute h-6 w-6 rounded-tl-lg border-yellow-300 border-t-2 border-l-2"
										>
											<div />
										</CardItem>
										<CardItem
											translateZ="120"
											rotateX={10}
											rotateY={10}
											className="-top-2 -right-2 absolute h-6 w-6 rounded-tr-lg border-yellow-300 border-t-2 border-r-2"
										>
											<div />
										</CardItem>
										<CardItem
											translateZ="120"
											rotateX={-10}
											rotateY={-10}
											className="-bottom-2 -left-2 absolute h-6 w-6 rounded-bl-lg border-yellow-300 border-b-2 border-l-2"
										>
											<div />
										</CardItem>
										<CardItem
											translateZ="120"
											rotateX={-10}
											rotateY={10}
											className="-bottom-2 -right-2 absolute h-6 w-6 rounded-br-lg border-yellow-300 border-r-2 border-b-2"
										>
											<div />
										</CardItem>

										{/* Stream iframe */}
										<CardItem
											translateZ="150"
											rotateX={5}
											className="relative overflow-hidden rounded-lg shadow-xl"
										>
											<div>
												<iframe
													width="560"
													height="315"
													src="https://www.youtube.com/embed/hyWmLBrLcow?si=Pj8cVKlyaboc-sAl"
													title="YouTube video player"
													// frameborder="0"
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
													// referrerpolicy="strict-origin-when-cross-origin"
													// allowfullscreen
												/>
											</div>
										</CardItem>

										{/* Bottom decoration */}
										<CardItem
											translateZ="80"
											className="mt-3 flex justify-center"
										>
											<div className="flex gap-1">
												<div className="h-2 w-2 animate-pulse rounded-full bg-yellow-300 delay-0" />
												<div className="h-2 w-2 animate-pulse rounded-full bg-yellow-300 delay-150" />
												<div className="h-2 w-2 animate-pulse rounded-full bg-yellow-300 delay-300" />
											</div>
										</CardItem>
									</CardItem>
								</CardBody>
							</CardContainer>
						</div>
						<div className="absolute bottom-8 left-8 z-50">
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

						{/* Content Overlay */}
						<div className="absolute inset-0 z-30 flex items-end justify-center pb-20">
							{/* Your other content here */}
						</div>
					</div>
				</div>
			</div>

			{/* Next Section */}
			<div className="relative z-40 min-h-screen bg-white">
				<div className="container mx-auto px-4 py-20">
					<h2 className="mb-8 font-bold text-4xl">Next Section</h2>
					<p className="mb-6 text-lg">
						This section will have a parallax effect when scrolling.
					</p>
					<div className="space-y-8">
						{Array.from({ length: 10 }, (_, i) => (
							<div key={i} className="rounded-lg bg-gray-100 p-6">
								<h3 className="mb-2 font-semibold text-xl">
									Content Block {i + 1}
								</h3>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
									do eiusmod tempor incididunt ut labore et dolore magna aliqua.
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
