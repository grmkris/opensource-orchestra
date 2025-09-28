/**
 * Utilities for parsing and handling livestream URLs
 */

export type LivestreamPlatform = "twitch" | "youtube" | "other";

export interface LivestreamInfo {
	platform: LivestreamPlatform;
	embedUrl?: string;
	originalUrl: string;
	channelId?: string;
	videoId?: string;
}

/**
 * Detect the platform from a livestream URL
 */
export function detectPlatform(url: string): LivestreamPlatform {
	if (!url) return "other";

	const normalizedUrl = url.toLowerCase();

	if (normalizedUrl.includes("twitch.tv")) {
		return "twitch";
	}

	if (
		normalizedUrl.includes("youtube.com") ||
		normalizedUrl.includes("youtu.be")
	) {
		return "youtube";
	}

	return "other";
}

/**
 * Extract Twitch channel name from various URL formats
 */
function extractTwitchChannel(url: string): string | null {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;

		// Handle different Twitch URL formats:
		// https://twitch.tv/channelname
		// https://www.twitch.tv/channelname
		// https://twitch.tv/channelname/
		const match = pathname.match(/^\/([^/]+)\/?$/);
		if (match?.[1] && match[1] !== "directory" && match[1] !== "p") {
			return match[1];
		}

		return null;
	} catch (_error) {
		return null;
	}
}

/**
 * Extract YouTube video ID or channel ID from various URL formats
 */
function extractYouTubeInfo(
	url: string,
): { videoId?: string; channelId?: string } | null {
	try {
		const urlObj = new URL(url);

		// Handle YouTube video URLs
		if (urlObj.hostname.includes("youtube.com")) {
			// https://www.youtube.com/watch?v=VIDEO_ID
			const videoId = urlObj.searchParams.get("v");
			if (videoId) {
				return { videoId };
			}

			// https://www.youtube.com/live/VIDEO_ID
			const liveMatch = urlObj.pathname.match(/^\/live\/([^/]+)/);
			if (liveMatch) {
				return { videoId: liveMatch[1] };
			}

			// https://www.youtube.com/embed/VIDEO_ID
			const embedMatch = urlObj.pathname.match(/^\/embed\/([^/]+)/);
			if (embedMatch) {
				return { videoId: embedMatch[1] };
			}

			// https://www.youtube.com/@channelname or https://www.youtube.com/c/channelname
			const channelMatch = urlObj.pathname.match(
				/^\/@([^/]+)|^\/c\/([^/]+)|^\/channel\/([^/]+)/,
			);
			if (channelMatch) {
				const channelId = channelMatch[1] || channelMatch[2] || channelMatch[3];
				return { channelId };
			}
		}

		// Handle youtu.be URLs
		if (urlObj.hostname === "youtu.be") {
			// https://youtu.be/VIDEO_ID
			const videoId = urlObj.pathname.slice(1);
			if (videoId) {
				return { videoId };
			}
		}

		return null;
	} catch (_error) {
		return null;
	}
}

/**
 * Generate Twitch embed URL
 */
function generateTwitchEmbedUrl(channel: string, domain: string): string {
	const params = new URLSearchParams({
		channel,
		parent: domain,
		muted: "true",
		autoplay: "false",
	});

	return `https://player.twitch.tv/?${params.toString()}`;
}

/**
 * Generate YouTube embed URL
 */
function generateYouTubeEmbedUrl(videoId?: string, channelId?: string): string {
	if (videoId) {
		const params = new URLSearchParams({
			autoplay: "0",
			modestbranding: "1",
			rel: "0",
		});
		return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
	}

	if (channelId) {
		const params = new URLSearchParams({
			autoplay: "0",
			modestbranding: "1",
			rel: "0",
		});
		return `https://www.youtube.com/embed/live_stream?channel=${channelId}&${params.toString()}`;
	}

	return "";
}

/**
 * Parse a livestream URL and return embed information
 */
export function parseLivestreamUrl(
	url: string,
	domain = "localhost",
): LivestreamInfo {
	if (!url) {
		return {
			platform: "other",
			originalUrl: url,
		};
	}

	const platform = detectPlatform(url);

	switch (platform) {
		case "twitch": {
			const channel = extractTwitchChannel(url);
			if (channel) {
				return {
					platform: "twitch",
					embedUrl: generateTwitchEmbedUrl(channel, domain),
					originalUrl: url,
					channelId: channel,
				};
			}
			break;
		}

		case "youtube": {
			const info = extractYouTubeInfo(url);
			if (info) {
				const embedUrl = generateYouTubeEmbedUrl(info.videoId, info.channelId);
				if (embedUrl) {
					return {
						platform: "youtube",
						embedUrl,
						originalUrl: url,
						videoId: info.videoId,
						channelId: info.channelId,
					};
				}
			}
			break;
		}
	}

	// Fallback for unsupported platforms or invalid URLs
	return {
		platform: "other",
		originalUrl: url,
	};
}

/**
 * Check if a URL can be embedded
 */
export function canEmbed(url: string): boolean {
	const platform = detectPlatform(url);
	return platform === "twitch" || platform === "youtube";
}

/**
 * Get the domain from window.location or fallback
 */
export function getCurrentDomain(): string {
	if (typeof window !== "undefined") {
		return window.location.hostname;
	}
	return "localhost";
}
