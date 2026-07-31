package com.example.ui.viewmodel

import android.app.Application
import android.location.Geocoder
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.example.data.model.AppResult
import com.example.data.model.Report
import com.example.data.model.WasteAiAnalysis
import com.example.data.repository.DEFAULT_LOCATION
import com.example.data.repository.LocationHelper
import com.example.data.repository.ReportRepository
import com.example.di.AppContainer
import com.example.util.ImageUtils
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Locale

sealed class ReportSubmissionState {
    object Idle : ReportSubmissionState()
    object UploadingPhoto : ReportSubmissionState()
    object AnalyzingWithAi : ReportSubmissionState()
    object Saving : ReportSubmissionState()
    data class Success(val aiAnalysis: WasteAiAnalysis?) : ReportSubmissionState()
    data class Error(val message: String) : ReportSubmissionState()
}

class ReportViewModel(
    application: Application,
    private val reportRepository: ReportRepository = AppContainer.reportRepository
) : AndroidViewModel(application) {

    private val locationHelper = LocationHelper(application)

    private val _submissionState = MutableStateFlow<ReportSubmissionState>(ReportSubmissionState.Idle)
    val submissionState: StateFlow<ReportSubmissionState> = _submissionState.asStateFlow()

    val myReports: StateFlow<List<Report>> =
        FirebaseAuth.getInstance().currentUser?.uid?.let { uid ->
            reportRepository.observeMyReports(uid)
        }?.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
            ?: MutableStateFlow(emptyList())

    fun resetState() {
        _submissionState.value = ReportSubmissionState.Idle
    }

    fun submitReport(
        photoUri: Uri,
        description: String,
        category: String,
        priority: String,
        hasLocationPermission: Boolean
    ) {
        val uid = FirebaseAuth.getInstance().currentUser?.uid
        val userName = FirebaseAuth.getInstance().currentUser?.displayName ?: "CityPulse User"
        if (uid == null) {
            _submissionState.value = ReportSubmissionState.Error("You're not signed in.")
            return
        }
        if (category.isBlank()) {
            _submissionState.value = ReportSubmissionState.Error("Please select a category.")
            return
        }

        viewModelScope.launch {
            _submissionState.value = ReportSubmissionState.UploadingPhoto

            val photoBytes = ImageUtils.uriToCompressedJpeg(getApplication(), photoUri)
            if (photoBytes == null) {
                _submissionState.value = ReportSubmissionState.Error("Couldn't read the selected photo. Please try again.")
                return@launch
            }

            val uploadResult = reportRepository.uploadPhoto(uid, photoBytes)
            val photoUrl = when (uploadResult) {
                is AppResult.Success -> uploadResult.data
                is AppResult.Error -> {
                    _submissionState.value = ReportSubmissionState.Error(uploadResult.message)
                    return@launch
                }
            }

            _submissionState.value = ReportSubmissionState.AnalyzingWithAi
            // AI analysis failure should not block report submission -- the
            // report is still valuable to the city without it.
            val aiAnalysis = when (val result = reportRepository.analyzeWasteImage(photoBytes, description, category)) {
                is AppResult.Success -> result.data
                is AppResult.Error -> null
            }

            val point = if (hasLocationPermission) {
                runCatching { locationHelper.getCurrentLocation() }.getOrNull() ?: DEFAULT_LOCATION
            } else {
                DEFAULT_LOCATION
            }
            val locationLabel = reverseGeocode(point)

            _submissionState.value = ReportSubmissionState.Saving
            val report = Report(
                userId = uid,
                userName = userName,
                description = description,
                category = category,
                priority = priority,
                photoUrl = photoUrl,
                latitude = point.latitude,
                longitude = point.longitude,
                locationLabel = locationLabel,
                status = "Submitted",
                aiAnalysis = aiAnalysis,
                createdAt = System.currentTimeMillis()
            )

            when (val result = reportRepository.submitReport(report)) {
                is AppResult.Success -> _submissionState.value = ReportSubmissionState.Success(aiAnalysis)
                is AppResult.Error -> _submissionState.value = ReportSubmissionState.Error(result.message)
            }
        }
    }

    /** Free, on-device (or Play Services-backed) reverse geocoding -- no paid API involved. */
    private fun reverseGeocode(point: com.example.data.repository.GeoPoint): String {
        return runCatching {
            @Suppress("DEPRECATION")
            val geocoder = Geocoder(getApplication(), Locale.getDefault())
            @Suppress("DEPRECATION")
            val addresses = geocoder.getFromLocation(point.latitude, point.longitude, 1)
            val address = addresses?.firstOrNull()
            address?.let { addr ->
                listOfNotNull(addr.thoroughfare, addr.locality ?: addr.subAdminArea)
                    .joinToString(", ")
                    .ifBlank { addr.adminArea ?: "Current Location" }
            } ?: "Current Location"
        }.getOrDefault("Current Location")
    }

    companion object {
        fun factory(application: Application) = viewModelFactory {
            initializer { ReportViewModel(application) }
        }
    }
}
