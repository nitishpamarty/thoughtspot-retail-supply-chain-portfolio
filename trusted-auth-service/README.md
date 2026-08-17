# ThoughtSpot trusted-auth service

This Vercel serverless endpoint creates short-lived tokens for the restricted `portfolio_viewer1` ThoughtSpot user. The secret is read only from Vercel environment variables and is never part of the public GitHub Pages site.

## Deploy

1. Import this repository into Vercel and set the project root directory to `trusted-auth-service`.
2. Add the values from `.env.example` as Vercel environment variables. Enter the real `TS_SECRET_KEY` in Vercel only.
3. Deploy and copy the resulting URL: `https://YOUR-PROJECT.vercel.app/api/thoughtspot-token`.
4. In `docs/embed.js`, set `trustedAuthEndpoint` to that URL and confirm the `viewerUsername` matches the ThoughtSpot user.
5. In ThoughtSpot, add `https://nitishpamarty.github.io` to the Visual Embed/CSP allowlist.

The endpoint intentionally authenticates every public-site visitor as the same restricted user. Use only synthetic data and revoke the ThoughtSpot secret when the portfolio is no longer needed.
