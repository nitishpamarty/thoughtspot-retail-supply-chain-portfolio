// Public configuration only. Never place passwords, API tokens, or private URLs here.
const config = {
  thoughtSpotHost: "https://team1.thoughtspot.cloud",
  dashboards: [
    { targetId: "executive-liveboard", liveboardId: "bd7b5c81-ed4f-47f7-b809-f9c2bd81573f" },
    { targetId: "inventory-liveboard", liveboardId: "1e0245fd-528b-48ff-978f-fc2d8f614bb6" },
  ],
};

const status = document.querySelector("#embed-status");
const readyDashboards = config.dashboards.filter(({ liveboardId }) => liveboardId);

if (config.thoughtSpotHost && readyDashboards.length) {
  try {
    const { init, AuthType, LiveboardEmbed } = await import(
      "https://cdn.jsdelivr.net/npm/@thoughtspot/visual-embed-sdk/dist/tsembed.es.js"
    );

    init({
      thoughtSpotHost: config.thoughtSpotHost,
      // Trial use: a signed-in ThoughtSpot user will be prompted to authenticate.
      authType: AuthType.None,
    });

    for (const { targetId, liveboardId } of readyDashboards) {
      document.querySelector(`#${targetId}`).replaceChildren();
      new LiveboardEmbed(`#${targetId}`, {
        liveboardId,
        frameParams: { width: "100%", height: "620px" },
      }).render();
    }

    status.textContent = "Interactive access may require a ThoughtSpot sign-in.";
  } catch (error) {
    console.error("ThoughtSpot embed failed to initialize.", error);
    status.textContent = "The Liveboards could not load.";
  }
}

const flowStatus = document.querySelector("#flow-status");
const flowNodes = document.querySelectorAll(".flow-card");

for (const node of flowNodes) {
  node.addEventListener("click", () => {
    for (const item of flowNodes) item.classList.toggle("is-selected", item === node);
    flowStatus.textContent = node.dataset.flowDetail;
  });
}
