// api/logout.js

export default function handler(req, res) {
  res.setHeader("Set-Cookie", [
    // Clear the discord_user cookie
    "discord_user=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ]);
  res.writeHead(302, { Location: "/" }); // Redirect to homepage
  res.end();
}
