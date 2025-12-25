⚡ GridSense — Real-Time Energy Analytics & ML Forecasting Platform

GridSense is a full-stack energy monitoring and analytics platform that ingests live power readings, detects anomalies using machine learning, and generates short-term energy forecasts through an interactive dashboard.

The project focuses on real-world backend engineering and explainable ML, not toy demos or black-box models.

🚀 Key Features
🔐 Secure Data Ingestion

JWT-protected REST APIs for ingesting power readings

Stores voltage, current, power, energy, timestamps

SQLite used for persistent storage (production-ready schema)

📊 Energy Analytics

Daily energy consumption aggregation

Hourly average power analysis

Peak load detection with configurable thresholds

Historical analytics backed by SQL queries (not hardcoded data)

🚨 ML-Based Anomaly Detection

Uses Isolation Forest for anomaly detection

Rolling feature engineering on recent sensor data

Stores anomaly flags and scores in the database

Visual anomaly indicators on charts and tables

🔮 Energy Forecasting (Machine Learning)

Short-term energy forecasting (hour-level)

Lightweight Linear Regression model

Rolling statistical features:

Last observed energy

Rolling mean energy

Hour of day

Weekend indicator

Forecasts generated strictly for future timestamps

Designed as a baseline, explainable ML model

📡 Real-Time Updates

WebSocket support for live power updates

Real-time dashboard refresh without polling

📤 Data Export

Export analytics tables (peak loads, anomalies) as PDF

Designed for reporting and audit use-cases

🧠 Forecasting Design Philosophy

This project intentionally avoids over-complex models (LSTM, transformers) in favor of:

Explainability

Stability with sparse real-world data

Easy debugging and reasoning

Interview-safe ML decisions

The forecast iteratively predicts future energy values by feeding previous predictions back into the model using rolling statistics.

🛠 Tech Stack
Backend

FastAPI

SQLAlchemy

SQLite

JWT Authentication

WebSockets

Pandas

Scikit-learn

Frontend

React (Vite)

Tailwind CSS

Recharts

Lucide Icons

Machine Learning

Isolation Forest (Anomaly Detection)

Linear Regression (Energy Forecasting)

Time-series feature engineering

🔐 Security

All analytics and forecasting endpoints are JWT-protected

Secure token-based access

Ready for role-based access control (RBAC)

📈 API Endpoints (Core)
Endpoint	Description
/auth/login	User authentication
/analytics/daily-energy	Daily energy aggregation
/analytics/hourly-average-power	Hourly power analysis
/analytics/peak-loads	Peak load detection
/analytics/anomalies	ML-detected anomalies
/analytics/predict-energy	ML-based energy forecast
/ws/live	Real-time power updates
📖 What This Project Demonstrates

End-to-end ML integration (training → inference → visualization)

Real backend engineering (auth, DB, WebSockets)

Handling real issues: sparse data, time alignment, auth blocking ML

Explainable ML over hype-driven models

Production-style API and data persistence

📌 Project Status

Fully functional backend and frontend

Stable ML pipelines

SQLite persistence

Export functionality implemented

Designed for extensibility

🚀 Future Enhancements

Confidence intervals for forecasts

Scheduled model retraining

Email / SMS alerts for anomalies

Multi-sensor support

PostgreSQL migration for large-scale deployment
