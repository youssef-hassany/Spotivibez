"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";

const ScreenCapture = ({ targetRef, filename = "spotify-insights.png" }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);

  // Main capture function that creates the image
  const captureScreen = async () => {
    if (!targetRef.current || isCapturing) return null;

    try {
      setStatus("Capturing screen...");

      const canvas = await html2canvas(targetRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: "#121212",
        logging: false,
      });

      // Convert to high-quality blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });

      return blob;
    } catch (error) {
      console.error("Screen capture failed:", error);
      setError(`Capture failed: ${error.message}`);
      return null;
    }
  };

  // Upload to Vercel blob and get a public URL
  const uploadToVercel = async (blob) => {
    if (!blob) return null;

    try {
      setStatus("Uploading image...");

      const formData = new FormData();
      const file = new File([blob], filename, { type: "image/png" });
      formData.append("image", file);

      const response = await fetch("/api/upload-instagram-story", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      setError(`Upload failed: ${error.message}`);
      return null;
    }
  };

  // Download image directly
  const downloadImage = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setError("");

    try {
      const blob = await captureScreen();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("Image downloaded successfully!");
    } catch (error) {
      setError(`Download failed: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Share to Instagram story
  const shareToInstagramStory = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setError("");
    setImageUrl("");

    try {
      // 1. Capture screen
      const blob = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      // 2. Upload to get a public URL
      const url = await uploadToVercel(blob);
      if (!url) {
        setIsCapturing(false);
        return;
      }

      setImageUrl(url);
      setStatus("Image ready! Click the 'Open Instagram' button below.");

      // 3. Provide both options for sharing
      // We'll let the user manually click to share rather than auto-redirecting
      // which could be blocked by browsers
    } catch (error) {
      console.error("Instagram sharing preparation failed:", error);
      setError(`Preparation failed: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Open Instagram with the captured image
  const openInstagram = () => {
    if (!imageUrl) return;

    // Try the official Instagram URL scheme
    const instagramURL = `https://www.instagram.com/stories/create/?backgroundImage=${encodeURIComponent(
      imageUrl
    )}`;
    window.open(instagramURL, "_blank");
  };

  // Using native share if available (fallback)
  const useNativeShare = async () => {
    if (!imageUrl || !navigator.share) return;

    try {
      await navigator.share({
        title: "My Spotify Insights",
        text: "Check out my Spotify insights!",
        url: imageUrl,
      });
      setStatus("Shared successfully!");
    } catch (error) {
      if (error.name !== "AbortError") {
        setError(`Sharing failed: ${error.message}`);
      }
    }
  };

  // Upload image directly (manual option)
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUserUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = null;

    setStatus("Opening Instagram...");

    // Use Instagram's app URL scheme directly
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = "instagram://camera";
    } else {
      setError("Instagram app integration works best on mobile devices");
    }
  };

  return (
    <div className="capture-controls">
      {error && <div className="error-message">{error}</div>}
      {status && <div className="status-message">{status}</div>}

      <button
        onClick={downloadImage}
        disabled={isCapturing}
        className="btn primary-btn"
      >
        Download Image
      </button>

      <button
        onClick={shareToInstagramStory}
        disabled={isCapturing}
        className="btn instagram-btn"
      >
        Prepare for Instagram
      </button>

      {imageUrl && (
        <div className="instagram-share-options">
          <p>Image ready for Instagram! Choose how to share:</p>

          <button onClick={openInstagram} className="btn instagram-open-btn">
            Open Instagram
          </button>

          <button
            onClick={useNativeShare}
            disabled={!navigator?.share}
            className="btn share-btn"
          >
            Use Native Share
          </button>

          <div className="manual-instructions">
            <p>Or manually upload to Instagram:</p>
            <ol>
              <li>Save the image using the Download button</li>
              <li>Open Instagram app manually</li>
              <li>Create a new story and select the image from your gallery</li>
            </ol>
          </div>
        </div>
      )}

      {/* Hidden file input for manual upload (alternative approach) */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleUserUpload}
      />
    </div>
  );
};

export default ScreenCapture;
