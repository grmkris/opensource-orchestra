import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
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

function buildProxyUrl(fileName: string) {
  return `/api/images/${encodeURIComponent(fileName)}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;

    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(putObjectCommand);
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: decodeURIComponent(fileName),
    });

    const signedUrl = await getSignedUrl(s3Client, command);

    return NextResponse.json({
      url: signedUrl,
    });

    // return NextResponse.json({
    //   message: "File uploaded successfully!",
    //   url: proxyUrl,
    // });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
