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

      // 2. Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
      });

      // 3. Upload the image to your server to get a public URL
      // Note: You need to implement this API endpoint
      const formData = new FormData();
      formData.append("image", blob, filename);

      const uploadResponse = await fetch("/api/upload-instagram-story", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { imageUrl } = await uploadResponse.json();

      // 4. Create the Instagram Stories URL with the image
      // Instagram requires a publicly accessible URL for the image
      const instagramURL = `instagram://story-camera/share?source_application=your_app_id&media=${encodeURIComponent(
        imageUrl
      )}`;

      // 5. Redirect to Instagram Stories
      window.location.href = instagramURL;

      // Fallback for desktop or if the redirect fails
      setTimeout(() => {
        setIsCapturing(false);
        // Check if redirect didn't happen (usually on desktop)
        if (document.hasFocus()) {
          setError(
            "Instagram Stories sharing works best on mobile devices with Instagram app installed"
          );
        }
      }, 2000);
    } catch (error) {
      console.error("Error sharing to Instagram:", error);
      setError(`Failed to share to Instagram Stories: ${error}`);
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
