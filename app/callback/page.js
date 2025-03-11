"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    async function handleCallback() {
      if (code) {
        try {
          const response = await fetch(`/api/callback?code=${code}`);

          if (response.redirected) {
            window.location.href = response.url;
          } else {
            // If not redirected directly by the API, manually redirect to home
            router.push("/");
          }
        } catch (error) {
          console.error("Error during callback:", error);
          router.push("/");
        }
      }
    }

    handleCallback();
  }, [code, router]);

  return (
    <div className="callback-container">
      <h1>Authenticating with Spotify...</h1>
      <div className="loading-spinner"></div>
    </div>
  );
}

export default function Callback() {
  return (
    <Suspense
      fallback={
        <div className="callback-container">
          <h1>Loading...</h1>
          <div className="loading-spinner"></div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
