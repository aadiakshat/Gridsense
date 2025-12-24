import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Zap, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

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
const DailyEnergyChart = ({ data }) => (
  <div className="bg-white dark:bg-gray-800
                rounded-xl shadow-sm p-6
                border border-gray-100 dark:border-gray-700">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daily Energy Consumption</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your energy usage over time</p>
    </div>
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4285f4" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#4285f4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#9e9e9e"
          tick={{ fontSize: 12, fill: '#757575' }}
          tickLine={false}
        />
        <YAxis 
          stroke="#9e9e9e"
          tick={{ fontSize: 12, fill: '#757575' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          formatter={(value) => [`${value} kWh`, 'Energy']}
          labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
        />
        <Area 
          type="monotone" 
          dataKey="total_energy" 
          stroke="#4285f4" 
          strokeWidth={3}
          fill="url(#colorEnergy)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// HourlyPowerChart Component
const HourlyPowerChart = ({ data }) => (
  <div className="bg-white dark:bg-gray-800
                rounded-xl shadow-sm p-6
                border border-gray-100 dark:border-gray-700">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daily Energy Consumption</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your energy usage over time</p>
    </div>
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis 
          dataKey="hour" 
          stroke="#9e9e9e"
          tick={{ fontSize: 12, fill: '#757575' }}
          tickLine={false}
          label={{ value: 'Hour', position: 'insideBottom', offset: -5, fill: '#757575' }}
        />
        <YAxis 
          stroke="#9e9e9e"
          tick={{ fontSize: 12, fill: '#757575' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          formatter={(value) => [`${value} W`, 'Avg Power']}
          labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
          cursor={{ fill: 'rgba(66, 133, 244, 0.1)' }}
        />
        <Bar 
          dataKey="avg_power" 
          fill="#34a853" 
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

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
      <header className="bg-white dark:bg-gray-800
                   shadow-sm border-b
                   border-gray-200 dark:border-gray-700">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Energy Monitor</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Real-time power analytics dashboard</p>
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
          <DailyEnergyChart data={dailyEnergy} />
          <HourlyPowerChart data={hourlyPower} />
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