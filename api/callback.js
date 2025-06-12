// api/callback.js

import { serialize } from 'cookie';
import fetch from 'node-fetch'; // Ensure node-fetch is imported if not using global fetch

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const params = new URLSearchParams();
  params.append("client_id", process.env.DISCORD_CLIENT_ID);
  params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  // Ensure this redirect_uri EXACTLY matches what's configured in Discord Developer Portal
  params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);
  params.append("scope", "identify"); // Ensure 'identify' scope is requested

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    console.error("Failed to get access token:", tokenData);
    return new Response("Failed to authenticate with Discord", { status: tokenRes.status });
  }

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const user = await userRes.json();

  if (!user.id) { // Check if user object is valid
      console.error("Failed to get user data from Discord API:", user);
      return new Response("Failed to retrieve user data from Discord", { status: userRes.status });
  }

  // Store the full user object (id, username, discriminator, avatar) in the cookie
  const userDataToStore = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar // This is the avatar hash
  };

  const cookie = serialize("discord_user", JSON.stringify(userDataToStore), { // Stringify the object
    path: "/",
    httpOnly: false, // Must be false for client-side JS to read
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'Lax', // Recommended for security and compatibility
    secure: process.env.NODE_ENV === 'production' // Use secure cookie in production
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: "https://omex-website.vercel.app/", // Ensure this is your actual website URL
      "Set-Cookie": cookie
    }
  });
}
