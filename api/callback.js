// /api/callback.js

import { serialize } from 'cookie';

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
  params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);
  params.append("scope", "identify");

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const user = await userRes.json();
  const username = `${user.username}#${user.discriminator}`;

  // Set cookie
  const cookie = serialize("discord_user", encodeURIComponent(username), {
    path: "/",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: "https://omex-website.vercel.app/",
      "Set-Cookie": cookie
    }
  });
}
