package com.example.di

import com.example.data.repository.AuthRepository
import com.example.data.repository.EnvironmentRepository
import com.example.data.repository.ReportRepository
import com.example.data.remote.NetworkModule
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

/**
 * Minimal manual dependency container. We deliberately avoid pulling in
 * Hilt/Dagger here -- it adds an annotation-processing step that is easy
 * to misconfigure and is not required for an app this size. Every
 * repository is a cheap singleton constructed once and reused, which is
 * the same end result Hilt would give us for this scope.
 */
object AppContainer {
    val firebaseAuth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }
    val firestore: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }

    val authRepository: AuthRepository by lazy {
        AuthRepository(firebaseAuth, firestore)
    }

    val environmentRepository: EnvironmentRepository by lazy {
        EnvironmentRepository(
            api = NetworkModule.openWeatherApi,
            firestore = firestore,
            apiKey = com.example.BuildConfig.OPENWEATHER_API_KEY
        )
    }

    val reportRepository: ReportRepository by lazy {
        ReportRepository(
            firestore = firestore,
            geminiApiKey = com.example.BuildConfig.GEMINI_API_KEY
        )
    }
}
