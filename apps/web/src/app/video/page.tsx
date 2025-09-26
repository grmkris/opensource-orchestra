"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
      <h1 className="text-3xl font-bold mb-4">Uploaded Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <Link
            key={video.key}
            href={`/video/${encodeURIComponent(video.key)}`}
          >
            <div className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="bg-black h-48 flex items-center justify-center">
                <span className="text-white text-lg">▶</span>
              </div>
              <div className="p-4">
                <p className="text-sm truncate">{video.key}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
