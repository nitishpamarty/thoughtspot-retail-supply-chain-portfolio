#!/usr/bin/env python3
"""Generate deterministic, synthetic daily metrics for a ThoughtSpot portfolio demo."""

from __future__ import annotations

import csv
import math
import random
from datetime import date, timedelta
from pathlib import Path


SEED = 20260814
DAYS = 180
OUTPUT = Path(__file__).with_name("retail_supply_chain_daily_metrics.csv")

STORES = (
    ("S001", "Austin Central", "South Central", 1.20),
    ("S002", "Dallas North", "South Central", 1.12),
    ("S003", "Houston Heights", "South Central", 1.05),
    ("S004", "Chicago Loop", "Midwest", 1.16),
    ("S005", "Minneapolis Uptown", "Midwest", 0.94),
    ("S006", "Denver Union", "Mountain", 0.98),
    ("S007", "Phoenix Biltmore", "Southwest", 1.04),
    ("S008", "Seattle Capitol Hill", "Pacific", 1.10),
    ("S009", "Portland Pearl", "Pacific", 0.90),
    ("S010", "Atlanta Midtown", "Southeast", 1.02),
    ("S011", "Charlotte SouthPark", "Southeast", 0.97),
    ("S012", "Boston Seaport", "Northeast", 1.08),
)

CATEGORIES = (
    ("Apparel", 61, 0.52, 110, 11),
    ("Footwear", 88, 0.49, 75, 8),
    ("Home", 74, 0.46, 68, 6),
    ("Beauty", 39, 0.57, 145, 14),
    ("Consumer Electronics", 165, 0.31, 38, 4),
)

FIELDS = (
    "metric_date",
    "store_id",
    "store_name",
    "region",
    "product_category",
    "orders",
    "units_sold",
    "net_revenue_usd",
    "gross_margin_usd",
    "gross_margin_pct",
    "on_hand_units",
    "reorder_point_units",
    "stockout_flag",
    "fill_rate_pct",
    "shipped_on_time_pct",
    "returns_units",
)


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def main() -> None:
    rng = random.Random(SEED)
    start = date(2026, 2, 15)
    rows: list[dict[str, str | int | float]] = []

    for day_offset in range(DAYS):
        metric_date = start + timedelta(days=day_offset)
        weekly = 1 + 0.14 * math.sin((metric_date.weekday() - 1) * math.pi / 3.5)
        seasonality = 1 + 0.07 * math.sin(day_offset * math.pi / 45)

        for store_id, store_name, region, store_scale in STORES:
            for category, unit_price, margin_pct, reorder_point, base_units in CATEGORIES:
                demand = base_units * store_scale * weekly * seasonality
                demand *= rng.uniform(0.78, 1.22)

                # A purposeful operational issue creates a real, explainable finding.
                electronics_shortage = category == "Consumer Electronics" and 95 <= day_offset <= 128
                regional_shortage = region == "Pacific" and category == "Consumer Electronics"
                on_hand_multiplier = rng.uniform(0.74, 1.85)
                if electronics_shortage:
                    on_hand_multiplier *= 0.42
                if regional_shortage and 95 <= day_offset <= 128:
                    on_hand_multiplier *= 0.70

                on_hand_units = max(0, round(reorder_point * on_hand_multiplier))
                stockout = int(on_hand_units <= reorder_point * 0.55)
                constrained_demand = demand * (0.67 if stockout else 1)
                units_sold = max(1, round(constrained_demand))
                orders = max(1, round(units_sold / rng.uniform(1.25, 1.75)))
                discount_rate = rng.uniform(0.00, 0.14)
                net_revenue = units_sold * unit_price * (1 - discount_rate)
                gross_margin = net_revenue * margin_pct
                fill_rate = clamp(99.1 - stockout * rng.uniform(4.5, 9.0) - electronics_shortage * 1.7, 84, 99.8)
                on_time = clamp(97.6 - stockout * rng.uniform(1.5, 4.5) - electronics_shortage * 0.8, 88, 99.5)
                returns = round(units_sold * rng.uniform(0.018, 0.095))

                rows.append(
                    {
                        "metric_date": metric_date.isoformat(),
                        "store_id": store_id,
                        "store_name": store_name,
                        "region": region,
                        "product_category": category,
                        "orders": orders,
                        "units_sold": units_sold,
                        "net_revenue_usd": round(net_revenue, 2),
                        "gross_margin_usd": round(gross_margin, 2),
                        "gross_margin_pct": round(gross_margin / net_revenue * 100, 2),
                        "on_hand_units": on_hand_units,
                        "reorder_point_units": reorder_point,
                        "stockout_flag": stockout,
                        "fill_rate_pct": round(fill_rate, 2),
                        "shipped_on_time_pct": round(on_time, 2),
                        "returns_units": returns,
                    }
                )

    with OUTPUT.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows):,} synthetic rows to {OUTPUT}")


if __name__ == "__main__":
    main()

