import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';  
import ForecastAnalysis from './pages/Prediction';
import AuthInterface from './App';
import Dashboard from './pages/dashboard';

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AuthInterface />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/forecast" element={<ForecastAnalysis />} />
    </Routes>
  </BrowserRouter>
);
