-- Validate the definitions used in the ThoughtSpot Retail & Supply Chain Liveboards.
-- Adapt the table name after loading the CSV to your warehouse or SQL runner.

WITH daily_metrics AS (
  SELECT
    metric_date,
    region,
    product_category,
    SUM(net_revenue_usd) AS net_revenue_usd,
    SUM(gross_margin_usd) AS gross_margin_usd,
    SUM(units_sold) AS units_sold,
    SUM(orders) AS orders,
    SUM(stockout_flag) AS stockout_events,
    COUNT(*) AS store_category_days,
    SUM(fill_rate_pct * orders) / NULLIF(SUM(orders), 0) AS weighted_fill_rate_pct,
    SUM(shipped_on_time_pct * orders) / NULLIF(SUM(orders), 0) AS weighted_on_time_pct
  FROM retail_supply_chain_daily_metrics
  GROUP BY 1, 2, 3
)
SELECT
  region,
  product_category,
  ROUND(SUM(net_revenue_usd), 2) AS net_revenue_usd,
  ROUND(SUM(gross_margin_usd) / NULLIF(SUM(net_revenue_usd), 0) * 100, 2) AS gross_margin_pct,
  SUM(units_sold) AS units_sold,
  SUM(stockout_events) AS stockout_events,
  ROUND(SUM(stockout_events) / NULLIF(SUM(store_category_days), 0) * 100, 2) AS stockout_rate_pct,
  ROUND(SUM(weighted_fill_rate_pct * orders) / NULLIF(SUM(orders), 0), 2) AS weighted_fill_rate_pct,
  ROUND(SUM(weighted_on_time_pct * orders) / NULLIF(SUM(orders), 0), 2) AS weighted_on_time_pct
FROM daily_metrics
GROUP BY 1, 2
ORDER BY stockout_rate_pct DESC, net_revenue_usd DESC;

