package com.example.data.model

/**
 * Generic wrapper so repositories never throw across the ViewModel
 * boundary -- every suspend call returns one of these instead.
 */
sealed class AppResult<out T> {
    data class Success<T>(val data: T) : AppResult<T>()
    data class Error(val message: String, val throwable: Throwable? = null) : AppResult<Nothing>()
}
