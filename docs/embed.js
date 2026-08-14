// Public configuration only. Never place passwords, API tokens, or private URLs here.
const config = {
  thoughtSpotHost: "",
  liveboardId: "",
};

const target = document.querySelector("#thoughtspot-liveboard");
const status = document.querySelector("#embed-status");

if (config.thoughtSpotHost && config.liveboardId) {
  try {
    const { init, AuthType, LiveboardEmbed } = await import(
      "https://cdn.jsdelivr.net/npm/@thoughtspot/visual-embed-sdk/dist/tsembed.es.js"
    );

    init({
      thoughtSpotHost: config.thoughtSpotHost,
      // Trial use: a signed-in ThoughtSpot user will be prompted to authenticate.
      // Use an approved production authentication model before offering anonymous access.
      authType: AuthType.None,
    });

    target.replaceChildren();
    const liveboard = new LiveboardEmbed("#thoughtspot-liveboard", {
      liveboardId: config.liveboardId,
      frameParams: { width: "100%", height: "570px" },
    });
    liveboard.render();
    status.textContent = "Interactive ThoughtSpot Liveboard. A ThoughtSpot sign-in may be required by the trial tenant.";
  } catch (error) {
    console.error("ThoughtSpot embed failed to initialize.", error);
    status.textContent = "The interactive Liveboard could not load. Review the public case study and dashboard evidence below.";
  }
}
