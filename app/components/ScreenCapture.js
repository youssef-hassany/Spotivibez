"use client";

import { useState } from "react";
import html2canvas from "html2canvas";

const ScreenCapture = ({ targetRef, filename = "spotify-insights.png" }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState("");

  const captureAndDownload = async () => {
    if (!targetRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setError("");

      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#121212",
        logging: false,
      });

      const image = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = filename;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Error capturing screen:", error);
      setError("Failed to capture screenshot");
    } finally {
      setIsCapturing(false);
    }
  };

  const captureAndShare = async () => {
    if (!targetRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setError("");

      if (!navigator.share) {
        alert("Sharing is not supported in your browser");
        setIsCapturing(false);
        return;
      }

      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#121212",
        logging: false,
      });

      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
      });

      const file = new File([blob], filename, { type: "image/png" });

      await navigator.share({
        title: "My Spotify Insights",
        files: [file],
      });
    } catch (error) {
      console.error("Error sharing screen:", error);
      if (error.name !== "AbortError") {
        setError("Failed to share screenshot");
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Modified shareToInstagramStories function
  const shareToInstagramStories = async () => {
    if (!targetRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setError("");

      // 1. Capture the screen
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#121212",
        logging: false,
      });

      // 2. Convert canvas to blob with better quality
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0); // Using max quality
      });

      // 3. Create file and form data
      const formData = new FormData();
      const file = new File([blob], filename, { type: "image/png" });
      formData.append("image", file);

      console.log("Uploading file:", file.size, "bytes");

      // 4. Upload the image
      try {
        const uploadResponse = await fetch("/api/upload-instagram-story", {
          method: "POST",
          body: formData,
        });

        // Log the raw response for debugging
        const responseText = await uploadResponse.text();
        console.log("Server response:", responseText);

        if (!uploadResponse.ok) {
          throw new Error(`Server returned error: ${responseText}`);
        }

        // Parse the response
        const { imageUrl } = JSON.parse(responseText);
        console.log("Image uploaded successfully:", imageUrl);

        // 5. Create and use the Instagram URL
        // Method 1: Using the story-camera approach
        // const instagramURL = `instagram://story-camera/share?source_application=1234567890&media=${encodeURIComponent(imageUrl)}`;

        // Method 2: Using the web API approach (more compatible)
        const instagramURL = `https://www.instagram.com/stories/create/?backgroundImage=${encodeURIComponent(
          imageUrl
        )}`;

        // Try to open Instagram
        window.location.href = instagramURL;

        // Set a timeout to check if redirect worked
        setTimeout(() => {
          if (document.hasFocus()) {
            console.log("Redirect didn't happen, still in browser");
            setError(
              "Instagram app not detected. Try downloading the image instead."
            );
          }
          setIsCapturing(false);
        }, 2000);
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
    } catch (error) {
      console.error("Error sharing to Instagram:", error);
      setError(`Failed to share to Instagram Story: ${error.message}`);
      setIsCapturing(false);
    }
  };

  // Helper function to detect if we're on mobile
  const isMobile = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  // Helper to check if we're likely on a device with Instagram app
  const isInstagramAvailable = () => {
    return isMobile(); // Simplified check - mobile devices likely have Instagram
  };

  return (
    <div className="capture-controls">
      {error && <div className="capture-error">{error}</div>}

      <button
        onClick={captureAndDownload}
        disabled={isCapturing}
        className="capture-btn"
      >
        {isCapturing ? "Processing..." : "Download Insights"}
      </button>

      {navigator?.canShare && (
        <button
          onClick={captureAndShare}
          disabled={isCapturing}
          className="share-btn"
        >
          Share Insights
        </button>
      )}

      {isInstagramAvailable() && (
        <button
          onClick={shareToInstagramStories}
          disabled={isCapturing}
          className="instagram-btn"
        >
          Share to Instagram Story
        </button>
      )}
    </div>
  );
};

export default ScreenCapture;
