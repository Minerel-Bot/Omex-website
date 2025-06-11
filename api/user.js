import cookie from "cookie";

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userRes.ok) {
      // Invalid or expired token, clear session
      res.setHeader("Set-Cookie", [
        "token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "user=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      ]);
      return res.status(401).json({ error: "Session expired" });
    }

    const user = await userRes.json();
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
}
