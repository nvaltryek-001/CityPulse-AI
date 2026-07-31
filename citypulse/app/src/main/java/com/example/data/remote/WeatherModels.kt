package com.example.data.remote

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

// ---- https://api.openweathermap.org/data/2.5/weather ----

@JsonClass(generateAdapter = true)
data class WeatherResponse(
    val name: String?,
    val main: WeatherMain,
    val weather: List<WeatherCondition>,
    val wind: WeatherWind?,
    val visibility: Int?
)

@JsonClass(generateAdapter = true)
data class WeatherMain(
    val temp: Double,
    @Json(name = "feels_like") val feelsLike: Double,
    @Json(name = "temp_min") val tempMin: Double,
    @Json(name = "temp_max") val tempMax: Double,
    val pressure: Int,
    val humidity: Int
)

@JsonClass(generateAdapter = true)
data class WeatherCondition(
    val main: String,
    val description: String,
    val icon: String
)

@JsonClass(generateAdapter = true)
data class WeatherWind(
    val speed: Double,
    val deg: Int?
)

// ---- https://api.openweathermap.org/data/2.5/air_pollution ----

@JsonClass(generateAdapter = true)
data class AirPollutionResponse(
    val list: List<AirPollutionEntry>
)

@JsonClass(generateAdapter = true)
data class AirPollutionEntry(
    val main: AirPollutionIndex,
    val components: AirPollutionComponents
)

@JsonClass(generateAdapter = true)
data class AirPollutionIndex(
    /** OpenWeather's own 1 (Good) - 5 (Very Poor) scale. Not the US EPA 0-500 scale. */
    val aqi: Int
)

@JsonClass(generateAdapter = true)
data class AirPollutionComponents(
    val co: Double,
    val no: Double,
    val no2: Double,
    val o3: Double,
    val so2: Double,
    @Json(name = "pm2_5") val pm25: Double,
    val pm10: Double,
    val nh3: Double
)

// ---- https://api.openweathermap.org/data/2.5/forecast (used for a short "next hours" peek) ----

@JsonClass(generateAdapter = true)
data class ForecastResponse(
    val list: List<ForecastEntry>
)

@JsonClass(generateAdapter = true)
data class ForecastEntry(
    val dt: Long,
    val main: WeatherMain,
    val weather: List<WeatherCondition>,
    @Json(name = "pop") val precipitationProbability: Double?
)
