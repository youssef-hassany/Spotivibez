import { NextResponse } from "next/server";
import {
  fetchSpotifyData,
  formatTopTracks,
  formatTopArtists,
  formatRecentPlays,
} from "../../lib/spotify";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("access_token");

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch top tracks
    const topTracksData = await fetchSpotifyData(
      "/me/top/tracks",
      accessToken,
      {
        time_range: "medium_term",
        limit: 20,
      }
    );
    const topTracks = formatTopTracks(topTracksData);

    // Generate top albums from tracks
    const topAlbums = Array.from(
      new Set(
        topTracksData.items.map((track) => ({
          albumName: track.album.name,
          artistName: track.album.artists[0].name,
          albumArt: track.album.images[0]?.url,
          releaseDate: track.album.release_date,
          totalTracks: track.album.total_tracks,
        }))
      )
    ).slice(0, 10);

    // Fetch top artists
    const topArtistsData = await fetchSpotifyData(
      "/me/top/artists",
      accessToken,
      {
        time_range: "short_term",
        limit: 10,
      }
    );
    const topArtists = formatTopArtists(topArtistsData);

    // Fetch recent plays
    const recentPlaysData = await fetchSpotifyData(
      "/me/player/recently-played",
      accessToken,
      {
        limit: 20,
      }
    );
    const recentPlays = formatRecentPlays(recentPlaysData);

    return NextResponse.json({
      topAlbums,
      recentPlays,
      topTracks,
      topArtists,
    });
  } catch (error) {
    console.error("Error fetching user data:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Failed to fetch user data", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
