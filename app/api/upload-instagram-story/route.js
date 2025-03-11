// app/api/upload-instagram-story/route.js
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    console.log("API route called");

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      console.error("No file in request");
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Log file details for debugging
    console.log("File received:", {
      type: file.type,
      size: file.size,
    });

    // Create a unique filename
    const fileName = `spotify-insights-${uuidv4()}.png`;

    try {
      // Upload to Vercel Blob storage
      const { url } = await put(fileName, file, {
        access: "public",
      });

      console.log("Image uploaded to Vercel Blob:", url);
      return NextResponse.json({ imageUrl: url });
    } catch (blobError) {
      console.error("Blob storage error:", blobError);
      return NextResponse.json(
        {
          error: "Blob storage error",
          details: blobError.message,
        },
        { status: 500 }
      );
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
