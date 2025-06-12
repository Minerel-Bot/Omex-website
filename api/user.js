// api/user.js
import cookie from "cookie";

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const discordUserCookie = cookies.discord_user; // Read the discord_user cookie

  if (!discordUserCookie) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const user = JSON.parse(decodeURIComponent(discordUserCookie)); // Parse the JSON from the cookie
    res.status(200).json({ user: user });
  } catch (err) {
    console.error("Error parsing discord_user cookie:", err);
    // If cookie is invalid, clear it
    res.setHeader("Set-Cookie", [
      "discord_user=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
    ]);
    res.status(401).json({ error: "Session expired or invalid" });
  }
}
