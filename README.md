Markdown
# ASTRA: Advanced Spatial Telemetry and Real-Time Analytics Engine

## Abstract
Project ASTRA is a high-performance spatial telemetry streaming and environmental intelligence platform engineered to address the critical limitations of legacy environmental monitoring systems. Traditional monitoring infrastructure frequently suffers from high batch-processing latency, excessive operator alert fatigue, and vulnerability to false-positive alarms triggered by transient sensor noise. ASTRA resolves these challenges by combining real-time digital signal processing, multivariate anomaly correlation, and automated spatial telemetry scoring into a unified, lightweight full-stack architecture.

---

## System Architecture and Engineering Design

The platform employs a decoupled client-server architecture designed for modularity, low-latency execution, and operational reliability:

+-----------------------------------------------------------------+
|                       Frontend Dashboard                        |
|       (HTML5, JavaScript, Leaflet.js, OpenStreetMap, Chart.js)  |
+-----------------------------------------------------------------+
|
REST API / JSON Telemetry
v
+-----------------------------------------------------------------+
|                    FastAPI Backend Engine                       |
|   - Pydantic Validation & Schema Enforcement                    |
|   - Exponential Moving Average (EMA) Noise Suppression Filter   |
|   - Multivariate Context & Hazard Correlation Engine            |
|   - Composite Environmental Vitality Score (EVS) Calculator     |
+-----------------------------------------------------------------+


### Core Functional Modules
1. **Interactive Spatial Telemetry Mapping (`Leaflet.js`):** Integrates open-source tile rendering to allow operators to query localized environmental parameters dynamically across arbitrary coordinate inputs.
2. **Digital Signal Processing & Noise Suppression (`EMA Filter`):** Implements an Exponential Moving Average smoothing filter ($\alpha = 0.22$) to isolate genuine environmental trends from high-frequency electrical jitter, transient dust interference, and orbital signal dropouts.
3. **Multivariate Correlation Engine:** Simultaneously analyzes cross-domain telemetry streams (such as particulate matter, toxic gas concentrations, and thermal metrics) to distinguish between isolated single-sensor glitches and correlated multi-parameter degradation events.
4. **Environmental Vitality Score (EVS):** Computes a real-time weighted composite health index on a 0 to 100 scale, synthesizing air quality metrics ($40\%$), soil and vegetation indicators ($30\%$), waste accumulation risk ($15\%$), and historical stability ($15\%$).
5. **Real-Time Oscilloscope Visualizer (`Chart.js`):** Renders high-frequency dual-line time-series comparisons contrasting raw noisy incoming data against filtered operational streams.

---

## Technology Stack

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Backend Core** | Python 3.10+, FastAPI, Pydantic, Uvicorn |
| **Frontend Interface** | HTML5, CSS3, ES6 JavaScript |
| **Geospatial & Visualization** | Leaflet.js, OpenStreetMap, Chart.js |
| **Version Control** | Git, GitHub |

---

## Repository Directory Structure

```text
ASTRA-Spatial-Telemetry/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   └── index.html
└── README.md
Installation and Deployment Guide
Prerequisites
Python 3.10 or higher installed with system path configuration.

A modern standards-compliant web browser (Chrome, Firefox, Edge).

Step 1: Clone the Repository
Bash
git clone [https://github.com/keshavk1467-cyber/ASTRA-Spatial-Telemetry.git](https://github.com/keshavk1467-cyber/ASTRA-Spatial-Telemetry.git)
cd ASTRA-Spatial-Telemetry
Step 2: Initialize and Start the Backend Server
Navigate to the backend directory, install the required dependencies, and launch the application server:

Bash
cd backend
pip install fastapi "uvicorn[standard]" pydantic
py -m uvicorn main:app --reload --port 8000
The FastAPI instance will initialize locally at http://127.0.0.1:8000.

Step 3: Launch the Frontend Dashboard
Open frontend/index.html in any standard web browser by double-clicking the file or serving it via a local static HTTP server.

Simulation and Evaluation Controls
The user interface features an integrated simulation control panel designed for academic evaluations, viva presentations, and technical demonstrations:

Normal Stream: Evaluates baseline operational parameters under clean telemetry feeds.

Inject 1s Glitch: Introduces a simulated single-sensor electrical anomaly to demonstrate real-time EMA noise suppression and false-positive prevention.

Multi-Sensor Hazard: Simulates a correlated multi-parameter degradation scenario (such as an industrial emission leak or waste site combustion) to trigger critical threshold alerts and recalculate the EVS index.git 