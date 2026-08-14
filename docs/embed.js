// Public configuration only. Never place passwords, API tokens, or private URLs here.
const config = {
  thoughtSpotHost: "https://team1.thoughtspot.cloud",
  // Set this after deploying trusted-auth-service. Never put a secret in this file.
  trustedAuthEndpoint: "",
  viewerUsername: "portfolio_viewer",
  dashboards: [
    { targetId: "executive-liveboard", liveboardId: "bd7b5c81-ed4f-47f7-b809-f9c2bd81573f" },
    { targetId: "inventory-liveboard", liveboardId: "1e0245fd-528b-48ff-978f-fc2d8f614bb6" },
  ],
};

const status = document.querySelector("#embed-status");
const readyDashboards = config.dashboards.filter(({ liveboardId }) => liveboardId);
const canEmbed = config.thoughtSpotHost && config.trustedAuthEndpoint && config.viewerUsername && readyDashboards.length;

if (canEmbed) {
  try {
    const { init, AuthType, LiveboardEmbed } = await import(
      "https://cdn.jsdelivr.net/npm/@thoughtspot/visual-embed-sdk/dist/tsembed.es.js"
    );

    init({
      thoughtSpotHost: config.thoughtSpotHost,
      // Cookieless trusted auth avoids a ThoughtSpot login prompt and third-party-cookie issues.
      authType: AuthType.TrustedAuthTokenCookieless,
      username: config.viewerUsername,
      getAuthToken: async () => {
        const response = await fetch(config.trustedAuthEndpoint, { credentials: "omit" });
        if (!response.ok) throw new Error("Trusted authentication token request failed.");
        const { token } = await response.json();
        if (!token) throw new Error("Trusted authentication service returned no token.");
        return token;
      },
    });

    for (const { targetId, liveboardId } of readyDashboards) {
      document.querySelector(`#${targetId}`).replaceChildren();
      new LiveboardEmbed(`#${targetId}`, {
        liveboardId,
        frameParams: { width: "100%", height: "620px" },
      }).render();
    }

    status.textContent = "Interactive ThoughtSpot Liveboards · synthetic portfolio data";
  } catch (error) {
    console.error("ThoughtSpot embed failed to initialize.", error);
    status.textContent = "Interactive dashboards are temporarily unavailable; previews remain available.";
  }
} else {
  status.textContent = "ThoughtSpot Liveboard previews · trusted interactive access is being configured.";
}

const flowStatus = document.querySelector("#flow-status");
const flowNodes = document.querySelectorAll(".flow-card");

for (const node of flowNodes) {
  node.addEventListener("click", () => {
    for (const item of flowNodes) item.classList.toggle("is-selected", item === node);
    flowStatus.textContent = node.dataset.flowDetail;
  });
}
