import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("image");
    const platform = formData.get("platform") || "generic";

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Create a unique filename
    const uniqueId = uuidv4();
    const fileName = `spotify-insights-${uniqueId}.png`;

    try {
      // Make sure BLOB_READ_WRITE_TOKEN is set in environment variables
      const { url } = await put(fileName, file, {
        access: "public",
      });

      // For Facebook and Twitter, generate a URL to a page with proper OG tags
      // This is better than direct image links for social media sharing
      if (platform === "facebook" || platform === "twitter") {
        // URL to your share page with the image ID
        const sharePageUrl = `${
          process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || ""
        }/share/${uniqueId}`;

        return NextResponse.json({
          imageUrl: url,
          shareUrl: sharePageUrl,
        });
      }

      // For other platforms, return the direct image URL
      return NextResponse.json({ imageUrl: url });
    } catch (blobError) {
      console.error("Blob storage error:", blobError);

      // If we can't use Blob storage, for small images we could use base64
      // But this isn't ideal for larger images
      return NextResponse.json(
        {
          error: "Blob storage error",
          details:
            "Unable to store image. Please ensure BLOB_READ_WRITE_TOKEN is configured.",
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
