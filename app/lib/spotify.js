import axios from "axios";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export const fetchSpotifyData = async (endpoint, accessToken, params = {}) => {
  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

export const formatTopTracks = (data) => {
  return data.items.map((track) => ({
    trackName: track.name,
    artistNames: track.artists.map((artist) => artist.name).join(", "),
    popularity: track.popularity,
    previewUrl: track.preview_url,
    albumName: track.album.name,
    albumArt: track.album.images[0]?.url,
  }));
};

export const formatTopArtists = (data) => {
  return data.items.map((artist) => ({
    artistName: artist.name,
    popularity: artist.popularity,
    genres: artist.genres,
    followers: artist.followers.total,
    imageUrl: artist.images[0]?.url,
  }));
};

export const formatRecentPlays = (data) => {
  return data.items.map((item) => ({
    trackName: item.track.name,
    artistName: item.track.artists[0].name,
    albumName: item.track.album.name,
    playedAt: item.played_at,
    albumArt: item.track.album.images[0]?.url,
  }));
};
