import React, { useState, useEffect,useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area ,Cell} from 'recharts';
import { Zap, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

const exportTableToPDF = (title, columns, rows) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [columns],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [30, 64, 175], // blue
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
};


const authFetch = async (url) => {
  const token = localStorage.getItem('access_token');

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};


const api = {
  fetchDailyEnergy: () =>
    authFetch(`${API_BASE_URL}/analytics/daily-energy`),

  fetchHourlyPower: () =>
    authFetch(`${API_BASE_URL}/analytics/hourly-average-power`),

  fetchPeakLoads: (threshold = 1500) =>
    authFetch(`${API_BASE_URL}/analytics/peak-loads?threshold=${threshold}`),

  fetchAnomalies: () =>
  authFetch(`${API_BASE_URL}/analytics/anomalies`),

};


// StatCard Component with Icon
const StatCard = ({ title, value, unit, subtitle, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800
                rounded-xl shadow-sm hover:shadow-md
                transition-shadow p-6
                border border-gray-100 dark:border-gray-700">

    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
    <div className="flex items-baseline gap-2 mb-1">
      <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
      <span className="text-base text-gray-500 dark:text-gray-400">{unit}</span>
    </div>
    {subtitle && (
      <p className="text-xs text-gray-500">{subtitle}</p>
    )}
  </div>
);

// DailyEnergyChart Component

const DailyEnergyChart = ({ data, anomalies }) => {
  const anomalyDates = new Set(
    anomalies.map(a =>
      new Date(a.timestamp).toISOString().split("T")[0]
    )
  );

  const chartData = data.map(point => ({
    ...point,
    hasAnomaly: anomalyDates.has(point.date)
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Daily Energy Consumption
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4285f4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4285f4" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(v) => `${v} kWh`} />

          <Area
            type="monotone"
            dataKey="total_energy"
            stroke="#4285f4"
            strokeWidth={3}
            fill="url(#energyGradient)"
            dot={({ cx, cy, payload }) =>
              payload.hasAnomaly ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ) : (
                <circle cx={cx} cy={cy} r={3} fill="#4285f4" />
              )
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


const HourlyPowerChart = ({ data, anomalies }) => {
  const anomalyHours = new Set(
    anomalies.map(a => new Date(a.timestamp).getHours())
  );

  const chartData = data.map(point => ({
    ...point,
    hasAnomaly: anomalyHours.has(Number(point.hour))
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Hourly Power Consumption
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip formatter={(v) => `${v} W`} />

          <Bar dataKey="avg_power" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.hasAnomaly ? "#ef4444" : "#34a853"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


// PeakLoadsTable Component
const PeakLoadsTable = ({ data, threshold, onThresholdChange }) => (
  <div className="bg-white dark:bg-gray-800
                  rounded-xl shadow-sm p-6
                  border border-gray-100 dark:border-gray-700">

    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Peak Load Events
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          High power consumption periods
        </p>
      </div>

      <div className="flex items-center gap-3
                      bg-gray-50 dark:bg-gray-700
                      px-4 py-2 rounded-lg">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Threshold:
        </label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          step="100"
          className="w-24 px-3 py-2 text-sm rounded-lg outline-none
                     bg-white dark:bg-gray-900
                     border border-gray-300 dark:border-gray-600
                     text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          W
        </span>
      </div>
    </div>
    <button
      onClick={() =>
        exportTableToPDF(
          "Peak Load Events",
          ["Timestamp", "Power (W)", "Voltage (V)", "Current (A)"],
          data.map(row => [
            new Date(row.timestamp).toLocaleString(),
            row.power,
            row.voltage,
            row.current
          ])
        )
      }
      className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm
                hover:bg-blue-700 transition"
    >
      Export PDF
    </button>

    <div className="overflow-x-auto rounded-lg
                    border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">
              Timestamp
            </th>
            <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">
              Power (W)
            </th>
            <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">
              Voltage (V)
            </th>
            <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">
              Current (A)
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No peak loads detected
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  No readings above {threshold}W threshold
                </p>
              </td>
            </tr>
          ) : (
            data.slice(0, 10).map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                  {new Date(row.timestamp).toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full
                                   text-sm font-semibold
                                   bg-red-50 dark:bg-red-900/30
                                   text-red-700 dark:text-red-300">
                    {row.power}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                  {row.voltage}
                </td>
                <td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                  {row.current}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {data.length > 10 && (
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing top 10 of{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {data.length}
          </span>{' '}
          peak events
        </p>
      </div>
    )}
  </div>
);
const AnomalyTable = ({ data }) => (
  <div className="bg-white dark:bg-gray-800
                  rounded-xl shadow-sm p-6
                  border border-red-200 dark:border-red-700 mt-8">

    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
      ⚠️ ML Detected Anomalies
    </h3>
    <button
      onClick={() =>
        exportTableToPDF(
          "Peak Load Events",
          ["Timestamp", "Power (W)", "Voltage (V)", "Current (A)"],
          data.map(row => [
            new Date(row.timestamp).toLocaleString(),
            row.power,
            row.voltage,
            row.current
          ])
        )
      }
      className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm
                hover:bg-blue-700 transition"
    >
      Export PDF
    </button>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-red-50 dark:bg-red-900/30">
          <tr>
            <th className="py-3 px-4 text-left">Time</th>
            <th className="py-3 px-4 text-left">Power (W)</th>
            <th className="py-3 px-4 text-left">Score</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="3" className="py-6 text-center text-gray-500">
                No anomalies detected 🎉
              </td>
            </tr>
          ) : (
            data.slice(0, 10).map((a, i) => (
              <tr key={i} className="border-t">
                <td className="py-3 px-4">
                  {new Date(a.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-semibold text-red-600">
                  {a.power}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {a.score?.toFixed(3)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);


// Dashboard Component
const Dashboard = () => {
  const [dailyEnergy, setDailyEnergy] = useState([]);
  const [hourlyPower, setHourlyPower] = useState([]);
  const [peakLoads, setPeakLoads] = useState([]);
  const [threshold, setThreshold] = useState(1500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('access_token');
  const [anomalies, setAnomalies] = useState([]);
  const [livePower, setLivePower] = useState([]);

  // Add these state variables at the top with your other useState declarations
const [wsConnected, setWsConnected] = useState(false);
const [liveStats, setLiveStats] = useState(null);
const wsRef = useRef(null);

// Replace your WebSocket useEffect with this:
useEffect(() => {
    const connectWebSocket = () => {
      console.log('🔌 Connecting to WebSocket...');
      
      // Use 127.0.0.1 to match your API
      const ws = new WebSocket('ws://127.0.0.1:8000/ws/live');
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected!');
        setWsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('📨 WebSocket message:', msg);
          
          if (msg.type === 'connection') {
            console.log('🎉 Connection acknowledged');
          } else if (msg.type === 'stats_update') {
            console.log('🔴 Live stats update:', msg.data);
            setLiveStats(msg.data);
            
            // Optionally update live power display
            setLivePower(prev => [...prev.slice(-20), msg.data]); // Keep last 20 readings
          }
        } catch (err) {
          console.error('❌ Error parsing message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setWsConnected(false);
      };
      
      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed. Reconnecting in 3s...');
        setWsConnected(false);
        setLiveStats(null);
        
        // Auto-reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current = ws;
    };
    
    connectWebSocket();
    
    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WebSocket');
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);


  if (!token) {
  return <Navigate to="/" replace />;
  }
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from API...');
      
     const [dailyRes, hourlyRes, peakRes, anomalyRes] = await Promise.all([
        api.fetchDailyEnergy(),
        api.fetchHourlyPower(),
        api.fetchPeakLoads(threshold),
        api.fetchAnomalies(), 
     ]);

      setAnomalies(Array.isArray(anomalyRes) ? anomalyRes : []);

      
      console.log('Daily Energy:', dailyRes);
      console.log('Hourly Power:', hourlyRes);
      console.log('Peak Loads:', peakRes);
      
      setDailyEnergy(Array.isArray(dailyRes) ? dailyRes : []);
      setHourlyPower(Array.isArray(hourlyRes) ? hourlyRes : []);
      setPeakLoads(Array.isArray(peakRes) ? peakRes : []);

      setError(null);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(`Failed to fetch data: ${err.message}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []); 

  useEffect(() => {
    fetchData();
  }, [threshold]);


  const handleThresholdChange = (newThreshold) => {
    setThreshold(newThreshold);
  };

  // Calculate stats from data
  const stats = {
    totalEnergy: dailyEnergy.reduce((sum, day) => sum + day.total_energy, 0),
    avgDailyEnergy: dailyEnergy.length > 0 
      ? (dailyEnergy.reduce((sum, day) => sum + day.total_energy, 0) / dailyEnergy.length).toFixed(2)
      : 0,
    peakPower: peakLoads.length > 0 ? Math.max(...peakLoads.map(p => p.power)) : 0,
    peakCount: peakLoads.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching energy data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Connection Error</h2>
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen
                bg-gradient-to-br
                from-blue-50 via-indigo-50 to-purple-50
                dark:from-gray-900 dark:via-gray-900 dark:to-gray-900
                text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">

            {/* LEFT: Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  GridSense
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Real-time power analytics dashboard
                </p>
              </div>
            </div>

            {/* RIGHT: LIVE INDICATOR */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {wsConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    wsConnected ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </span>

              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {wsConnected ? "LIVE" : "OFFLINE"}
              </span>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Energy"
            value={stats.totalEnergy.toFixed(2)}
            unit="kWh"
            subtitle={`Across ${dailyEnergy.length} days`}
            icon={Activity}
            color="bg-blue-600"
          />
          <StatCard
            title="Daily Average"
            value={stats.avgDailyEnergy}
            unit="kWh"
            subtitle="Average per day"
            icon={TrendingUp}
            color="bg-green-600"
          />
          <StatCard
            title="Peak Power"
            value={stats.peakPower}
            unit="W"
            subtitle="Highest recorded"
            icon={Zap}
            color="bg-orange-600"
          />
          <StatCard
            title="Peak Events"
            value={stats.peakCount}
            unit="events"
            subtitle={`Above ${threshold}W`}
            icon={AlertCircle}
            color="bg-red-600"
          />
          <StatCard
            title="Anomalies"
            value={anomalies.length}
            unit="events"
            subtitle="Detected by ML"
            icon={AlertCircle}
            color="bg-red-700"
          />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DailyEnergyChart data={dailyEnergy} anomalies={anomalies} />
          <HourlyPowerChart data={hourlyPower} anomalies={anomalies} />
        </div>

        <PeakLoadsTable 
          data={peakLoads} 
          threshold={threshold}
          onThresholdChange={handleThresholdChange}
        />
        <AnomalyTable data={anomalies} />

      </main>
    </div>
  );
};
export default Dashboard;