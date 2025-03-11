"use client";

import { useState, useEffect, useRef } from "react";
import TopArtists from "./components/TopArtists";
import RecentPlays from "./components/RecentPlays";
import LoginButton from "./components/LoginButton";
import TopTracks from "./components/TopTracks";
import ScreenCapture from "./components/ScreenCapture";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState({
    topTracks: [],
    topArtists: [],
    recentPlays: [],
  });

  // Create a ref for the content we want to capture
  const captureRef = useRef(null);

  useEffect(() => {
    // Get token from URL params
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");

    if (accessToken) {
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchUserData(accessToken);
    }
  }, []);

  const fetchUserData = async (accessToken) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/user-data?access_token=${accessToken}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch your Spotify data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="main">
      <h1 className="title">Spotivibez</h1>

      {!userData.topTracks.length && (
        <div className="login-section">
          <LoginButton />
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {isLoading ? (
        <p className="loading">Loading your Spotify data...</p>
      ) : (
        <>
          {/* This div will be captured */}
          <div className="user-data" ref={captureRef}>
            <TopTracks tracks={userData.topTracks} />
            <TopArtists artists={userData.topArtists} />
            <RecentPlays plays={userData.recentPlays} />
          </div>

          {/* Only show capture buttons when user data is loaded */}
          {userData.topTracks.length > 0 && (
            <ScreenCapture
              targetRef={captureRef}
              filename="spotify-insights.png"
            />
          )}
        </>
      )}
    </main>
  );
}
