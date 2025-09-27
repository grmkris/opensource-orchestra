import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { type NextRequest, NextResponse } from "next/server";

const s3Client = new S3Client({
	region: "us-east-1",
	endpoint: "https://o3-rc2.akave.xyz",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const fileName = `${Date.now()}-${file.name}`;

		const putObjectCommand = new PutObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET_NAME!,
			Key: fileName,
			Body: buffer,
			ContentType: file.type,
		});

		await s3Client.send(putObjectCommand);

		return NextResponse.json({
			message: "File uploaded successfully!",
			fileName,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload file." },
			{ status: 500 },
		);
	}
}
