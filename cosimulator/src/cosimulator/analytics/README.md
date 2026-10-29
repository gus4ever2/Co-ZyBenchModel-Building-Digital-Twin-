# Simulation analytics

This module reads simulation timesteps from MongoDB and returns summaries to
the existing FastAPI endpoints. It does not write results back to MongoDB.

## Read the code in this order

1. `data.py` converts one raw MongoDB document into `AnalyticsInput`.
2. `runner.py` reads the cursor once and calls every selected calculation for
   every timestamp.
3. `registry.py` is only the short list of standard calculations.
4. `calculations/` groups functions by subject: energy, air quality, thermal
   conditions, building geometry, green walls and comparisons.

## One analytic

Each analytic consists of three small pieces:

```text
AnalyticsInput      one timestamp shared by all calculations
XxxData             a dataclass retaining only this analytic's state
calculate_xxx(...)  reads one timestamp and changes XxxData
XxxResult           a Pydantic model returned to FastAPI at the end
```

The runner calls `calculate_xxx(input, data)` once per timestep. When the
cursor is exhausted, it creates the Pydantic result from the finished data.
There are no analytic implementation classes, Polars tables or batch schemas.

## Comparison

`comparison.py` stores a compact baseline point once for each
`timestamp + zone`. When a scenario point arrives, it calculates the delta
immediately. It therefore does not retain complete MongoDB documents or repeat
the same baseline calculation for CO2, temperature and chart output.

## HTTP compatibility

The public endpoint paths and response keys remain unchanged:

- `GET /simulations/{id}/analytics`
- `POST /simulations/{id}/analytics`
- `POST /simulations/analytics/comparison`
- `GET /simulations/{id}/results/latest`

The frontend continues to receive `results`, flat `metrics` and `zones`.


## Seasonal energy and difference convention

`seasonal_energy` follows the same dataclass/function/result registry as the
other calculations. In the existing single timestep pass, it separates
May–September (five months) from October–April (seven months), keeping heating,
cooling and total HVAC electricity totals and graph points for each period.
EnergyPlus timestamps mark interval ends, so midnight at a period boundary
belongs to the preceding interval. Null points break lines across excluded
months; missing meters remain null rather than being presented as zero.

The comparison service adds seasonal aggregate differences and aligns HVAC
graph differences by timestamp against the first selected simulation. All
energy and CO2 differences use **compared minus baseline**. Percentage changes
use the baseline as denominator; a missing or zero baseline has no defined
percentage. Calculations are returned by Python; the frontend formats and
plots those results. Seasonal HVAC values describe the whole building, not a
separate electricity meter for the green wall or windows.
