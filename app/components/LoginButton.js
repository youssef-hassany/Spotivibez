"use client";

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <button className="login-btn" onClick={handleLogin}>
      Connect Spotify
    </button>
  );
}
