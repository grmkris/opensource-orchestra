"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Video {
	key: string;
	url: string;
}

export default function VideoPage() {
	const [videos, setVideos] = useState<Video[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchVideos = async () => {
			try {
				const response = await fetch("/api/videos");
				if (!response.ok) {
					throw new Error("Failed to fetch videos");
				}
				const data = await response.json();
				setVideos(data.videos);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchVideos();
	}, []);

	if (loading) {
		return (
			<div className="container mx-auto py-10 text-center">Loading...</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-10 text-center text-red-500">
				{error}
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			<h1 className="mb-4 font-bold text-3xl">Uploaded Videos</h1>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{videos.map((video) => (
					<Link
						key={video.key}
						href={`/video/${encodeURIComponent(video.key)}`}
					>
						<div className="cursor-pointer overflow-hidden rounded-lg border transition-shadow hover:shadow-lg">
							<div className="flex h-48 items-center justify-center bg-black">
								<span className="text-lg text-white">▶</span>
							</div>
							<div className="p-4">
								<p className="truncate text-sm">{video.key}</p>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
