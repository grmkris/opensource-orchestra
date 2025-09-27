"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Video {
	key: string;
	url: string;
	title?: string;
	duration?: number;
	thumbnail?: string;
	size?: number;
	contentType?: string;
}

export default function VideoPlayerPage() {
	const params = useParams();
	const videoKey = params.videoKey as string;
	const videoRef = useRef<HTMLVideoElement>(null);

	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [showControls, setShowControls] = useState(true);
	const [buffered, setBuffered] = useState(0);
	const [isBuffering, setIsBuffering] = useState(false);

	useEffect(() => {
		if (!videoKey) return;

		const fetchVideoUrl = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/videos");
				if (!response.ok) {
					throw new Error("Failed to fetch video data");
				}
				const data = await response.json();
				const decodedKey = decodeURIComponent(videoKey);
				const video = data.videos.find((v: Video) => v.key === decodedKey);

				if (video) {
					// Use the streaming URL directly
					setVideoUrl(video.url);
				} else {
					throw new Error("Video not found");
				}
			} catch (err: any) {
				console.error("Error fetching video:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchVideoUrl();
	}, [videoKey]);

	// Video event handlers
	const handlePlayPause = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const handleTimeUpdate = () => {
		if (videoRef.current) {
			setCurrentTime(videoRef.current.currentTime);

			// Update buffered progress
			if (videoRef.current.buffered.length > 0) {
				const bufferedEnd = videoRef.current.buffered.end(
					videoRef.current.buffered.length - 1,
				);
				const duration = videoRef.current.duration;
				if (duration > 0) {
					setBuffered((bufferedEnd / duration) * 100);
				}
			}
		}
	};

	const handleLoadedMetadata = () => {
		if (videoRef.current) {
			setDuration(videoRef.current.duration);
		}
	};

	const handleWaiting = () => {
		setIsBuffering(true);
	};

	const handleCanPlay = () => {
		setIsBuffering(false);
	};

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const time = Number.parseFloat(e.target.value);
		if (videoRef.current) {
			videoRef.current.currentTime = time;
			setCurrentTime(time);
		}
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const vol = Number.parseFloat(e.target.value);
		setVolume(vol);
		if (videoRef.current) {
			videoRef.current.volume = vol;
		}
	};

	const toggleFullscreen = () => {
		if (videoRef.current) {
			if (!isFullscreen) {
				videoRef.current.requestFullscreen();
				setIsFullscreen(true);
			} else {
				document.exitFullscreen();
				setIsFullscreen(false);
			}
		}
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	// Hide controls after 3 seconds of inactivity
	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (showControls && isPlaying) {
			timeout = setTimeout(() => setShowControls(false), 3000);
		}
		return () => clearTimeout(timeout);
	}, [showControls, isPlaying]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-black">
				<div className="text-white text-xl">Loading video...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-black">
				<div className="text-red-500 text-xl">{error}</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black">
			<div className="container mx-auto py-4">
				{/* Video Player Container */}
				<div
					className="relative mx-auto max-w-6xl overflow-hidden rounded-lg bg-black"
					onMouseEnter={() => setShowControls(true)}
					onMouseLeave={() => isPlaying && setShowControls(false)}
					onMouseMove={() => setShowControls(true)}
				>
					{videoUrl && (
						<>
							<video
								ref={videoRef}
								className="h-auto w-full"
								onTimeUpdate={handleTimeUpdate}
								onLoadedMetadata={handleLoadedMetadata}
								onPlay={() => setIsPlaying(true)}
								onPause={() => setIsPlaying(false)}
								onEnded={() => setIsPlaying(false)}
								onWaiting={handleWaiting}
								onCanPlay={handleCanPlay}
								onCanPlayThrough={handleCanPlay}
								preload="metadata"
								crossOrigin="anonymous"
							>
								<source src={videoUrl} type="video/mp4" />
								Your browser does not support the video tag.
							</video>

							{/* Buffering Indicator */}
							{isBuffering && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/50">
									<div className="text-lg text-white">Buffering...</div>
								</div>
							)}

							{/* Custom Controls Overlay */}
							<div
								className={`absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
									showControls ? "opacity-100" : "opacity-0"
								}`}
							>
								{/* Progress Bar */}
								<div className="mb-4">
									<div className="relative h-1 w-full rounded bg-gray-600">
										{/* Buffered Progress */}
										<div
											className="absolute top-0 left-0 h-full rounded bg-gray-400"
											style={{ width: `${buffered}%` }}
										/>
										{/* Current Progress */}
										<div
											className="absolute top-0 left-0 h-full rounded bg-red-600"
											style={{ width: `${(currentTime / duration) * 100}%` }}
										/>
										<input
											type="range"
											min="0"
											max={duration || 0}
											value={currentTime}
											onChange={handleSeek}
											className="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
										/>
									</div>
								</div>

								{/* Rest of your controls remain the same... */}
								<div className="flex items-center justify-between text-white">
									<div className="flex items-center space-x-4">
										{/* Play/Pause Button */}
										<button
											onClick={handlePlayPause}
											className="transition-colors hover:text-red-500"
											disabled={isBuffering}
										>
											{isPlaying ? (
												<svg
													className="h-6 w-6"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
														clipRule="evenodd"
													/>
												</svg>
											) : (
												<svg
													className="h-6 w-6"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
														clipRule="evenodd"
													/>
												</svg>
											)}
										</button>

										{/* Time Display */}
										<div className="text-sm">
											{formatTime(currentTime)} / {formatTime(duration)}
										</div>

										{/* Volume Control */}
										<div className="flex items-center space-x-2">
											<svg
												className="h-5 w-5"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.47 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.47l3.913-3.824a1 1 0 011.617.824zM12 6.414a1 1 0 011.414 0 5 5 0 010 7.072A1 1 0 0112 12.072 3 3 0 0012 7.928z"
													clipRule="evenodd"
												/>
											</svg>
											<input
												type="range"
												min="0"
												max="1"
												step="0.1"
												value={volume}
												onChange={handleVolumeChange}
												className="slider h-1 w-16 appearance-none rounded-lg bg-gray-600"
											/>
										</div>
									</div>

									{/* Fullscreen Button */}
									<button
										onClick={toggleFullscreen}
										className="transition-colors hover:text-red-500"
									>
										<svg
											className="h-6 w-6"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</div>
							</div>

							{/* Click to Play/Pause Overlay */}
							<div
								className="absolute inset-0 flex cursor-pointer items-center justify-center"
								onClick={handlePlayPause}
							>
								{!isPlaying && !isBuffering && (
									<div className="rounded-full bg-black/50 p-4">
										<svg
											className="h-12 w-12 text-white"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								)}
							</div>
						</>
					)}
				</div>

				{/* Video Info */}
				<div className="mx-auto mt-4 max-w-6xl px-4">
					<h1 className="mb-2 font-bold text-2xl text-white">
						{decodeURIComponent(videoKey)}
					</h1>
					<div className="text-gray-400 text-sm">
						Video • {formatTime(duration)}
					</div>
				</div>
			</div>
		</div>
	);
}
