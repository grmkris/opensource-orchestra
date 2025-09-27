"use client";

import { TEXT_RECORD_KEYS } from "@/lib/ens/ens-contracts";
import { ENSGalleryField } from "./ENSGalleryField";

interface ENSGallerySectionProps {
	isOwner: boolean;
}

export function ENSGallerySection({ isOwner }: ENSGallerySectionProps) {
	const galleryFields = [
		{ key: TEXT_RECORD_KEYS.ART1, label: "Art 1" },
		{ key: TEXT_RECORD_KEYS.ART2, label: "Art 2" },
		{ key: TEXT_RECORD_KEYS.ART3, label: "Art 3" },
		{ key: TEXT_RECORD_KEYS.ART4, label: "Art 4" },
		{ key: TEXT_RECORD_KEYS.ART5, label: "Art 5" },
		{ key: TEXT_RECORD_KEYS.ART6, label: "Art 6" },
		{ key: TEXT_RECORD_KEYS.ART7, label: "Art 7" },
		{ key: TEXT_RECORD_KEYS.ART8, label: "Art 8" },
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center space-x-2">
				<div className="h-6 w-1 rounded-full bg-blue-500" />
				<h4 className="font-bold text-gray-900 text-lg">Media Gallery</h4>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{galleryFields.map((field) => (
					<ENSGalleryField
						key={field.key}
						artKey={field.key}
						label={field.label}
						isOwner={isOwner}
					/>
				))}
			</div>
		</div>
	);
}
