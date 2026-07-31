# CityPulse AI -- Setup Guide (Phase 1: Auth + Firestore, Phase 2: Live Dashboard)

Everything below uses **free tiers only**. No credit card is required for
any step in this guide.

## 1. Create a Firebase project (free "Spark" plan)

1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it (e.g. `citypulse-ai`), disable Google Analytics if you want a
   faster setup (optional either way -- it's free either way).
3. Once created, click **Add app -> Android**.
   - Android package name: `com.aistudio.citypulse.xjdmfp` (must match
     `applicationId` in `app/build.gradle.kts` exactly).
   - Download the generated **`google-services.json`**.
4. Place that file at `app/google-services.json` in this project
   (it's already git-ignored, so it will never be committed).

## 2. Enable Authentication providers

1. In the Firebase Console: **Build -> Authentication -> Get started**.
2. Enable **Email/Password**.
3. Enable **Google**:
   - Toggle it on, pick a support email, save.
   - Firebase auto-generates a **Web client ID** for you on this screen --
     copy it.

## 3. Enable Firestore (free "Native mode" database)

1. **Build -> Firestore Database -> Create database**.
2. Choose **Start in production mode** (we ship our own rules below).
3. Pick the region closest to you -- this doesn't affect cost on the free tier.

## 4. Deploy the security rules (free, no server needed)

```bash
npm install -g firebase-tools      # one-time
firebase login
firebase init firestore            # point it at this project, keep existing firestore.rules
firebase deploy --only firestore:rules,storage
```
This project already ships `firestore.rules` and `storage.rules` at the
repo root -- `firebase init` will ask whether to overwrite them, say **no**.

## 5. Configure local secrets

Create a file named `.env` in the project root (same folder as
`.env.example`) — it's git-ignored, so your keys never get committed:

```
GEMINI_API_KEY=your-gemini-key-here          # not used yet in Phase 1, safe to leave as-is
GOOGLE_WEB_CLIENT_ID=paste-the-web-client-id-from-step-2
```

## 6. Remove the debug signing override (first run only)

In `app/build.gradle.kts`, the `debug` build type currently forces a
committed debug keystore for convenience. That's fine for local runs.
For your own release build later, follow the existing instructions in
`README.md`.

## 7. Run it

Open the project in Android Studio, let Gradle sync, run on an emulator
or device. You should land on the **Login screen**. Tap **Sign Up**,
create an account, and you'll be dropped into the existing Dashboard/
Report/Map/Profile tabs with a real Firebase session behind them --
Profile now shows your real name/email pulled from Firestore, and
Log Out actually signs you out and returns you to Login.

---

## What's implemented in this phase

- Email/password Sign Up, Login, Forgot Password (Firebase Auth)
- Google Sign-In via Jetpack Credential Manager (not the deprecated
  `GoogleSignInClient`)
- A `users/{uid}` Firestore document created automatically on signup,
  read back into Profile
- Session persistence -- closing and reopening the app keeps you logged in
- Firestore + Storage security rules (`firestore.rules`, `storage.rules`)
  scoped to what exists today, with safe defaults for what's next

## What's intentionally NOT in this phase

Everything else from the original feature list (AQI, Weather, Maps
markers, Waste Reporting + Gemini AI analysis, FCM push, Leaderboard,
News, Traffic, Emergency contacts, Admin dashboard) is not built yet.
Those are separate phases -- say which one you want next and it'll be
built the same way: on top of what already exists, free-tier only, with
its own setup instructions appended to this file.

## Troubleshooting

- **Build fails with "File google-services.json is missing"** — you
  skipped step 1.4. The build is configured to only *warn*, not fail, but
  Firebase Auth/Firestore calls will crash at runtime without it.
- **Google Sign-In button does nothing** — you skipped step 5, or pasted
  the *Android* client ID instead of the *Web* client ID from step 2.
- **"PERMISSION_DENIED" reading/writing Firestore** — rules weren't
  deployed (step 4), or you're testing before being logged in.

---

# Phase 2: Live Dashboard (AQI + Weather)

## 1. Get a free OpenWeather API key

1. Sign up at https://home.openweathermap.org/users/sign_up (free, no card).
2. Go to **API keys** in your account and copy the default key.
3. **New keys take up to ~2 hours to activate** -- if you get 401 errors
   right after signing up, that's why; just wait and retry.
4. Free tier covers the three endpoints this app uses (Current Weather,
   Air Pollution, 3-hour Forecast) up to **1,000 calls/day** --
   https://openweathermap.org/price

## 2. Add the key to your `.env`

```
OPENWEATHER_API_KEY=paste-your-key-here
```

## 3. Re-deploy Firestore rules (they changed in this phase)

```bash
firebase deploy --only firestore:rules
```

## 4. Run it

On first launch after signing in, the app asks for location permission.
- **Grant it** -> Dashboard shows live AQI/weather for your real GPS location.
- **Deny it** -> Dashboard still works, using a default location (New Delhi)
  so you always see live data, never a blank screen.

Pull down doesn't refresh yet (Compose Material3 pull-to-refresh needs a
newer BOM than this project currently pins) -- use the refresh icon next
to the notification bell instead.

## What's implemented in this phase

- Real-time AQI (OpenWeather's 1-5 index), PM2.5, PM10, CO, NO2, SO2, O3
- Color-coded AQI card + plain-language health recommendation per level
- Current weather: temperature, feels-like, humidity, wind, pressure,
  condition, plus a short "next few hours" forecast strip
- On-device reverse geocoding for the location label (no extra paid API)
- Offline support: every successful fetch is cached to Firestore
  (`aqi/{uid}`, `weather/{uid}`); if a later fetch fails (no network, API
  down), the Dashboard shows the last cached reading with an "offline"
  label instead of an error screen
- Loading skeleton while the first fetch is in flight, error card with
  Retry if there's no cache to fall back to

## What's intentionally NOT in this phase

Notifications, Leaderboard, News, Traffic, Emergency contacts, Waste
Reporting + Gemini AI, Maps, and Admin dashboard are still separate,
not-yet-built phases.

---

# Phase 3: Waste Reporting + Gemini AI Photo Analysis

## 1. Get a free Gemini API key (if you haven't already)

1. Go to https://aistudio.google.com/app/apikey and sign in with any
   Google account.
2. Click **Create API key** -- no credit card, no billing account needed
   for the free tier.
3. Free tier covers `gemini-2.0-flash` (the model this app uses) at a
   generous daily quota -- see https://ai.google.dev/pricing for current
   limits.

## 2. Add the key to your `.env`

```
GEMINI_API_KEY=paste-your-key-here
```

(If you already filled this in during earlier setup, nothing to do here.)

## 3. Re-deploy Firestore + Storage rules (Storage rules are used for the first time in this phase)

```bash
firebase deploy --only firestore:rules,storage
```

## 4. Run it

Open the **Report** tab. Grant camera + location permission when asked.
- **Take Photo** launches your device's camera app.
- **Upload Photo** opens the system photo picker.
- Pick a **Category** and **Priority**, optionally add a description, and
  tap **Analyze & Submit Report**.
- You'll see the submission move through Uploading photo -> Analyzing
  with AI -> Saving, then a result card with the AI's waste type,
  severity, suggested action, responsible department, estimated cleanup
  cost, and confidence score.
- Your report appears instantly in **My Reports** below (Firestore
  realtime listener -- no manual refresh needed).

## What's implemented in this phase

- Take Photo (camera) or Upload Photo (gallery), with in-app preview
- Photos are downscaled/compressed client-side before upload (faster
  uploads, smaller AI payloads) and stored in Firebase Storage under
  `report_photos/{uid}/...`
- Category + Priority selection, optional description
- Real GPS location (reverse-geocoded to a place name) attached to every
  report
- Gemini (`gemini-2.0-flash`) analyzes the actual photo and returns
  structured JSON: waste type, severity, suggested action, responsible
  government department, estimated cleanup cost, confidence score --
  stored on the report in Firestore
- If AI analysis fails (bad network, missing key), the report still
  saves successfully -- AI output is an enhancement, never a blocker
- Realtime "My Reports" list via a Firestore snapshot listener
- +10 points and reportsCount incremented on the user's profile per
  submitted report (foundation for the future Leaderboard phase)

## What's intentionally NOT in this phase

Notifications, Leaderboard (UI), News, Traffic, Emergency contacts,
Maps, and Admin dashboard are still separate, not-yet-built phases. The
public/city-wide report feed (seeing *other* users' reports, not just
your own) is also part of the Maps/Admin phases, not this one.

