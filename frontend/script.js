        // --- 1. INITIALIZE LEAFLET MAP (Centered on Greater Noida / NCR) ---
        let currentLat = 28.57405;
        let currentLon = 77.21541;
        let simMode = 'nominal';
        let smoothedPm25 = 84.0;

        const map = L.map('map').setView([currentLat, currentLon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Fixes grid/flexbox collapsing bug in Leaflet
        setTimeout(() => {
            map.invalidateSize();
        }, 250);
        let marker = L.circleMarker([currentLat, currentLon], {
            radius: 9, color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.85
        }).addTo(map);

        map.on('click', (e) => {
            currentLat = e.latlng.lat;
            currentLon = e.latlng.lng;
            marker.setLatLng([currentLat, currentLon]);
            tickTelemetry();
        });

        // --- 2. INITIALIZE REAL-TIME DUAL-LINE CHART ---
        const ctx = document.getElementById('telemetryChart').getContext('2d');
        const labels = Array(20).fill('');
        const rawData = Array(20).fill(84);
        const filteredData = Array(20).fill(84);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Raw Unfiltered Sensor Stream (Noisy)',
                        data: rawData,
                        borderColor: '#ef4444',
                        borderDash: [4, 4],
                        borderWidth: 1.5,
                        pointRadius: 0,
                        tension: 0.2
                    },
                    {
                        label: 'ASTRA EMA Filtered Stream',
                        data: filteredData,
                        borderColor: '#38bdf8',
                        borderWidth: 2.5,
                        pointRadius: 0,
                        tension: 0.35
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
                scales: {
                    x: { display: false },
                    y: { suggestedMin: 40, suggestedMax: 320, grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 10 } } }
                }
            }
        });

        // --- 3. SIMULATION MODE SWITCHER ---
        function setSimMode(mode) {
            simMode = mode;
            document.getElementById('btn-nom').className = mode === 'nominal' ? 'active-nom' : '';
            document.getElementById('btn-gli').className = mode === 'glitch' ? 'active-gli' : '';
            document.getElementById('btn-ano').className = mode === 'anomaly' ? 'active-ano' : '';
            tickTelemetry();
        }

        // --- 4. STREAM TICK (Calls FastAPI if running, or falls back to local math engine) ---
        async function tickTelemetry() {
            let data;
            try {
                const res = await fetch('http://localhost:8000/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lat: currentLat, lon: currentLon,
                        mode: simMode, prev_smoothed_pm25: smoothedPm25
                    })
                });
                data = await res.json();
            } catch (err) {
                // Built-in Fallback Engine so GitHub Pages / offline demo never breaks
                const seed = Math.abs(Math.sin(currentLat * 12.9898 + currentLon * 78.233));
                const basePm = 55 + seed * 60;
                const rawPm = simMode === 'glitch' ? basePm + 210 : (simMode === 'anomaly' ? basePm + 185 : basePm + (Math.random() * 12 - 6));
                const alpha = simMode === 'anomaly' ? 0.65 : 0.22;
                smoothedPm25 = +(alpha * rawPm + (1 - alpha) * smoothedPm25).toFixed(1);
                const no2 = +(22 + seed * 30 + (simMode === 'anomaly' ? 68 : (Math.random() * 4 - 2))).toFixed(1);
                const temp = +(29.5 + (simMode === 'anomaly' ? 12 : (Math.random() - 0.5))).toFixed(1);
                const ndvi = +(0.62 - seed * 0.35).toFixed(2);
                const moisture = +(48 - seed * 20).toFixed(1);
                const waste = simMode === 'anomaly' ? 88.0 : +(20 + seed * 35).toFixed(1);

                const airSub = Math.max(0, Math.min(100, 100 - smoothedPm25 * 0.45 - no2 * 0.25));
                const soilSub = Math.max(0, Math.min(100, ndvi * 70 + moisture * 0.3));
                const evs = Math.round(0.4 * airSub + 0.3 * soilSub + 0.15 * (100 - waste) + 0.15 * 55);

                data = {
                    coordinates: { lat: currentLat.toFixed(5), lon: currentLon.toFixed(5) },
                    air_quality: {
                        us_aqi: Math.round(smoothedPm25 * 1.45), raw_pm25: +rawPm.toFixed(1),
                        smoothed_pm25: smoothedPm25, pm10: +(smoothedPm25 * 1.6).toFixed(1),
                        no2: no2, so2: +(12 + seed * 8).toFixed(1), co: simMode === 'anomaly' ? 1.85 : 0.85, temp_c: temp
                    },
                    soil_vegetation: { ndvi: ndvi, soil_moisture_pct: moisture, salinity_ds_m: +(1.1 + seed * 1.3).toFixed(2) },
                    waste_and_history: { waste_risk_index: waste, citizen_reports_nearby: simMode === 'anomaly' ? 4 : 1, five_year_ndvi_delta: `-${(2.1 + seed * 4).toFixed(1)}%` },
                    evs_score: evs,
                    environment_status: evs >= 70 ? 'Good Vitality' : (evs >= 45 ? 'Moderate Vitality' : 'Critical Stress'),
                    anomaly_state: simMode === 'glitch' ? 'NOISE_SUPPRESSED' : (simMode === 'anomaly' ? 'CRITICAL_ANOMALY' : 'NOMINAL'),
                    anomaly_message: simMode === 'glitch'
                        ? 'Single-sensor spike (+210 µg/m³) detected. Correlated NO₂ & Thermal stable → False alarm suppressed by EMA.'
                        : (simMode === 'anomaly'
                            ? 'Multivariate correlation alert: Simultaneous PM2.5, NO₂ & Thermal surge detected at coordinates!'
                            : 'All spatial & environmental telemetry streams within correlated baseline bounds.')
                };
            }

            smoothedPm25 = data.air_quality.smoothed_pm25;

            // Update Sidebar UI
            document.getElementById('ui-lat').innerText = data.coordinates.lat;
            document.getElementById('ui-lon').innerText = data.coordinates.lon;
            document.getElementById('ui-evs').innerText = data.evs_score;
            document.getElementById('ui-env-status').innerText = data.environment_status;
            document.getElementById('ui-aqi').innerText = `${data.air_quality.us_aqi} US AQI`;
            document.getElementById('ui-pm25').innerText = `${data.air_quality.smoothed_pm25} µg/m³`;
            document.getElementById('ui-pm10').innerText = `${data.air_quality.pm10} µg/m³`;
            document.getElementById('ui-no2').innerText = data.air_quality.no2;
            document.getElementById('ui-so2').innerText = data.air_quality.so2;
            document.getElementById('ui-co').innerText = `${data.air_quality.co} ppm`;
            document.getElementById('ui-temp').innerText = `${data.air_quality.temp_c} °C`;
            document.getElementById('ui-ndvi').innerText = data.soil_vegetation.ndvi;
            document.getElementById('ui-moisture').innerText = `${data.soil_vegetation.soil_moisture_pct} %`;
            document.getElementById('ui-salinity').innerText = `${data.soil_vegetation.salinity_ds_m} dS/m`;
            document.getElementById('ui-waste').innerText = `${data.waste_and_history.waste_risk_index} / 100`;
            document.getElementById('ui-reports').innerText = `${data.waste_and_history.citizen_reports_nearby} Active`;
            document.getElementById('ui-hist').innerText = data.waste_and_history.five_year_ndvi_delta;

            // Update Alert Box & Marker Color
            const alertBox = document.getElementById('ui-alert-box');
            if (data.anomaly_state === 'NOISE_SUPPRESSED') {
                alertBox.style.background = 'rgba(245,158,11,0.12)';
                alertBox.style.borderColor = 'rgba(245,158,11,0.4)';
                alertBox.style.color = '#fde68a';
                marker.setStyle({ color: '#f59e0b', fillColor: '#f59e0b' });
                // Automatically return from 1-second glitch to nominal on next tick
                setTimeout(() => { if (simMode === 'glitch') setSimMode('nominal'); }, 1400);
            } else if (data.anomaly_state === 'CRITICAL_ANOMALY') {
                alertBox.style.background = 'rgba(239,68,68,0.15)';
                alertBox.style.borderColor = 'rgba(239,68,68,0.5)';
                alertBox.style.color = '#fecaca';
                marker.setStyle({ color: '#ef4444', fillColor: '#ef4444' });
            } else {
                alertBox.style.background = 'rgba(34,197,94,0.08)';
                alertBox.style.borderColor = 'rgba(34,197,94,0.3)';
                alertBox.style.color = '#bbf7d0';
                marker.setStyle({ color: '#38bdf8', fillColor: '#38bdf8' });
            }
            alertBox.innerHTML = `<strong>STATUS — ${data.anomaly_state}:</strong> ${data.anomaly_message}`;

            // Update Oscilloscope Chart
            rawData.push(data.air_quality.raw_pm25);
            rawData.shift();
            filteredData.push(data.air_quality.smoothed_pm25);
            filteredData.shift();
            chart.update();
        }

        setInterval(tickTelemetry, 1200);
        tickTelemetry();