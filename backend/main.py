# backend/main.py
# Run with: uvicorn main:app --reload --port 8000

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import math
import random

app = FastAPI(
    title="ASTRA Concept Engine API",
    description="Real-Time Spatial Telemetry Analysis, Noise Suppression & EVS Engine",
    version="1.0.0"
)

# Enable CORS so your frontend can talk to FastAPI without browser blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. PYDANTIC SCHEMAS ---
class TelemetryRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Selected Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Selected Longitude")
    mode: str = Field("nominal", description="Simulation mode: nominal | glitch | anomaly")
    prev_smoothed_pm25: float = Field(85.0, description="Previous EMA smoothed PM2.5 state")

class TelemetryResponse(BaseModel):
    coordinates: dict
    air_quality: dict
    soil_vegetation: dict
    waste_and_history: dict
    signal_processing: dict
    evs_score: int
    environment_status: str
    anomaly_state: str
    anomaly_message: str


# --- 2. CORE MATHEMATICAL ENGINE ---
@app.post("/api/analyze", response_model=TelemetryResponse)
def analyze_spatial_telemetry(req: TelemetryRequest):
    # Generate deterministic coordinate baseline using lat/lon hash so every place feels unique
    coord_seed = abs(math.sin(req.lat * 12.9898 + req.lon * 78.233))
    
    base_pm25 = round(55 + (coord_seed * 60), 1)
    base_pm10 = round(base_pm25 * 1.65, 1)
    base_no2  = round(22 + (coord_seed * 30), 1)
    base_ndvi = round(0.62 - (coord_seed * 0.35), 2)
    base_moisture = round(48 - (coord_seed * 20), 1)
    base_waste_risk = round(20 + (coord_seed * 35), 1)

    # Apply Simulation Mode (Nominal vs. Single-Sensor Glitch vs. Multivariate Anomaly)
    if req.mode == "glitch":
        # Transient 1-tick electrical/orbital noise on PM2.5 ONLY (other sensors stay normal)
        raw_pm25 = round(base_pm25 + 210.0, 1)
        no2 = base_no2 + random.uniform(-2, 2)
        temp_c = round(29.0 + random.uniform(-0.5, 0.5), 1)
        waste_risk = base_waste_risk
    elif req.mode == "anomaly":
        # True Multivariate Hazard (Illegal Waste Fire / Industrial Leak): Air + Gas + Thermal spike together
        raw_pm25 = round(base_pm25 + 185.0, 1)
        no2 = round(base_no2 + 68.0, 1)
        temp_c = round(41.5 + random.uniform(0, 1.5), 1)
        waste_risk = 88.0
    else:
        # Nominal real-time stream with minor natural fluctuation
        raw_pm25 = round(base_pm25 + random.uniform(-6, 6), 1)
        no2 = round(base_no2 + random.uniform(-3, 3), 1)
        temp_c = round(29.5 + random.uniform(-0.8, 0.8), 1)
        waste_risk = base_waste_risk

    # Step A: Exponential Moving Average (EMA) Noise Suppression
    # Formula: X_hat_t = alpha * X_t + (1 - alpha) * X_hat_{t-1}
    alpha = 0.22 if req.mode != "anomaly" else 0.65
    smoothed_pm25 = round((alpha * raw_pm25) + ((1 - alpha) * req.prev_smoothed_pm25), 1)

    # Step B: Multivariate Context Correlation (Eliminating False Alarms)
    if req.mode == "glitch" or ((raw_pm25 - smoothed_pm25 > 75) and no2 < 65):
        anomaly_state = "NOISE_SUPPRESSED"
        anomaly_msg = "Single-sensor transient spike detected. Correlated NO2 & Thermal normal -> False alarm suppressed by EMA."
    elif smoothed_pm25 > 135 and (no2 > 65 or temp_c > 38.0):
        anomaly_state = "CRITICAL_ANOMALY"
        anomaly_msg = "Multivariate correlation alert: Simultaneous PM2.5, NO2 & Thermal surge detected at coordinates."
    else:
        anomaly_state = "NOMINAL"
        anomaly_msg = "All spatial & environmental telemetry streams within correlated baseline bounds."

    # Step C: Environmental Vitality Score (EVS) Calculation (0 to 100 scale)
    air_subscore = max(0, min(100, 100 - (smoothed_pm25 * 0.45) - (no2 * 0.25)))
    soil_subscore = max(0, min(100, (base_ndvi * 100) * 0.7 + (base_moisture * 0.3)))
    waste_subscore = max(0, min(100, 100 - waste_risk))
    hist_subscore = round(65 - (coord_seed * 20), 1)

    evs_score = int(round(
        (0.40 * air_subscore) +
        (0.30 * soil_subscore) +
        (0.15 * waste_subscore) +
        (0.15 * hist_subscore)
    ))

    env_status = "Good" if evs_score >= 70 else ("Moderate" if evs_score >= 45 else "Critical")

    return {
        "coordinates": {"lat": round(req.lat, 5), "lon": round(req.lon, 5)},
        "air_quality": {
            "us_aqi": int(round(smoothed_pm25 * 1.45)),
            "raw_pm25": raw_pm25,
            "smoothed_pm25": smoothed_pm25,
            "pm10": round(smoothed_pm25 * 1.6, 1),
            "no2": round(no2, 1),
            "so2": round(11.4 + coord_seed * 8, 1),
            "o3": round(34.0 + coord_seed * 15, 1),
            "co": round(0.8 + (0.9 if req.mode == "anomaly" else 0.1), 2),
            "temp_c": temp_c
        },
        "soil_vegetation": {
            "ndvi": base_ndvi,
            "soil_moisture_pct": base_moisture,
            "salinity_ds_m": round(1.1 + coord_seed * 1.4, 2)
        },
        "waste_and_history": {
            "waste_risk_index": round(waste_risk, 1),
            "citizen_reports_nearby": 4 if req.mode == "anomaly" else 1,
            "five_year_ndvi_delta": f"-{round(2.1 + coord_seed * 4.5, 1)}%"
        },
        "signal_processing": {
            "ema_alpha": alpha,
            "noise_reduction_pct": "80%"
        },
        "evs_score": evs_score,
        "environment_status": env_status,
        "anomaly_state": anomaly_state,
        "anomaly_message": anomaly_msg
    }