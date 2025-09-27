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
	request: NextRequest,
	{ params }: { params: { videoKey: string } },
) {
	const { videoKey } = params;
	const range = request.headers.get("range");

	try {
		const headObjectCommand = new HeadObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET_NAME!,
			Key: decodeURIComponent(videoKey),
		});
		const { ContentLength, ContentType } =
			await s3Client.send(headObjectCommand);

		if (range) {
			const bytes = range.replace(/bytes=/, "").split("-");
			const start = Number.parseInt(bytes[0], 10);
			const end = bytes[1] ? Number.parseInt(bytes[1], 10) : ContentLength! - 1;
			const chunkSize = end - start + 1;

			const getObjectCommand = new GetObjectCommand({
				Bucket: process.env.AWS_S3_BUCKET_NAME!,
				Key: decodeURIComponent(videoKey),
				Range: `bytes=${start}-${end}`,
			});

			const { Body } = await s3Client.send(getObjectCommand);

			const headers = {
				"Content-Range": `bytes ${start}-${end}/${ContentLength}`,
				"Accept-Ranges": "bytes",
				"Content-Length": chunkSize.toString(),
				"Content-Type": ContentType!,
			};

			// Body is a ReadableStream, which can be directly used in the Response
			return new NextResponse(Body as any, { status: 206, headers });
		}
		const getObjectCommand = new GetObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET_NAME!,
			Key: decodeURIComponent(videoKey),
		});

		const { Body } = await s3Client.send(getObjectCommand);

		const headers = {
			"Content-Length": ContentLength?.toString(),
			"Content-Type": ContentType!,
		};

		return new NextResponse(Body as any, { status: 200, headers });
	} catch (error) {
		console.error("Error streaming video:", error);
		return NextResponse.json(
			{ error: "Failed to stream video." },
			{ status: 500 },
		);
	}
}
