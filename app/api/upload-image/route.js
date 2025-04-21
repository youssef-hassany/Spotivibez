// app/api/upload-image/route.js
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileName = `spotify-insights-${uuidv4()}.png`;

    try {
      // Make sure BLOB_READ_WRITE_TOKEN is set in environment variables
      const { url } = await put(fileName, file, {
        access: "public",
      });

      return NextResponse.json({ imageUrl: url });
    } catch (blobError) {
      console.error("Blob storage error:", blobError);

      // If we can't use Blob storage, fall back to Base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      return NextResponse.json({ imageUrl: dataUrl });
    }
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      {
        error: "Failed to process upload",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
