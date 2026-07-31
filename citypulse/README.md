<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# CityPulse AI

A smart-city Android app: report civic issues (waste, potholes, etc.),
track live air quality and weather, and (in later phases) get AI-assisted
triage on reported issues -- built entirely on free-tier services.



## Stack

- Jetpack Compose, Material 3, single-Activity + Navigation-Compose
- MVVM: `ui/viewmodel` (StateFlow) -> `data/repository` -> Firebase SDKs
- Firebase Auth, Firestore, Storage, Cloud Messaging (Spark/free plan)
- Manual dependency container (`di/AppContainer.kt`) -- no Hilt required
- Retrofit/Moshi/OkHttp already wired in for the upcoming AQI/Weather/News
  API integrations

## Run Locally

**Prerequisites:** [Android Studio](https://developer.android.com/studio),
a free [Firebase](https://console.firebase.google.com) account.

1. Follow **[SETUP.md](SETUP.md)** end-to-end first -- it creates your free
   Firebase project, downloads `google-services.json`, and configures your
   local `.env`. The app will not run correctly without this.
2. Open the project in Android Studio, let it sync.
3. Run on an emulator or physical device.

## Project Structure

```
app/src/main/java/com/example/
├── data/
│   ├── model/            # User, Report, EnvironmentSnapshot, AppResult, ...
│   ├── remote/            # OpenWeatherApi, GeminiApi, NetworkModule (Retrofit/Moshi)
│   └── repository/       # AuthRepository, EnvironmentRepository, ReportRepository, ...
├── di/                    # AppContainer (manual DI)
├── util/                  # ImageUtils (photo downscale/compress)
├── ui/
│   ├── components/        # Shared composables (GlassTextField, ...)
│   ├── screens/
│   │   ├── auth/          # Login, Signup, ForgotPassword
│   │   ├── DashboardScreen.kt / MapScreen.kt / ReportScreen.kt / ProfileScreen.kt
│   ├── theme/              # Color / Type / Theme
│   ├── viewmodel/          # AuthViewModel, DashboardViewModel, ReportViewModel
│   └── CityPulseApp.kt     # Nav graph: splash -> auth graph | main graph
└── MainActivity.kt
```

## Security

- `firestore.rules` / `storage.rules` at the repo root -- deployed via the
  free Firebase CLI, see SETUP.md step 4.
- No API keys are committed. `.env` and `app/google-services.json` are
  both git-ignored; `.env.example` documents every key the app needs and
  where to get it for free.
