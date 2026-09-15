# CityPulse AI - Project Documentation

## Purpose
CityPulse AI is a full-stack smart city civic issue reporting platform.

## Reporting
The reporting workflow captures evidence, processes AI analysis, enriches the report with location data and stores the resulting civic report.

## AI
Gemini is used for visual civic issue analysis and structured output including issue, category, severity, priority, confidence, recommendation and department.

## Database
MongoDB stores structured CityPulse reports. Geo-enabled reports use GeoJSON Points and a MongoDB 2dsphere index.

## Explore
Explore combines live CityPulse reports with historical BBMP civic information and supports geographic discovery.

## Analytics
Analytics exposes backend-derived civic metrics such as total, resolved, open, in-progress, critical and high-priority reports.

## Offline
Offline reports are stored in a local queue and synchronized when connectivity returns.

## Sharing
Reports can be shared through WhatsApp, email, clipboard and native Web Share where supported.

## Security
Security infrastructure includes HTTP security headers, CORS, rate limiting, MongoDB sanitization, request validation and environment-based secrets.

## Production Considerations
- Use HTTPS.
- Use production MongoDB.
- Keep Gemini credentials server-side.
- Restrict production CORS.
- Configure monitoring and logs.
- Review map tile usage.
- Use object storage for large evidence images at production scale.
- Perform real-device offline, camera and GPS testing.

## Final Frontend Phase
After deployment infrastructure is stable, perform final responsive design, accessibility, typography, spacing, navigation, loading states, error states and UX refinement.
