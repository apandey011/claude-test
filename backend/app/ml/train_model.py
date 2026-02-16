"""Generate synthetic training data and train a route desirability model.

Run:  python -m app.ml.train_model
"""

from __future__ import annotations

import os
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
import joblib

FEATURE_NAMES = [
    "duration_ratio",
    "avg_weather_severity",
    "max_weather_severity",
    "avg_wind_speed",
    "max_wind_speed",
    "avg_precipitation",
    "max_precipitation",
    "pct_adverse_waypoints",
    "avg_precip_probability",
]

N_SAMPLES = 5000
RANDOM_SEED = 42

MODEL_PATH = os.path.join(os.path.dirname(__file__), "route_model.joblib")


def _generate_synthetic_data(
    n: int, rng: np.random.Generator
) -> tuple[np.ndarray, np.ndarray]:
    """Generate synthetic feature vectors and desirability labels (0-100)."""

    # duration_ratio: 1.0 (fastest) to ~2.0 (twice as slow)
    duration_ratio = 1.0 + rng.exponential(0.15, n).clip(0, 1.0)

    # Weather severity: 0.0 (clear) to 1.0 (extreme)
    avg_weather_severity = rng.beta(2, 5, n)  # skewed toward good weather
    max_weather_severity = np.minimum(
        1.0, avg_weather_severity + rng.exponential(0.15, n)
    )

    # Wind speed (km/h): 0 to ~120
    avg_wind_speed = rng.exponential(12, n).clip(0, 80)
    max_wind_speed = avg_wind_speed + rng.exponential(10, n).clip(0, 60)

    # Precipitation (mm): mostly 0, sometimes up to ~15
    avg_precipitation = rng.exponential(0.8, n).clip(0, 12)
    max_precipitation = avg_precipitation + rng.exponential(1.0, n).clip(0, 15)

    # Fraction of adverse waypoints: 0.0 to 1.0
    pct_adverse = rng.beta(1.5, 6, n)

    # Precipitation probability %: 0 to 100
    avg_precip_probability = rng.beta(2, 5, n) * 100

    X = np.column_stack(
        [
            duration_ratio,
            avg_weather_severity,
            max_weather_severity,
            avg_wind_speed,
            max_wind_speed,
            avg_precipitation,
            max_precipitation,
            pct_adverse,
            avg_precip_probability,
        ]
    )

    # --- Label function ---
    # Score = 100 minus penalties. Favors quicker routes (60%) and clear weather (40%).

    # Duration penalty: 0 when ratio=1.0, ramps up
    duration_penalty = (duration_ratio - 1.0) * 60  # 0-60 range

    # Weather penalty from average severity
    weather_penalty = avg_weather_severity * 25

    # Extreme-condition penalty from max severity
    extreme_penalty = np.where(max_weather_severity > 0.7, (max_weather_severity - 0.7) * 30, 0.0)

    # Wind penalty
    wind_penalty = np.where(avg_wind_speed > 50, (avg_wind_speed - 50) / 50 * 10, 0.0)

    # Precipitation penalty
    precip_penalty = avg_precipitation / 10 * 10

    # Adverse waypoint penalty
    adverse_penalty = pct_adverse * 15

    raw_score = 100 - duration_penalty - weather_penalty - extreme_penalty - wind_penalty - precip_penalty - adverse_penalty

    # Add small noise to avoid a perfectly deterministic mapping
    noise = rng.normal(0, 1.5, n)
    y = np.clip(raw_score + noise, 0, 100)

    return X, y


def train_and_save() -> None:
    rng = np.random.default_rng(RANDOM_SEED)
    X, y = _generate_synthetic_data(N_SAMPLES, rng)

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        min_samples_leaf=10,
        random_state=RANDOM_SEED,
    )
    model.fit(X, y)

    # Quick sanity check
    train_score = model.score(X, y)
    print(f"Training R² = {train_score:.4f}")

    # Show feature importances
    for name, importance in sorted(
        zip(FEATURE_NAMES, model.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {name}: {importance:.4f}")

    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")


if __name__ == "__main__":
    train_and_save()
