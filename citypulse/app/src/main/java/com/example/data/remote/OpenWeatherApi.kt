package com.example.data.remote

import retrofit2.http.GET
import retrofit2.http.Query

/**
 * OpenWeather free tier ("One Call" is a paid add-on -- deliberately NOT
 * used here). These three endpoints are all free up to 1,000 calls/day:
 * https://openweathermap.org/price
 */
interface OpenWeatherApi {

    @GET("data/2.5/weather")
    suspend fun getCurrentWeather(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double,
        @Query("appid") apiKey: String,
        @Query("units") units: String = "metric"
    ): WeatherResponse

    @GET("data/2.5/air_pollution")
    suspend fun getAirPollution(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double,
        @Query("appid") apiKey: String
    ): AirPollutionResponse

    @GET("data/2.5/forecast")
    suspend fun getForecast(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double,
        @Query("appid") apiKey: String,
        @Query("units") units: String = "metric",
        @Query("cnt") count: Int = 4
    ): ForecastResponse

    companion object {
        const val BASE_URL = "https://api.openweathermap.org/"
    }
}
