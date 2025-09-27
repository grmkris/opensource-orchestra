import {
	GetObjectCommand,
	HeadObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { type NextRequest, NextResponse } from "next/server";

const s3Client = new S3Client({
	region: "us-east-1",
	endpoint: "https://o3-rc2.akave.xyz",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ imageKey: string }> },
) {
	const { imageKey } = await params;

	try {
		// Get object metadata first
		const headObjectCommand = new HeadObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET_NAME!,
			Key: decodeURIComponent(imageKey),
		});
		const { ContentLength, ContentType } =
			await s3Client.send(headObjectCommand);

		// Get the image from S3
		const getObjectCommand = new GetObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET_NAME!,
			Key: decodeURIComponent(imageKey),
		});

		const { Body } = await s3Client.send(getObjectCommand);

		if (!Body) {
			return new NextResponse("Image not found", { status: 404 });
		}

		// Convert the stream to bytes
		const _bytes = await Body?.transformToByteArray();

		const _headers = {
			"Content-Length": ContentLength?.toString() || "0",
			"Content-Type": ContentType || "image/jpeg",
			"Cache-Control": "public, max-age=31536000, immutable",
		};

		// const signedUrl = await getSignedUrl(s3Client, getObjectCommand);

		// return NextResponse.json({
		// 	url: signedUrl,
		// });
		return new NextResponse(Buffer.from(_bytes || []), {
			status: 200,
			headers: _headers,
		});
	} catch (error) {
		console.error("Error serving image:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
