import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
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

    // Create a buffer from the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const fileName = `spotify-insights-${uuidv4()}.png`;

    // Define the upload directory path
    const uploadsDir = path.join(process.cwd(), "public/uploads");

    try {
      // Create directory if it doesn't exist
      await mkdir(uploadsDir, { recursive: true });
      console.log("Upload directory ensured:", uploadsDir);

      // Write the file
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      console.log("File written successfully:", filePath);

      // Generate the public URL
      // Get the base URL - try environment variable first, then headers
      let origin = process.env.NEXT_PUBLIC_BASE_URL;
      if (!origin) {
        // Try to get from headers
        const headerOrigin = request.headers.get("origin");
        origin = headerOrigin || "http://localhost:3000";
      }

      console.log("Using origin:", origin);
      const imageUrl = `${origin}/uploads/${fileName}`;

      console.log("Image URL generated:", imageUrl);
      return NextResponse.json({ imageUrl });
    } catch (fsError) {
      console.error("Filesystem error:", fsError);
      return NextResponse.json(
        {
          error: "File system error",
          details: fsError.message,
          code: fsError.code,
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
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
