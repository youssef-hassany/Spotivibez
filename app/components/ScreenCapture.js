"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import styles from "./SocialMediaShare.module.css";

const ScreenCapture = ({ targetRef, appName = "SpotiVibes" }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [imageBlob, setImageBlob] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // Capture screen content using html2canvas
  const captureScreen = async () => {
    if (!targetRef.current || isCapturing) return null;

    try {
      setStatus("Capturing your insights...");

      const canvas = await html2canvas(targetRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: "#121212",
        logging: false,
      });

      // Convert to blob for upload or direct sharing
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });

      setImageBlob(blob);
      return blob;
    } catch (error) {
      console.error("Screen capture failed:", error);
      setError(`Couldn't capture your insights: ${error.message}`);
      return null;
    }
  };

  // Upload image to get sharable URL
  const uploadImage = async (blob) => {
    if (!blob) return null;

    try {
      setStatus("Preparing your image for sharing...");

      const formData = new FormData();
      const file = new File([blob], `${appName.toLowerCase()}-insights.png`, {
        type: "image/png",
      });
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      setError(`Couldn't prepare your image: ${error.message}`);
      return null;
    }
  };

  // Instagram Story sharing
  const shareToInstagramStory = async () => {
    setCurrentPlatform("instagram");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const blob = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      // For Instagram Stories, we need a public URL
      const url = await uploadImage(blob);
      if (!url) {
        setIsCapturing(false);
        return;
      }

      // On mobile, try direct Instagram stories URL
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Try the Instagram URL scheme
        const instagramURL = `instagram://story-camera`;
        window.location.href = instagramURL;

        setStatus(
          "Instagram should be opening. Select your downloaded image to create your story!"
        );

        // As a fallback, also trigger download
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${appName.toLowerCase()}-insights.png`;
        link.href = downloadUrl;
        link.click();
        URL.revokeObjectURL(downloadUrl);
      } else {
        // On desktop, provide instructions with download
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${appName.toLowerCase()}-insights.png`;
        link.href = downloadUrl;
        link.click();
        URL.revokeObjectURL(downloadUrl);

        setStatus(
          "Image downloaded! Open Instagram on your phone to share it to your Story."
        );
      }
    } catch (error) {
      console.error("Instagram sharing failed:", error);
      setError(`Couldn't share to Instagram: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Twitter/X sharing
  const shareToTwitter = async () => {
    setCurrentPlatform("twitter");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const blob = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      // For Twitter, we can use Web Intent API with text
      const tweetText = `Check out my Spotify insights from ${appName}! #SpotifyInsights`;
      const encodedText = encodeURIComponent(tweetText);

      // Also download the image for user to attach
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${appName.toLowerCase()}-insights.png`;
      link.href = downloadUrl;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      // Open Twitter Web Intent
      window.open(
        `https://twitter.com/intent/tweet?text=${encodedText}`,
        "_blank"
      );

      setStatus(
        "Image downloaded and Twitter opened! Attach the image to your tweet."
      );
    } catch (error) {
      console.error("Twitter sharing failed:", error);
      setError(`Couldn't share to Twitter: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // WhatsApp sharing
  const shareToWhatsApp = async () => {
    setCurrentPlatform("whatsapp");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const blob = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      // For WhatsApp, download the image and open WhatsApp
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${appName.toLowerCase()}-insights.png`;
      link.href = downloadUrl;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      // WhatsApp text
      const whatsappText = `Check out my Spotify insights from ${appName}!`;
      const encodedText = encodeURIComponent(whatsappText);

      // Open WhatsApp with text
      window.open(`https://wa.me/?text=${encodedText}`, "_blank");

      setStatus(
        "Image downloaded and WhatsApp opened! Attach the image to your message."
      );
    } catch (error) {
      console.error("WhatsApp sharing failed:", error);
      setError(`Couldn't share to WhatsApp: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Facebook sharing
  const shareToFacebook = async () => {
    setCurrentPlatform("facebook");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const blob = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      // For Facebook, download the image and open Facebook
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${appName.toLowerCase()}-insights.png`;
      link.href = downloadUrl;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      // Open Facebook
      window.open("https://www.facebook.com/", "_blank");

      setStatus(
        "Image downloaded and Facebook opened! Create a new post and attach the image."
      );
    } catch (error) {
      console.error("Facebook sharing failed:", error);
      setError(`Couldn't share to Facebook: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Use native share if available (works best on mobile)
  const useNativeShare = async () => {
    if (!navigator.share) {
      setError("Native sharing not supported in your browser");
      return;
    }

    setCurrentPlatform("native");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const blob = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      const file = new File([blob], `${appName.toLowerCase()}-insights.png`, {
        type: "image/png",
      });

      await navigator.share({
        title: `My ${appName} Insights`,
        text: `Check out my Spotify insights from ${appName}!`,
        files: [file],
      });

      setStatus("Share sheet opened!");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Native sharing failed:", error);
        setError(`Sharing failed: ${error.message}`);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Simple download function
  const downloadImage = async () => {
    setCurrentPlatform("download");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const blob = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${appName.toLowerCase()}-insights.png`;
      link.href = downloadUrl;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      setStatus("Image downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      setError(`Couldn't download image: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className={styles.socialShareContainer}>
      <h3 className={styles.shareTitle}>Share Your Spotify Insights</h3>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {status && <div className={styles.statusMessage}>{status}</div>}

      <div className={styles.shareButtonsContainer}>
        <button
          onClick={shareToInstagramStory}
          disabled={isCapturing}
          className={`${styles.shareButton} ${styles.instagramButton}`}
        >
          <span className={styles.iconPlaceholder}>📸</span> Instagram Story
        </button>

        <button
          onClick={shareToTwitter}
          disabled={isCapturing}
          className={`${styles.shareButton} ${styles.twitterButton}`}
        >
          <span className={styles.iconPlaceholder}>🐦</span> Twitter/X
        </button>

        <button
          onClick={shareToWhatsApp}
          disabled={isCapturing}
          className={`${styles.shareButton} ${styles.whatsappButton}`}
        >
          <span className={styles.iconPlaceholder}>💬</span> WhatsApp
        </button>

        <button
          onClick={shareToFacebook}
          disabled={isCapturing}
          className={`${styles.shareButton} ${styles.facebookButton}`}
        >
          <span className={styles.iconPlaceholder}>👥</span> Facebook
        </button>

        {navigator?.share && (
          <button
            onClick={useNativeShare}
            disabled={isCapturing}
            className={`${styles.shareButton} ${styles.nativeButton}`}
          >
            <span className={styles.iconPlaceholder}>📱</span> Share
          </button>
        )}

        <button
          onClick={downloadImage}
          disabled={isCapturing}
          className={`${styles.shareButton} ${styles.downloadButton}`}
        >
          <span className={styles.iconPlaceholder}>💾</span> Download
        </button>
      </div>

      {isCapturing && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div>
          <p>Preparing your insights...</p>
        </div>
      )}
    </div>
  );
};

export default ScreenCapture;
