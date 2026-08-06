let token = { value: null, expiresAt: 0 };

async function getToken(clientId, clientSecret) {
  if (token.value && Date.now() < token.expiresAt) return token.value;

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) throw new Error("token http " + res.status);

  const json = await res.json();
  token = {
    value: json.access_token,
    expiresAt: Date.now() + Math.max(json.expires_in - 60, 60) * 1000,
  };
  return token.value;
}

module.exports = async (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const login = process.env.TWITCH_LOGIN;

  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

  if (!clientId || !clientSecret || !login) {
    return res.status(200).json({ isLive: false, configured: false });
  }

  try {
    const accessToken = await getToken(clientId, clientSecret);
    const url = "https://api.twitch.tv/helix/streams?user_login=" + encodeURIComponent(login);
    const twitch = await fetch(url, {
      headers: { "Client-Id": clientId, Authorization: "Bearer " + accessToken },
    });

    if (!twitch.ok) throw new Error("helix http " + twitch.status);

    const json = await twitch.json();
    const stream = (json.data || [])[0];

    if (!stream) return res.status(200).json({ isLive: false, configured: true });

    return res.status(200).json({
      isLive: true,
      configured: true,
      title: stream.title,
      game: stream.game_name,
      viewers: stream.viewer_count,
      startedAt: stream.started_at,
    });
  } catch (err) {
    return res.status(200).json({ isLive: false, configured: true, error: true });
  }
};
