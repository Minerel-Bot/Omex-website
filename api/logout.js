export default function handler(req, res) {
  res.setHeader("Set-Cookie", [
    "token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "user=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ]);
  res.writeHead(302, { Location: "/" });
  res.end();
}
