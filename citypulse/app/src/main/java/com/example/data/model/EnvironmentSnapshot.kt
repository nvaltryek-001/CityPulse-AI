package com.example.data.model

/** OpenWeather's own Air Quality Index scale: 1 (Good) .. 5 (Very Poor). */
enum class AqiCategory(val label: String, val colorHex: Long, val healthAdvice: String) {
    GOOD(
        "Good", 0xFF16A34A,
        "Air quality is satisfactory. Enjoy outdoor activities as usual."
    ),
    FAIR(
        "Fair", 0xFF84CC16,
        "Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion."
    ),
    MODERATE(
        "Moderate", 0xFFF59E0B,
        "Members of sensitive groups (children, elderly, respiratory conditions) may experience mild effects. Consider reducing prolonged outdoor exertion."
    ),
    POOR(
        "Poor", 0xFFF97316,
        "Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor exertion."
    ),
    VERY_POOR(
        "Very Poor", 0xFFDC2626,
        "Health warning: everyone should avoid outdoor exertion. Consider wearing a mask outdoors and keeping windows closed."
    );

    companion object {
        fun fromIndex(index: Int): AqiCategory = when (index) {
            1 -> GOOD
            2 -> FAIR
            3 -> MODERATE
            4 -> POOR
            else -> VERY_POOR
        }
    }
}

data class PollutantReadings(
    val pm25: Double,
    val pm10: Double,
    val co: Double,
    val no2: Double,
    val so2: Double,
    val o3: Double
)

data class WeatherSnapshot(
    val locationLabel: String,
    val temperatureC: Double,
    val feelsLikeC: Double,
    val humidityPercent: Int,
    val windSpeedMs: Double,
    val pressureHpa: Int,
    val condition: String,
    val conditionIcon: String
)

data class ForecastPoint(
    val timestampMillis: Long,
    val temperatureC: Double,
    val condition: String,
    val precipitationProbabilityPercent: Int
)

data class EnvironmentSnapshot(
    val aqiIndex: Int,
    val aqiCategory: AqiCategory,
    val pollutants: PollutantReadings,
    val weather: WeatherSnapshot,
    val forecast: List<ForecastPoint>,
    val fetchedAtMillis: Long,
    val isFromCache: Boolean = false
)
