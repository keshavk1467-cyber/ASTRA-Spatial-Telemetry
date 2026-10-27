# ASTRA-Spatial-Telemetry
# ASTRA: Advanced Spatial Telemetry & Real-Time Analytics

## Overview
Project ASTRA is a real-time spatial telemetry streaming engine and environmental intelligence concept simulator. Designed to bridge orbital asset monitoring and terrestrial environmental assessment, the platform processes high-frequency data streams, suppresses transient sensor noise using digital signal processing, executes multivariate anomaly detection, and calculates a composite Environmental Vitality Score (EVS).

## Core Architecture and Features
- **Interactive Geospatial Mapping:** Integrates OpenStreetMap tiles via Leaflet.js, allowing users to select arbitrary geographic coordinates (latitude and longitude) to query localized environmental metrics.
- **Automated Noise Suppression:** Utilizes an Exponential Moving Average (EMA) filter to smooth raw time-series data, eliminating transient single-sensor spikes and reducing false-positive rates by up to 80 percent.
- **Multivariate Context Engine:** Evaluates inter-sensor correlations simultaneously (such as particulate matter combined with toxic gases and thermal telemetry) to differentiate between isolated sensor glitches and genuine environmental hazards.
- **Environmental Vitality Score (EVS):** Computes a weighted composite index on a 0 to 100 scale, synthesizing air quality, soil moisture, NDVI vegetation metrics, and historical land-use stability.
- **Real-Time Oscilloscope Visualizer:** Implements Chart.js to render a live, dual-line time-series graph contrasting raw noisy signals against ASTRA-filtered telemetry streams.

## Technology Stack
- **Backend:** Python 3.10+, FastAPI, Pydantic, Uvicorn
- **Frontend:** HTML5, JavaScript (ES6+), Leaflet.js, OpenStreetMap, Chart.js

## Project Directory Structure
ASTRA-Spatial-Telemetry/
├── backend/
│   ├── main.py
│   └── requirements.txt
└── frontend/
└── index.html
## Installation and Execution Guide

### Prerequisites
Ensure Python 3.10 or higher and a modern web browser are installed on your system.

### Step 1: Clone the Repository
```bash
git clone [https://github.com/keshavk1467-cyber/ASTRA-Spatial-Telemetry.git](https://github.com/keshavk1467-cyber/ASTRA-Spatial-Telemetry.git)
cd ASTRA-Spatial-Telemetry

### Step 2: Start the FastAPI Backend Server
```bash
Navigate to the backend directory, install the required dependencies, and launch the application server:

cd backend
pip install fastapi "uvicorn[standard]" pydantic
py -m uvicorn main:app --reload --port 8000

### Step 3: Launch the Frontend Dashboard
```bash 
Open the frontend/index.html file in any standard web browser (such as Google Chrome, Mozilla Firefox, or Microsoft Edge) by double-clicking the file or hosting it via a local static server.