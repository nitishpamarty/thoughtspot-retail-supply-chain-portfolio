const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://nitishpamarty.github.io";

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Vary", "Origin");
}

export default async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });

  const { TS_HOST, TS_SECRET_KEY, TS_USERNAME } = process.env;
  if (!TS_HOST || !TS_SECRET_KEY || !TS_USERNAME) {
    return response.status(503).json({ error: "Trusted authentication is not configured." });
  }

  try {
    const tokenResponse = await fetch(`${TS_HOST.replace(/\/$/, "")}/api/rest/2.0/auth/token/full`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-By": "ThoughtSpot",
      },
      body: JSON.stringify({
        username: TS_USERNAME,
        secret_key: TS_SECRET_KEY,
        validity_time_in_sec: 300,
        auto_create: false,
      }),
    });

    const payload = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !payload.token) {
      return response.status(502).json({ error: "ThoughtSpot token request failed." });
    }

    response.setHeader("Cache-Control", "no-store");
    return response.status(200).json({ token: payload.token });
  } catch {
    return response.status(502).json({ error: "ThoughtSpot token service is unavailable." });
  }
}
