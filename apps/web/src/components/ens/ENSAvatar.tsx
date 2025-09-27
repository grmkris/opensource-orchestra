"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader } from "@/components/loader";

interface ENSAvatarProps {
	src?: string;
	alt: string;
	size?: "sm" | "md" | "lg";
	className?: string;
	rounded?: boolean;
}

const sizeMap = {
	sm: { width: 48, height: 48, className: "h-12 w-12" },
	md: { width: 96, height: 96, className: "h-24 w-24" },
	lg: { width: 128, height: 128, className: "h-32 w-32" },
};

export function ENSAvatar({
	src,
	alt,
	size = "md",
	className = "",
	rounded = true,
}: ENSAvatarProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const { width, height, className: sizeClassName } = sizeMap[size];
	const roundedClass = rounded ? "rounded-full" : "";

	const handleLoad = () => {
		setIsLoading(false);
		setHasError(false);
	};

	const handleError = () => {
		setIsLoading(false);
		setHasError(true);
	};

	if (!src || hasError) {
		return (
			<div
				className={`${sizeClassName} ${roundedClass} flex items-center justify-center bg-muted text-muted-foreground text-sm ${className}`}
			>
				{hasError ? "Error" : rounded ? "No Avatar" : "No Header"}
			</div>
		);
	}

	return (
		<div className={`relative ${className}`} style={{ width, height }}>
			{isLoading && (
				<div
					className={`absolute inset-0 flex items-center justify-center ${roundedClass} bg-muted`}
				>
					<Loader className="h-4 w-4" />
				</div>
			)}
			<Image
				src={src}
				alt={alt}
				width={width}
				height={height}
				className={`h-full w-full ${roundedClass} object-cover ${isLoading ? "opacity-0" : "opacity-100"}`}
				onLoad={handleLoad}
				onError={handleError}
				unoptimized={src.startsWith("data:")}
			/>
		</div>
	);
}
