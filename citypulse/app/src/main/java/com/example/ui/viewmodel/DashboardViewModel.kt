package com.example.ui.viewmodel

import android.app.Application
import android.location.Geocoder
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.example.data.model.AppResult
import com.example.data.model.EnvironmentSnapshot
import com.example.data.repository.DEFAULT_LOCATION
import com.example.data.repository.EnvironmentRepository
import com.example.data.repository.GeoPoint
import com.example.data.repository.LocationHelper
import com.example.di.AppContainer
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Locale

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(val data: EnvironmentSnapshot) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

class DashboardViewModel(
    application: Application,
    private val environmentRepository: EnvironmentRepository = AppContainer.environmentRepository
) : AndroidViewModel(application) {

    private val locationHelper = LocationHelper(application)

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    /** True once we've asked the OS for location -- lets the UI distinguish
     * "still deciding" from "user denied permission, using default city". */
    var hasLocationPermission: Boolean = false
        private set

    fun onPermissionResult(granted: Boolean) {
        hasLocationPermission = granted
        loadData()
    }

    fun refresh() {
        _isRefreshing.value = true
        loadData(isManualRefresh = true)
    }

    private fun loadData(isManualRefresh: Boolean = false) {
        viewModelScope.launch {
            if (!isManualRefresh) _uiState.value = DashboardUiState.Loading

            val uid = FirebaseAuth.getInstance().currentUser?.uid
            if (uid == null) {
                _uiState.value = DashboardUiState.Error("You're not signed in.")
                _isRefreshing.value = false
                return@launch
            }

            val point: GeoPoint = if (hasLocationPermission) {
                runCatching { locationHelper.getCurrentLocation() }.getOrNull() ?: DEFAULT_LOCATION
            } else {
                DEFAULT_LOCATION
            }
            val label = reverseGeocode(point)

            when (val result = environmentRepository.fetchLive(uid, point.latitude, point.longitude, label)) {
                is AppResult.Success -> _uiState.value = DashboardUiState.Success(result.data)
                is AppResult.Error -> _uiState.value = DashboardUiState.Error(result.message)
            }
            _isRefreshing.value = false
        }
    }

    /** Free, on-device (or Play Services-backed) reverse geocoding -- no paid API involved. */
    private fun reverseGeocode(point: GeoPoint): String {
        return runCatching {
            @Suppress("DEPRECATION")
            val geocoder = Geocoder(getApplication(), Locale.getDefault())
            @Suppress("DEPRECATION")
            val addresses = geocoder.getFromLocation(point.latitude, point.longitude, 1)
            val address = addresses?.firstOrNull()
            address?.locality ?: address?.subAdminArea ?: address?.adminArea ?: "Current Location"
        }.getOrDefault("Current Location")
    }

    companion object {
        fun factory(application: Application) = viewModelFactory {
            initializer { DashboardViewModel(application) }
        }
    }
}
