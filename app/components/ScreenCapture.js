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
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for Spotify images
        backgroundColor: "#121212", // Spotify-like dark background
        logging: false,
      });

      // Convert to image
      const image = canvas.toDataURL("image/png");

      // Create download link
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

      // Check if Web Share API is supported
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

      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
      });

      // Create file from blob
      const file = new File([blob], filename, { type: "image/png" });

      // Share the file
      await navigator.share({
        title: "My Spotify Insights",
        files: [file],
      });
    } catch (error) {
      console.error("Error sharing screen:", error);
      if (error.name !== "AbortError") {
        // Ignore if user cancelled
        setError("Failed to share screenshot");
      }
    } finally {
      setIsCapturing(false);
    }
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
    </div>
  );
};

export default ScreenCapture;
