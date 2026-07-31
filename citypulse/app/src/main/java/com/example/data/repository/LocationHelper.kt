package com.example.data.repository

import android.annotation.SuppressLint
import android.content.Context
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.tasks.await

data class GeoPoint(val latitude: Double, val longitude: Double)

/**
 * Thin wrapper around Play Services FusedLocationProviderClient.
 * Callers must have already checked/requested ACCESS_FINE_LOCATION
 * (or ACCESS_COARSE_LOCATION) before calling [getCurrentLocation] --
 * this class does not touch the permission system itself.
 */
class LocationHelper(context: Context) {

    private val client = LocationServices.getFusedLocationProviderClient(context)

    @SuppressLint("MissingPermission")
    suspend fun getCurrentLocation(): GeoPoint? {
        val request = CurrentLocationRequest.Builder()
            .setPriority(Priority.PRIORITY_BALANCED_POWER_ACCURACY)
            .build()
        val location = client.getCurrentLocation(request, null).await() ?: return null
        return GeoPoint(location.latitude, location.longitude)
    }
}

/** Fallback used when location permission is denied or unavailable, so the
 * Dashboard still shows *something* live instead of an empty error state. */
val DEFAULT_LOCATION = GeoPoint(latitude = 28.6139, longitude = 77.2090) // New Delhi
