"use client";

import { useMemo } from "react";
import { ExternalLinkIcon, PlayIcon } from "lucide-react";
import { parseLivestreamUrl, getCurrentDomain } from "@/lib/utils/livestream";

interface ENSLivestreamEmbedProps {
	url: string;
	isStreaming: boolean;
	ensName: string;
	showPreview?: boolean;
}

export function ENSLivestreamEmbed({
	url,
	isStreaming,
	ensName,
	showPreview = false,
}: ENSLivestreamEmbedProps) {
	const domain = getCurrentDomain();
	
	const livestreamInfo = useMemo(() => {
		return parseLivestreamUrl(url, domain);
	}, [url, domain]);

	// Don't render if not streaming and not in preview mode
	if (!isStreaming && !showPreview) {
		return null;
	}

	// Don't render if no URL provided
	if (!url) {
		return null;
	}

	const canEmbed = livestreamInfo.platform === "twitch" || livestreamInfo.platform === "youtube";

	// If we can embed, show the iframe
	if (canEmbed && livestreamInfo.embedUrl) {
		return (
			<div
				style={{
					fontFamily:
						"system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
					background: "#ffffff",
					color: "#2f3044",
					border: "2px solid #2f3044",
					borderBottomWidth: "14px",
					borderRadius: "2px",
					maxWidth: "880px",
					lineHeight: "1.35",
					textAlign: "left",
					overflow: "hidden",
					marginBottom: "24px",
				}}
			>
				{/* Header */}
				<div style={{ padding: "28px 32px 16px" }}>
					<div style={{ display: "flex", alignItems: "center", marginBottom: "14px" }}>
						<span
							style={{
								display: "block",
								fontSize: "40px",
								fontWeight: "800",
								letterSpacing: "-0.3px",
								marginRight: "12px",
							}}
						>
							{showPreview ? "Stream Preview" : "Live Stream"}
						</span>
						{isStreaming && !showPreview && (
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									fontSize: "14px",
									fontWeight: "700",
									color: "#dc2626",
									background: "#fef2f2",
									border: "2px solid #dc2626",
									borderRadius: "20px",
									padding: "4px 12px",
								}}
							>
								<span
									style={{
										width: "6px",
										height: "6px",
										borderRadius: "50%",
										background: "#dc2626",
										marginRight: "6px",
										animation: "pulse 2s infinite",
									}}
								/>
								LIVE
							</span>
						)}
					</div>

					{showPreview && (
						<span
							style={{
								display: "block",
								fontSize: "22px",
								fontWeight: "500",
								color: "#2f3044cc",
								marginBottom: "20px",
							}}
						>
							This is how your stream will appear when you go live
						</span>
					)}
				</div>

				{/* Embed Container */}
				<div
					style={{
						position: "relative",
						width: "100%",
						aspectRatio: "16 / 9",
						background: "#000000",
					}}
				>
					{showPreview && !isStreaming ? (
						// Preview placeholder
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: "100%",
								height: "100%",
								background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
								color: "#ffffff",
								flexDirection: "column",
							}}
						>
							<PlayIcon size={48} style={{ marginBottom: "12px", opacity: 0.8 }} />
							<div style={{ textAlign: "center" }}>
								<div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
									{livestreamInfo.platform === "twitch" ? "Twitch" : "YouTube"} Stream Ready
								</div>
								<div style={{ fontSize: "14px", opacity: 0.8 }}>
									Toggle streaming on to go live
								</div>
							</div>
						</div>
					) : (
						// Actual embed
						<iframe
							src={livestreamInfo.embedUrl}
							title={`${ensName} livestream`}
							style={{
								width: "100%",
								height: "100%",
								border: "none",
							}}
							allowFullScreen
							sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
						/>
					)}
				</div>

				{/* Footer */}
				<div style={{ padding: "16px 32px 28px" }}>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<span style={{ fontSize: "14px", fontWeight: "500", color: "#2f3044cc" }}>
								Platform:
							</span>
							<span style={{ fontSize: "14px", fontWeight: "600" }}>
								{livestreamInfo.platform === "twitch" ? "Twitch" : "YouTube"}
							</span>
						</div>
						
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								fontSize: "14px",
								fontWeight: "600",
								color: "#156fb3",
								textDecoration: "none",
								padding: "6px 12px",
								border: "1px solid #156fb3",
								borderRadius: "6px",
								transition: "background-color 0.2s",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#f0f9ff";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "transparent";
							}}
						>
							<span>View on {livestreamInfo.platform === "twitch" ? "Twitch" : "YouTube"}</span>
							<ExternalLinkIcon size={14} />
						</a>
					</div>
				</div>
			</div>
		);
	}

	// For non-embeddable platforms, show a link card when streaming
	if (isStreaming || showPreview) {
		return (
			<div
				style={{
					fontFamily:
						"system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
					background: "#ffffff",
					color: "#2f3044",
					border: "2px solid #2f3044",
					borderBottomWidth: "14px",
					borderRadius: "2px",
					maxWidth: "880px",
					padding: "28px 32px 36px",
					lineHeight: "1.35",
					textAlign: "center",
					marginBottom: "24px",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
					<span
						style={{
							display: "block",
							fontSize: "40px",
							fontWeight: "800",
							letterSpacing: "-0.3px",
							marginRight: "12px",
						}}
					>
						{showPreview ? "Stream Preview" : "Live Stream"}
					</span>
					{isStreaming && !showPreview && (
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								fontSize: "14px",
								fontWeight: "700",
								color: "#dc2626",
								background: "#fef2f2",
								border: "2px solid #dc2626",
								borderRadius: "20px",
								padding: "4px 12px",
							}}
						>
							<span
								style={{
									width: "6px",
									height: "6px",
									borderRadius: "50%",
									background: "#dc2626",
									marginRight: "6px",
									animation: "pulse 2s infinite",
								}}
							/>
							LIVE
						</span>
					)}
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: "100%",
						aspectRatio: "16 / 9",
						maxHeight: "200px",
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						color: "#ffffff",
						borderRadius: "8px",
						marginBottom: "20px",
						flexDirection: "column",
					}}
				>
					<PlayIcon size={48} style={{ marginBottom: "12px", opacity: 0.8 }} />
					<div style={{ textAlign: "center" }}>
						<div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
							External Stream
						</div>
						<div style={{ fontSize: "14px", opacity: 0.8 }}>
							{showPreview ? "Stream will open on external platform" : "Click below to watch"}
						</div>
					</div>
				</div>

				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "8px",
						fontSize: "16px",
						fontWeight: "600",
						color: "#ffffff",
						background: "#156fb3",
						textDecoration: "none",
						padding: "12px 24px",
						borderRadius: "6px",
						transition: "background-color 0.2s",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#1e40af";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "#156fb3";
					}}
				>
					<PlayIcon size={16} />
					<span>{showPreview ? "Preview Stream" : "Watch Stream"}</span>
					<ExternalLinkIcon size={16} />
				</a>
			</div>
		);
	}

	return null;
}