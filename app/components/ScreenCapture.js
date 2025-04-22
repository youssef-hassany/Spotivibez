"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import styles from "./style.module.css";

const ScreenCapture = ({ targetRef, appName = "SpotiVibes" }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Capture screen content and get both blob and data URL
  const captureScreen = async () => {
    if (!targetRef.current || isCapturing) return { blob: null, dataUrl: null };

    try {
      setStatus("Capturing your insights...");

      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#121212",
        logging: false,
      });

      // Get both blob and data URL for different uses
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });

      const dataUrl = canvas.toDataURL("image/png", 1.0);

      return { blob, dataUrl };
    } catch (error) {
      console.error("Screen capture failed:", error);
      setError(`Couldn't capture your insights: ${error.message}`);
      return { blob: null, dataUrl: null };
    }
  };

  // Twitter/X sharing - optimized approach
  const shareToTwitter = async () => {
    setCurrentPlatform("twitter");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const { blob, dataUrl } = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      // For Twitter, we can use the Web Intent API
      const tweetText = `Check out my Spotify insights from ${appName}! #SpotifyInsights`;
      const encodedText = encodeURIComponent(tweetText);

      // Upload image to get a URL
      const imageUrl = await uploadImageForTwitter(blob);

      if (imageUrl) {
        // If we got an image URL, we can include it in the tweet
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(
            imageUrl
          )}`,
          "_blank"
        );
        setStatus("Twitter opened with your insights!");
      } else {
        // Fallback: download + open Twitter
        downloadImage(blob, `${appName.toLowerCase()}-insights.png`);
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}`,
          "_blank"
        );
        setStatus(
          "Image downloaded and Twitter opened. Please attach the image to your tweet."
        );
      }
    } catch (error) {
      console.error("Twitter sharing failed:", error);
      setError(`Couldn't share to Twitter: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Upload image for Twitter
  const uploadImageForTwitter = async (blob) => {
    try {
      // Create form data for upload
      const formData = new FormData();
      const file = new File([blob], `${appName.toLowerCase()}-insights.png`, {
        type: "image/png",
      });
      formData.append("image", file);

      // Upload to your server
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  // WhatsApp sharing - optimized approach
  const shareToWhatsApp = async () => {
    setCurrentPlatform("whatsapp");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const { blob, dataUrl } = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      // Try to get a shareable URL
      const imageUrl = await uploadImageForWhatsApp(blob);

      // WhatsApp text
      const whatsappText = `Check out my Spotify insights from ${appName}!`;
      const encodedText = encodeURIComponent(whatsappText);

      if (imageUrl) {
        // WhatsApp cannot directly embed images, but we can include a link
        window.open(
          `https://wa.me/?text=${encodedText} ${encodeURIComponent(imageUrl)}`,
          "_blank"
        );
        setStatus("WhatsApp opened with your insights link!");
      } else {
        // Fallback - download + open WhatsApp
        downloadImage(blob, `${appName.toLowerCase()}-insights.png`);
        window.open(`https://wa.me/?text=${encodedText}`, "_blank");
        setStatus(
          "Image downloaded and WhatsApp opened. Please attach the image to your message."
        );
      }
    } catch (error) {
      console.error("WhatsApp sharing failed:", error);
      setError(`Couldn't share to WhatsApp: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Upload image for WhatsApp
  const uploadImageForWhatsApp = async (blob) => {
    try {
      // Same as Twitter upload
      const formData = new FormData();
      const file = new File([blob], `${appName.toLowerCase()}-insights.png`, {
        type: "image/png",
      });
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  // Facebook sharing - improved approach
  const shareToFacebook = async () => {
    setCurrentPlatform("facebook");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const { blob, dataUrl } = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      // Try to upload for shareable URL
      const imageUrl = await uploadImageForFacebook(blob);

      if (imageUrl) {
        // Use Facebook Share Dialog with OG tags
        // This requires server-side OG tag implementation
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            imageUrl
          )}`,
          "_blank"
        );
        setStatus("Facebook opened with your insights!");
      } else {
        // Fallback - download + Facebook
        downloadImage(blob, `${appName.toLowerCase()}-insights.png`);

        // Direct to Facebook newsfeed
        window.open("https://www.facebook.com/newsfeed", "_blank");
        setStatus(
          "Image downloaded and Facebook opened. Please create a new post and attach the image."
        );
      }
    } catch (error) {
      console.error("Facebook sharing failed:", error);
      setError(`Couldn't share to Facebook: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Upload image for Facebook
  const uploadImageForFacebook = async (blob) => {
    try {
      // For Facebook, we'd need a page with proper OG tags
      // This is the same upload endpoint, but ideally points to a page with OG tags
      const formData = new FormData();
      const file = new File([blob], `${appName.toLowerCase()}-insights.png`, {
        type: "image/png",
      });
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();

      // Ideally, return a URL to a page that has OG tags set up
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  // Instagram Story - alternative approach using data URI scheme on iOS
  const shareToInstagramStory = async () => {
    setCurrentPlatform("instagram");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const { blob, dataUrl } = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

      if (isIOS) {
        // iOS specific approach using specially formatted URL
        // This is an undocumented approach that may work on iOS
        try {
          // Get an uploaded image URL
          const imageUrl = await uploadImage(blob);

          if (imageUrl) {
            // Special URL format for Instagram on iOS
            const instagramURL = `instagram://library?AssetPath=${encodeURIComponent(
              imageUrl
            )}`;
            window.location.href = instagramURL;

            // Set timeout to check if redirect happened
            setTimeout(() => {
              if (document.hasFocus()) {
                // Fallback if redirect didn't work
                useInstagramFallback(blob);
              }
            }, 2000);
          } else {
            useInstagramFallback(blob);
          }
        } catch (e) {
          useInstagramFallback(blob);
        }
      } else {
        // Android or other platforms
        useInstagramFallback(blob);
      }
    } catch (error) {
      console.error("Instagram sharing failed:", error);
      setError(`Couldn't share to Instagram: ${error.message}`);
      setIsCapturing(false);
    }
  };

  // Instagram fallback approach
  const useInstagramFallback = (blob) => {
    // Download the image
    downloadImage(blob, `${appName.toLowerCase()}-insights.png`);

    // Try to open Instagram app
    const isAndroid = /Android/.test(navigator.userAgent);
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isAndroid || isIOS) {
      // On mobile, try to open the Instagram app
      window.location.href = "instagram://";

      setStatus(
        "Image saved to your device. Open Instagram app, create a new story, and select the image from your gallery."
      );
    } else {
      // On desktop, just provide instructions
      setStatus(
        "Image downloaded! To share to Instagram, transfer the image to your mobile device and upload it via the Instagram app."
      );
    }

    setIsCapturing(false);
  };

  // Upload image - generic function
  const uploadImage = async (blob) => {
    try {
      const formData = new FormData();
      const file = new File([blob], `${appName.toLowerCase()}-insights.png`, {
        type: "image/png",
      });
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  // Helper function to download image
  const downloadImage = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
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
      const { blob, dataUrl } = await captureScreen();
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

  // Direct download function
  const downloadDirectly = async () => {
    setCurrentPlatform("download");
    setIsCapturing(true);
    setError("");

    try {
      // First capture the screen
      const { blob, dataUrl } = await captureScreen();
      if (!blob) {
        setIsCapturing(false);
        return;
      }

      downloadImage(blob, `${appName.toLowerCase()}-insights.png`);
      setStatus("Image downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      setError(`Couldn't download image: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Check if we're on mobile
  const isMobile = /iPhone|iPad|iPod|Android/.test(navigator.userAgent);

  return (
    <div className={styles.socialShareContainer}>
      <h3 className={styles.shareTitle}>Share Your Spotify Insights</h3>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {status && <div className={styles.statusMessage}>{status}</div>}

      <div className={styles.shareButtonsContainer}>
        {/* Native share is the best option when available */}
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

        <button
          onClick={downloadDirectly}
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

      {/* Hidden elements for form submissions */}
      <form ref={formRef} style={{ display: "none" }}></form>
      <input ref={fileInputRef} type="file" style={{ display: "none" }} />
    </div>
  );
};

export default ScreenCapture;
