import {
	HeadObjectCommand,
	ListObjectsV2Command,
	S3Client,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
	region: "us-east-1",
	endpoint: "https://o3-rc2.akave.xyz",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

export async function GET() {
	try {
		const listObjectsCommand = new ListObjectsV2Command({
			Bucket: process.env.AWS_S3_BUCKET_NAME!,
		});

		const { Contents } = await s3Client.send(listObjectsCommand);

		if (!Contents) {
			return NextResponse.json({ videos: [] });
		}

		const videos = await Promise.all(
			Contents.filter((item) => item.Key?.match(/\.(mp4|webm|avi|mov)$/i)).map(
				async (video) => {
					try {
						// Get video metadata
						const headCommand = new HeadObjectCommand({
							Bucket: process.env.AWS_S3_BUCKET_NAME!,
							Key: video.Key!,
						});
						const headResponse = await s3Client.send(headCommand);

						return {
							key: video.Key!,
							url: `/api/videos/stream/${encodeURIComponent(video.Key!)}`,
							size: headResponse.ContentLength || 0,
							lastModified: video.LastModified,
							contentType: headResponse.ContentType || "video/mp4",
						};
					} catch (error) {
						console.error(`Error getting metadata for ${video.Key}:`, error);
						return null;
					}
				},
			),
		);

		// Filter out null values
		const validVideos = videos.filter((video) => video !== null);

		return NextResponse.json({ videos: validVideos });
	} catch (error) {
		console.error("Error listing videos:", error);
		return NextResponse.json(
			{ error: "Failed to list videos." },
			{ status: 500 },
		);
	}
}
