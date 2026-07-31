package com.example.data.repository

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential

/**
 * Wraps the Jetpack Credential Manager "Sign in with Google" flow.
 *
 * Requires a Web Client ID (NOT the Android OAuth client) from
 * Firebase Console -> Authentication -> Sign-in method -> Google ->
 * Web SDK configuration. Paste it into local.properties as
 * GOOGLE_WEB_CLIENT_ID and it is exposed via BuildConfig (see
 * app/build.gradle.kts buildConfigField wiring).
 */
class GoogleAuthHelper(private val context: Context) {

    private val credentialManager = CredentialManager.create(context)

    /** Returns the Google ID token to hand off to [AuthRepository.signInWithGoogleIdToken]. */
    suspend fun requestGoogleIdToken(webClientId: String): Result<String> {
        return try {
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(webClientId)
                .setAutoSelectEnabled(false)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val response = credentialManager.getCredential(context, request)
            val googleIdTokenCredential = GoogleIdTokenCredential
                .createFrom(response.credential.data)

            Result.success(googleIdTokenCredential.idToken)
        } catch (e: GetCredentialException) {
            Result.failure(Exception("Google sign-in was cancelled or unavailable."))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
