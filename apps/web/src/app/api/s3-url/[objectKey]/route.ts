import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
	{ params }: { params: Promise<{ objectKey: string }> },
) {
	try {
		const { objectKey } = await params;
		const bucketName = process.env.AWS_S3_BUCKET_NAME!;

		// Generate a signed URL that never expires
		const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: decodeURIComponent(objectKey),
		});

		const signedUrl = await getSignedUrl(s3Client, command);

		return NextResponse.json({
			url: signedUrl,
		});
	} catch (error) {
		console.error("Error generating signed URL:", error);
		return NextResponse.json(
			{ error: "Failed to generate signed URL" },
			{ status: 500 },
		);
	}
}
