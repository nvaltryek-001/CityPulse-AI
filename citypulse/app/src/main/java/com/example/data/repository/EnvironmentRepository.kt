package com.example.data.repository

import com.example.data.model.AppResult
import com.example.data.model.AqiCategory
import com.example.data.model.EnvironmentSnapshot
import com.example.data.model.ForecastPoint
import com.example.data.model.PollutantReadings
import com.example.data.model.WeatherSnapshot
import com.example.data.remote.OpenWeatherApi
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.tasks.await

/**
 * Fetches live AQI + Weather + short forecast from OpenWeather's free tier
 * and writes the latest reading to Firestore (collections "aqi" and
 * "weather", keyed by uid) so the last known values are available offline
 * -- satisfies the app's offline-support requirement without needing any
 * paid caching infrastructure.
 */
class EnvironmentRepository(
    private val api: OpenWeatherApi,
    private val firestore: FirebaseFirestore,
    private val apiKey: String
) {
    private val aqiCollection = firestore.collection("aqi")
    private val weatherCollection = firestore.collection("weather")

    suspend fun fetchLive(
        uid: String,
        lat: Double,
        lon: Double,
        locationLabel: String
    ): AppResult<EnvironmentSnapshot> {
        if (apiKey.isBlank() || apiKey == "MY_OPENWEATHER_API_KEY") {
            return AppResult.Error(
                "OpenWeather API key not configured. See SETUP.md (Phase 2) to add a free key."
            )
        }

        return try {
            coroutineScope {
                val weatherDeferred = async { api.getCurrentWeather(lat, lon, apiKey) }
                val airDeferred = async { api.getAirPollution(lat, lon, apiKey) }
                val forecastDeferred = async {
                    runCatching { api.getForecast(lat, lon, apiKey) }.getOrNull()
                }

                val weatherResponse = weatherDeferred.await()
                val airResponse = airDeferred.await()
                val forecastResponse = forecastDeferred.await()

                val airEntry = airResponse.list.firstOrNull()
                    ?: return@coroutineScope AppResult.Error("No air quality data available for this location.")

                val snapshot = EnvironmentSnapshot(
                    aqiIndex = airEntry.main.aqi,
                    aqiCategory = AqiCategory.fromIndex(airEntry.main.aqi),
                    pollutants = PollutantReadings(
                        pm25 = airEntry.components.pm25,
                        pm10 = airEntry.components.pm10,
                        co = airEntry.components.co,
                        no2 = airEntry.components.no2,
                        so2 = airEntry.components.so2,
                        o3 = airEntry.components.o3
                    ),
                    weather = WeatherSnapshot(
                        locationLabel = locationLabel.ifBlank { weatherResponse.name ?: "Current Location" },
                        temperatureC = weatherResponse.main.temp,
                        feelsLikeC = weatherResponse.main.feelsLike,
                        humidityPercent = weatherResponse.main.humidity,
                        windSpeedMs = weatherResponse.wind?.speed ?: 0.0,
                        pressureHpa = weatherResponse.main.pressure,
                        condition = weatherResponse.weather.firstOrNull()?.description ?: "--",
                        conditionIcon = weatherResponse.weather.firstOrNull()?.icon ?: "01d"
                    ),
                    forecast = forecastResponse?.list?.map {
                        ForecastPoint(
                            timestampMillis = it.dt * 1000,
                            temperatureC = it.main.temp,
                            condition = it.weather.firstOrNull()?.description ?: "--",
                            precipitationProbabilityPercent = ((it.precipitationProbability ?: 0.0) * 100).toInt()
                        )
                    } ?: emptyList(),
                    fetchedAtMillis = System.currentTimeMillis(),
                    isFromCache = false
                )

                cacheToFirestore(uid, snapshot)
                AppResult.Success(snapshot)
            }
        } catch (e: Exception) {
            // Network/API failure -- fall back to the last cached reading so the
            // Dashboard isn't just a blank error screen (offline support).
            val cached = getCached(uid)
            if (cached != null) {
                AppResult.Success(cached.copy(isFromCache = true))
            } else {
                AppResult.Error(e.message ?: "Couldn't fetch live environment data.", e)
            }
        }
    }

    private suspend fun cacheToFirestore(uid: String, snapshot: EnvironmentSnapshot) {
        runCatching {
            aqiCollection.document(uid).set(
                mapOf(
                    "aqiIndex" to snapshot.aqiIndex,
                    "category" to snapshot.aqiCategory.name,
                    "pm25" to snapshot.pollutants.pm25,
                    "pm10" to snapshot.pollutants.pm10,
                    "co" to snapshot.pollutants.co,
                    "no2" to snapshot.pollutants.no2,
                    "so2" to snapshot.pollutants.so2,
                    "o3" to snapshot.pollutants.o3,
                    "updatedAt" to snapshot.fetchedAtMillis
                )
            ).await()
            weatherCollection.document(uid).set(
                mapOf(
                    "locationLabel" to snapshot.weather.locationLabel,
                    "temperatureC" to snapshot.weather.temperatureC,
                    "feelsLikeC" to snapshot.weather.feelsLikeC,
                    "humidityPercent" to snapshot.weather.humidityPercent,
                    "windSpeedMs" to snapshot.weather.windSpeedMs,
                    "pressureHpa" to snapshot.weather.pressureHpa,
                    "condition" to snapshot.weather.condition,
                    "updatedAt" to snapshot.fetchedAtMillis
                )
            ).await()
        }
        // Caching is best-effort -- a failed write should never block showing live data.
    }

    private suspend fun getCached(uid: String): EnvironmentSnapshot? {
        return runCatching {
            val aqiDoc = aqiCollection.document(uid).get().await()
            val weatherDoc = weatherCollection.document(uid).get().await()
            if (!aqiDoc.exists() || !weatherDoc.exists()) return null

            val aqiIndex = (aqiDoc.getLong("aqiIndex") ?: return null).toInt()
            EnvironmentSnapshot(
                aqiIndex = aqiIndex,
                aqiCategory = AqiCategory.fromIndex(aqiIndex),
                pollutants = PollutantReadings(
                    pm25 = aqiDoc.getDouble("pm25") ?: 0.0,
                    pm10 = aqiDoc.getDouble("pm10") ?: 0.0,
                    co = aqiDoc.getDouble("co") ?: 0.0,
                    no2 = aqiDoc.getDouble("no2") ?: 0.0,
                    so2 = aqiDoc.getDouble("so2") ?: 0.0,
                    o3 = aqiDoc.getDouble("o3") ?: 0.0
                ),
                weather = WeatherSnapshot(
                    locationLabel = weatherDoc.getString("locationLabel") ?: "Last known location",
                    temperatureC = weatherDoc.getDouble("temperatureC") ?: 0.0,
                    feelsLikeC = weatherDoc.getDouble("feelsLikeC") ?: 0.0,
                    humidityPercent = (weatherDoc.getLong("humidityPercent") ?: 0).toInt(),
                    windSpeedMs = weatherDoc.getDouble("windSpeedMs") ?: 0.0,
                    pressureHpa = (weatherDoc.getLong("pressureHpa") ?: 0).toInt(),
                    condition = weatherDoc.getString("condition") ?: "--",
                    conditionIcon = "01d"
                ),
                forecast = emptyList(),
                fetchedAtMillis = aqiDoc.getLong("updatedAt") ?: 0L,
                isFromCache = true
            )
        }.getOrNull()
    }
}
