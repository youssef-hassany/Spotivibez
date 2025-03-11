import { NextResponse } from "next/server";

export async function GET() {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/callback`;

  const scopes = ["user-top-read", "user-read-recently-played"].join(" ");

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&show_dialog=true`;

  return NextResponse.redirect(authUrl);
}
