package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.model.AppResult
import com.example.data.model.User
import com.example.data.repository.AuthRepository
import com.example.di.AppContainer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** One-shot UI state for whichever auth form is currently on screen. */
sealed class AuthUiState {
    object Idle : AuthUiState()
    object Loading : AuthUiState()
    object Success : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AuthViewModel(
    private val repository: AuthRepository = AppContainer.authRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val _currentUserProfile = MutableStateFlow<User?>(null)
    val currentUserProfile: StateFlow<User?> = _currentUserProfile.asStateFlow()

    val isLoggedIn: Boolean get() = repository.isLoggedIn

    init {
        // Keep the cached profile in sync with Firebase's auth state
        // (covers cold start, logout from another screen, token expiry).
        viewModelScope.launch {
            repository.authStateFlow().collect { firebaseUser ->
                if (firebaseUser == null) {
                    _currentUserProfile.value = null
                } else {
                    loadProfile(firebaseUser.uid)
                }
            }
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }

    fun signUp(name: String, email: String, password: String, confirmPassword: String) {
        if (name.isBlank()) {
            _uiState.value = AuthUiState.Error("Please enter your name.")
            return
        }
        if (!isValidEmail(email)) {
            _uiState.value = AuthUiState.Error("Please enter a valid email address.")
            return
        }
        if (password.length < 6) {
            _uiState.value = AuthUiState.Error("Password must be at least 6 characters.")
            return
        }
        if (password != confirmPassword) {
            _uiState.value = AuthUiState.Error("Passwords do not match.")
            return
        }

        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            when (val result = repository.signUp(name, email, password)) {
                is AppResult.Success -> {
                    _currentUserProfile.value = result.data
                    _uiState.value = AuthUiState.Success
                }
                is AppResult.Error -> _uiState.value = AuthUiState.Error(result.message)
            }
        }
    }

    fun login(email: String, password: String) {
        if (!isValidEmail(email)) {
            _uiState.value = AuthUiState.Error("Please enter a valid email address.")
            return
        }
        if (password.isBlank()) {
            _uiState.value = AuthUiState.Error("Please enter your password.")
            return
        }

        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            when (val result = repository.login(email, password)) {
                is AppResult.Success -> _uiState.value = AuthUiState.Success
                is AppResult.Error -> _uiState.value = AuthUiState.Error(result.message)
            }
        }
    }

    fun signInWithGoogleIdToken(idToken: String) {
        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            when (val result = repository.signInWithGoogleIdToken(idToken)) {
                is AppResult.Success -> {
                    _currentUserProfile.value = result.data
                    _uiState.value = AuthUiState.Success
                }
                is AppResult.Error -> _uiState.value = AuthUiState.Error(result.message)
            }
        }
    }

    fun sendPasswordReset(email: String) {
        if (!isValidEmail(email)) {
            _uiState.value = AuthUiState.Error("Please enter a valid email address.")
            return
        }
        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            when (val result = repository.sendPasswordResetEmail(email)) {
                is AppResult.Success -> _uiState.value = AuthUiState.Success
                is AppResult.Error -> _uiState.value = AuthUiState.Error(result.message)
            }
        }
    }

    fun logout() {
        repository.logout()
        _currentUserProfile.value = null
        _uiState.value = AuthUiState.Idle
    }

    private fun loadProfile(uid: String) {
        viewModelScope.launch {
            when (val result = repository.getUserProfile(uid)) {
                is AppResult.Success -> _currentUserProfile.value = result.data
                is AppResult.Error -> Unit // profile doc may not exist yet right after signup; ignore
            }
        }
    }

    private fun isValidEmail(email: String): Boolean =
        email.isNotBlank() && android.util.Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches()

    companion object {
        val Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return AuthViewModel() as T
            }
        }
    }
}
