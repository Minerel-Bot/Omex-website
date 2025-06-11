export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No code provided.");
  }

  const params = new URLSearchParams();
  params.append("client_id", "1382211684097327235"); // Replace this
  params.append("client_secret", "3oUpdjpI0RR7dw3PKeg2Zg-J05mGTu9k"); // Replace this
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "https://omex-website.vercel.app/api/callback");
  params.append("scope", "identify");

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return res.status(400).json({ error: "Failed to get access token", details: tokenData });
  }

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const userData = await userRes.json();

  res.status(200).send(`
    <h2>Welcome, ${userData.username}#${userData.discriminator}!</h2>
    <p>User ID: ${userData.id}</p>
    <p>Thanks for logging in with Discord 😊</p>
  `);
}
