# ThoughtSpot Retail & Supply Chain Portfolio

A self-directed, synthetic-data portfolio project for demonstrating ThoughtSpot Liveboard development, KPI design, SQL validation, and embedded analytics.

The public site lives in `docs/`. It is deliberately dependency-free so it can be published directly with GitHub Pages. The dashboard source data is generated from a deterministic Python script in `data/`.

## What this demonstrates

- ThoughtSpot data preparation and worksheet modeling
- Liveboards built for executive and operational audiences
- KPI definitions, metric validation, and actionable recommendations
- ThoughtSpot Visual Embed SDK integration on a GitHub Pages site
- Retail and supply-chain reporting patterns: sales, margin, inventory, stockouts, and fulfillment

## Generate the synthetic data

```bash
python3 data/generate_retail_supply_chain.py
```

This creates `data/retail_supply_chain_daily_metrics.csv`. It contains 180 days of daily store/category observations and is safe to upload to a trial tenant because it contains no real company or customer data.

## Build and publish

Follow [the build runbook](documentation/thoughtspot-build-runbook.md). It covers the few actions that must be completed in the ThoughtSpot and GitHub interfaces, plus the handoff details needed to activate the live embed.

## Public disclosure

The site and all project materials must retain the synthetic-data / self-directed-project disclosure. Do not describe this as work completed for an employer or client.
