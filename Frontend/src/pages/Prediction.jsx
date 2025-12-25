import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const API_BASE = "http://127.0.0.1:8000";

export default function ForecastAnalysis() {
  const [pastData, setPastData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    Promise.all([
      fetch(`${API_BASE}/analytics/daily-energy`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),

      fetch(`${API_BASE}/analytics/predict-energy?hours=24`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ])
      .then(([past, forecast]) => {
        if (!Array.isArray(past)) {
            throw new Error("Invalid daily energy data");
        }

        if (forecast?.error) {
            setError(forecast.error);
            setLoading(false);
            return;
        }

        if (!Array.isArray(forecast.predictions)) {
            throw new Error("Invalid forecast data");
        }


        // Normalize past data timestamps
        const pastFormatted = past.slice(-7).map(d => ({
          timestamp: new Date(d.date).toISOString(),
          energy: d.total_energy,
          type: "Past"
        }));

        const forecastFormatted = forecast.predictions.map(p => ({
          timestamp: p.timestamp,
          energy: p.predicted_energy,
          type: "Forecast"
        }));

        setPastData(pastFormatted);
        setForecastData(forecastFormatted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load forecast data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center
                      bg-gray-50 dark:bg-gray-900 text-gray-500">
        Loading forecast analysis…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center
                      bg-gray-50 dark:bg-gray-900 text-red-500">
        {error}
      </div>
    );
  }

  const combinedData = [...pastData, ...forecastData];

  return (
    <div className="min-h-screen p-6 space-y-6
                    bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
                    dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Energy Forecast Analysis
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Baseline ML forecast using recent energy trends
        </p>
      </div>

      {/* CHART */}
      <div className="bg-white dark:bg-gray-800
                      p-6 rounded-xl shadow-sm
                      border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />

            <XAxis
              dataKey="timestamp"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickFormatter={(v) => new Date(v).toLocaleString()}
            />

            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />

            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleString()}
            />

            <Legend />

            {/* PAST */}
            <Line
              data={pastData}
              type="monotone"
              dataKey="energy"
              name="Past Energy"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
            />

            {/* FORECAST */}
            <Line
              data={forecastData}
              type="monotone"
              dataKey="energy"
              name="Forecast (Baseline ML)"
              stroke="#7c3aed"
              strokeWidth={3}
              strokeDasharray="6 6"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard title="Model" value="Baseline Linear ML Forecast" />
        <InfoCard title="Forecast Horizon" value="Next 24 Hours" />
        <InfoCard title="Data Source" value="Live Sensor Readings" />
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800
                    p-4 rounded-lg shadow-sm
                    border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}
