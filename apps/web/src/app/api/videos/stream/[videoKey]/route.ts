import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

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
  { params }: { params: { videoKey: string } }
) {
  try {
    const videoKey = await decodeURIComponent(params.videoKey);
    const range = request.headers.get("range");

    // Get object metadata first
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: videoKey,
    });

    const headResponse = await s3Client.send(headCommand);
    const contentLength = headResponse.ContentLength!;
    const contentType = headResponse.ContentType || "video/mp4";

    let start = 0;
    let end = contentLength - 1;

    // Parse range header if present
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;
    }

    // Ensure we don't exceed file boundaries
    start = Math.max(0, start);
    end = Math.min(contentLength - 1, end);

    const chunkSize = end - start + 1;

    // Get the requested range from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: videoKey,
      Range: `bytes=${start}-${end}`,
    });

    const response = await s3Client.send(getObjectCommand);

    if (!response.Body) {
      return new NextResponse("Video not found", { status: 404 });
    }

    // Convert the stream to bytes
    const stream = response.Body as any;
    const bytes = await streamToBuffer(stream);

    // Create headers for partial content response
    const headers = new Headers({
      "Content-Range": `bytes ${start}-${end}/${contentLength}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    });

    // Return partial content (206) if range was requested, otherwise full content (200)
    const status = range ? 206 : 200;

    return new NextResponse(bytes, { status, headers });
  } catch (error) {
    console.error("Error streaming video:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Helper function to convert stream to buffer
async function streamToBuffer(stream: any): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
