// Public configuration only. Never place passwords, API tokens, or private URLs here.
const config = {
  thoughtSpotHost: "",
  dashboards: [
    { targetId: "executive-liveboard", liveboardId: "" },
    { targetId: "inventory-liveboard", liveboardId: "" },
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
