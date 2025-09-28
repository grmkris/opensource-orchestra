"use client";

import { useEffect, useRef, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import styles from "./hero.module.css";

export default function HeroPage() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollY, setScrollY] = useState(0);

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
				backdrop.style.transform = `translate(-50%, -50%) translateX(${
					xPercent * -0.5
				}px) translateY(${yPercent * -0.3}px)`;
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
				className="relative h-screen w-full overflow-hidden bg-amber-300"
				style={{
					transform: `translateY(${scrollY * 0.5}px)`,
				}}
			>
				<div className="absolute inset-0">
					<div className={styles.hero_devcon_7_background__M_iqf}>
						{/* Backdrop Image - Covers entire screen */}
						<div
							className={styles.hero_backdrop__9Yayu}
							style={{
								transform: `translate(-50%, -50%) translateY(${
									scrollY * 0.2
								}px)`,
							}}
						>
							<img
								alt="Infinite Garden leading to Southeast Asia"
								width="1978"
								height="1423"
								src="https://devcon.org/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Fbackdrop.f0972b01.png&w=3840&q=75"
								className="h-full w-full object-cover"
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

										{/* Title */}
										<CardItem translateZ="100" className="mb-3 text-center">
											<div className="mt-1 flex items-center justify-center gap-2">
												<div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
												<span className="text-sm text-white/80">LIVE</span>
											</div>
										</CardItem>

										{/* Stream iframe */}
										<CardItem
											translateZ="150"
											rotateX={5}
											className="relative overflow-hidden rounded-lg shadow-xl"
										>
											<iframe
												src="https://www.youtube.com/watch?v=8B22y_sLG3I"
												height="480"
												width="720"
												className="h-auto max-h-[480px] w-full max-w-[720px] rounded-lg"
												style={{
													aspectRatio: "16/9",
													minWidth: "320px",
													minHeight: "180px",
												}}
											/>

											{/* Overlay sparkles */}
											<CardItem
												translateZ="200"
												rotateY={20}
												rotateX={20}
												className="absolute top-2 right-2 animate-bounce text-2xl text-yellow-300"
											>
												✨
											</CardItem>
											<CardItem
												translateZ="200"
												rotateY={-20}
												rotateX={-20}
												className="absolute bottom-2 left-2 animate-pulse text-xl text-yellow-300"
											>
												🌙
											</CardItem>
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
