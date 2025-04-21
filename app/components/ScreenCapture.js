"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";

const ScreenCapture = ({ targetRef, filename = "spotify-insights.png" }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  // Capture and download directly
  const captureAndDownload = async () => {
    if (!targetRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setError("");
      setStatus("Capturing screen...");

      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#121212",
        logging: false,
      });

      // Create download link
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = filename;
      link.href = image;
      link.click();

      setStatus(
        "Image downloaded! Open Instagram and create a new story to share it."
      );
    } catch (error) {
      console.error("Error capturing screen:", error);
      setError(`Failed to capture screen: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Capture and use device's native share if available
  const captureAndShare = async () => {
    if (!targetRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setError("");
      setStatus("Capturing screen...");

      if (!navigator.share) {
        setError("Native sharing not supported in your browser");
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

      try {
        await navigator.share({
          title: "My Spotify Insights",
          files: [file],
        });
        setStatus("Share dialog opened!");
      } catch (shareError) {
        if (shareError.name !== "AbortError") {
          throw shareError;
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
      setError(`Sharing failed: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Try to open Instagram directly with instructions
  const openInstagramWithInstructions = async () => {
    if (!targetRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setError("");
      setStatus("Preparing to open Instagram...");

      // First download the image
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#121212",
        logging: false,
      });

      // Create download link
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = filename;
      link.href = image;
      link.click();

      // Wait a moment for download to start
      setTimeout(() => {
        // Try to open Instagram app
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          window.location.href = "instagram://camera";
          setStatus(
            "Image downloaded! Instagram app should be opening. Select the downloaded image to create your story."
          );
        } else {
          window.open("https://www.instagram.com/", "_blank");
          setStatus(
            "Image downloaded! Instagram web opened in a new tab. For story sharing, use the Instagram mobile app."
          );
        }
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setError(`Process failed: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Determine if we're on a mobile device
  const isMobile = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  return (
    <div className="capture-controls">
      {error && <div className="error-message">{error}</div>}
      {/* {status && <div className="status-message">{status}</div>} */}

      <button
        onClick={captureAndDownload}
        disabled={isCapturing}
        className="btn download-btn"
      >
        {isCapturing ? "Processing..." : "Download Image"}
      </button>

      {navigator?.canShare && (
        <button
          onClick={captureAndShare}
          disabled={isCapturing}
          className="btn share-btn"
        >
          Share Image
        </button>
      )}

      {isMobile() && (
        <button
          onClick={openInstagramWithInstructions}
          disabled={isCapturing}
          className="btn instagram-btn"
        >
          Save & Open Instagram
        </button>
      )}
    </div>
  );
};

export default ScreenCapture;
