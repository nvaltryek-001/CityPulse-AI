# CityPulse AI

> AI-powered smart city civic issue reporting, AI analysis, mapping, analytics and offline-first reporting platform.

## Overview

CityPulse AI is a full-stack civic technology platform for reporting urban issues, analyzing evidence with Gemini AI, storing reports in MongoDB, discovering nearby issues and generating civic analytics.

## Features

- Civic issue reporting
- Camera and gallery evidence capture
- Gemini AI image analysis
- Civic report generation
- GPS location capture
- MongoDB persistence
- GeoJSON and nearby issue search
- Leaflet and OpenStreetMap mapping
- Live Explore
- Civic analytics
- BBMP historical grievance analytics
- Offline report queue and automatic synchronization
- WhatsApp sharing
- Email sharing
- Clipboard sharing
- Native Web Share
- PWA infrastructure
- Security middleware
- API validation

## Technology Stack

Frontend: React, Vite, JavaScript, React Router, Leaflet, React Leaflet, PWA.

Backend: Node.js, Express, MongoDB, Mongoose, REST APIs.

AI: Google Gemini image analysis and structured civic issue classification.

## Architecture

Citizen -> Report Issue -> Camera/Gallery -> Gemini AI -> Civic Report

The civic report can continue to GPS, MongoDB, Geo Index, Explore, Analytics, Sharing and Offline Queue.

## API Endpoints

GET    /api/health
GET    /api/reports
POST   /api/reports
GET    /api/reports/:reportId
PATCH  /api/reports/:reportId
DELETE /api/reports/:reportId
GET    /api/reports/nearby
GET    /api/reports/nearby/stats
GET    /api/explore
GET    /api/analytics
POST   /api/reports/geo-sync/:reportId

## Environment

Create backend/.env with:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key

Never commit real credentials.

## Run Locally

Backend:
cd backend
npm install
npm run dev

Frontend:
cd frontend
npm install
npm run dev

## Production Build

cd frontend
npm run build

Output: frontend/dist

## AI Pipeline

Evidence Image -> Gemini Vision -> Structured AI Analysis -> Civic Report

AI analysis includes issue, category, severity, priority, confidence, department and recommendation.

## Offline Pipeline

When the application is offline, reports are queued locally.

When network connectivity returns, the automatic synchronization service attempts to submit queued reports to the backend API.

## Geographic System

Browser GPS -> Latitude/Longitude -> GeoJSON Point -> MongoDB 2dsphere -> Nearby Query -> Leaflet Map

## BBMP Historical Data

2020: 91,620
2021: 103,504
2022: 118,394
2023: 119,140
2024: 207,016
2025: 126,974

Total: 766,648 records.

Historical coordinates are not fabricated where source records do not provide them.

## Security

- Helmet
- CORS
- Rate limiting
- MongoDB sanitization
- API validation
- GPS validation
- Environment variables
- Dependency auditing

## Testing

- Frontend production build
- Backend JavaScript syntax
- MongoDB connectivity
- Gemini configuration
- Report create/read
- Nearby API
- Explore API
- Analytics API
- Offline infrastructure
- Sharing infrastructure
- Security infrastructure

## Project Structure

citypulse-ai/
  frontend/
  backend/
  README.md
  PROJECT_DOCUMENTATION.md
  DEPLOYMENT_CHECKLIST.md
  GITHUB_COMMIT_PREPARATION.md

## Current Status

Backend, AI, database, geographic, analytics, sharing, offline, security and testing infrastructure have been completed.

GitHub and production deployment preparation are the current phase.

Final frontend visual polish is intentionally reserved for the final phase.

## License

Add the selected project license before public distribution.
