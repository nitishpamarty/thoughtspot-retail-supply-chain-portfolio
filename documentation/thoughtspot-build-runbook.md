# ThoughtSpot build and publish runbook

## Objective

Publish a polished, self-directed ThoughtSpot portfolio case study that demonstrates liveboard design, KPI governance, SQL validation, and embedded analytics. The underlying data is synthetic; the site must say so clearly.

## The two actions only you must perform

1. Create and activate a ThoughtSpot trial with your own business email at [ThoughtSpot’s trial page](https://www.thoughtspot.com/trial). The current page advertises a 14-day, no-credit-card trial. Do not send a password, session cookie, or API token in chat.
2. Create an empty public GitHub repository named `thoughtspot-retail-supply-chain-portfolio` under `nitishpamarty` (or tell me the preferred GitHub username/repository name). Repository creation and enabling GitHub Pages are account actions that need your authorization.

After activation, send only:

- The ThoughtSpot cluster hostname, for example `https://my1.thoughtspot.cloud`.
- Confirmation that you are signed in to the same browser we will use for the build.
- The GitHub repository URL.

I can then perform the in-tenant build alongside you, update the embed configuration, and prepare the exact files for publication. If ThoughtSpot asks for a permitted embedding domain, add `https://nitishpamarty.github.io` (or the GitHub Pages domain for the actual account) and `http://localhost:8000` for local testing.

## Data load

Run:

```bash
python3 data/generate_retail_supply_chain.py
```

In ThoughtSpot:

1. Open **Data** and create a **Data set**.
2. Upload `data/retail_supply_chain_daily_metrics.csv`.
3. Name it `Retail Supply Chain Daily Metrics`.
4. Confirm `metric_date` is a date, revenue and margin are numbers/currency, `stockout_flag` is an integer, and the remaining dimensions are text.
5. Add business-friendly column names and descriptions. A person searching should see `Net Revenue`, `Gross Margin`, `Fill Rate`, and `On-Time Shipment`—not database-style field names.

If the tenant does not offer CSV upload, use its sample retail data for the first build and we will switch to a connected warehouse later. ThoughtSpot’s current trial onboarding documentation lists flat-file upload as a supported trial path.

## Worksheet / semantic layer

Create a worksheet named `Retail Operations Metrics` using the uploaded data set. Define the measures below and format revenue/margin as USD and percentage metrics with one decimal place.

| Business metric | Definition | Validation note |
|---|---|---|
| Net Revenue | `sum(net_revenue_usd)` | Never average row-level revenue |
| Gross Margin % | `sum(gross_margin_usd) / sum(net_revenue_usd)` | Weighted, not average of percentages |
| Stockout Rate % | `sum(stockout_flag) / count(*)` | Unit is store-category-day |
| Fill Rate % | weighted by `orders` | Prevents low-volume rows distorting the metric |
| On-Time Shipment % | weighted by `orders` | Same weighting rule |
| Return Rate % | `sum(returns_units) / sum(units_sold)` | Use only when units sold is nonzero |

`sql/metric_validation.sql` is the independent SQL check for the metric definitions and the interview talking point for validation discipline.

## Liveboards to build

### 1. Executive Commerce & Supply Chain Command Center

Audience: executive or business leader.

- KPI tiles: Net Revenue, Gross Margin %, Fill Rate %, On-Time Shipment %, Stockout Rate %.
- 180-day revenue and gross-margin trend.
- Revenue by region, sorted descending.
- Sales mix by product category.
- A concise insight text block: Consumer Electronics stockouts increased during the mid-period replenishment disruption, with a larger impact in Pacific stores.

### 2. Inventory & Fulfillment Health

Audience: supply-chain operations leader.

- Stockout Rate % by product category and region (heat map or sorted bar chart).
- On-hand units versus reorder point by store/category.
- Fill Rate % and On-Time Shipment % trend.
- Detail table filtered to `stockout_flag = 1`, including date, store, region, category, on-hand units, reorder point, fill rate, and net revenue.

### 3. Store & Category Performance Explorer

Audience: regional manager / merchandising partner.

- Net Revenue by store with region/category filters.
- Gross Margin % by category.
- Units sold versus return rate.
- Search-driven exploration enabled so an interviewer can ask follow-up questions such as “Consumer Electronics stockouts in Pacific last month”.

## Build workflow and evidence

1. Build each visual as an **Answer** first, using clear business titles.
2. Pin answers to the matching Liveboard; keep the executive board focused on decision-making rather than implementation detail.
3. Use **Develop → Playground** to copy the `liveboardId` for the Executive board. This is the reliable way to retrieve the identifier and embed code.
4. Export the completed Liveboards / worksheet as TML and store the exports in a non-public local `exports/` folder for repeatability. ThoughtSpot’s TML tooling is intended for programmatic lifecycle management; exports may include tenant-specific IDs, so do not publish those until we review them.
5. Capture clean screenshots of all three boards. Screenshots remain publicly visible even if the trial expires; the embedded board will be labeled as requiring ThoughtSpot access if the trial cannot support public anonymous access.

## Activate the portfolio embed

Edit `docs/embed.js` after the liveboard exists:

```js
thoughtSpotHost: "https://YOUR-TRIAL-HOST",
liveboardId: "YOUR-EXECUTIVE-LIVEBOARD-ID",
```

The included static site loads ThoughtSpot’s Visual Embed SDK directly as an ES module. The free-trial documentation uses `AuthType.None`, which prompts a viewer to sign in; that is suitable for a technical demonstration but is not a true anonymous public dashboard. Do not claim a public live dashboard unless the tenant explicitly supports and is configured for guest/anonymous embedding. The public website should still include screenshots and the project write-up so recruiters can see the work without an account.

## Publish with GitHub Pages

After the GitHub repository exists:

```bash
git init
git add .
git commit -m "Create ThoughtSpot retail supply chain portfolio"
git branch -M main
git remote add origin https://github.com/OWNER/thoughtspot-retail-supply-chain-portfolio.git
git push -u origin main
```

On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → main /docs**. The portfolio URL will be `https://OWNER.github.io/thoughtspot-retail-supply-chain-portfolio/`.

Before publishing, make sure the `docs/` copy retains the disclosure and does not contain credentials, access tokens, API keys, or private ThoughtSpot links that expose data.
