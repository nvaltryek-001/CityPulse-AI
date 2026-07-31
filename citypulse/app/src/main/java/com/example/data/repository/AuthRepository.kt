package com.example.data.repository

import com.example.data.model.AppResult
import com.example.data.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

/**
 * Single source of truth for authentication + the "users" Firestore
 * collection. All Firebase SDK calls are wrapped in try/catch and
 * returned as [AppResult] so the ViewModel layer never has to deal
 * with raw exceptions.
 */
class AuthRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private val usersCollection = firestore.collection("users")

    val currentUser: FirebaseUser?
        get() = auth.currentUser

    val isLoggedIn: Boolean
        get() = auth.currentUser != null

    /** Emits every time Firebase's auth state changes (login/logout/token refresh). */
    fun authStateFlow(): Flow<FirebaseUser?> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
            trySend(firebaseAuth.currentUser)
        }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    suspend fun signUp(name: String, email: String, password: String): AppResult<User> {
        return try {
            val authResult = auth.createUserWithEmailAndPassword(email.trim(), password).await()
            val firebaseUser = authResult.user
                ?: return AppResult.Error("Sign up failed. Please try again.")

            val newUser = User(
                uid = firebaseUser.uid,
                name = name.trim(),
                email = email.trim(),
                createdAt = System.currentTimeMillis()
            )
            usersCollection.document(firebaseUser.uid).set(newUser).await()
            AppResult.Success(newUser)
        } catch (e: Exception) {
            AppResult.Error(e.toFriendlyMessage(), e)
        }
    }

    suspend fun login(email: String, password: String): AppResult<Unit> {
        return try {
            auth.signInWithEmailAndPassword(email.trim(), password).await()
            AppResult.Success(Unit)
        } catch (e: Exception) {
            AppResult.Error(e.toFriendlyMessage(), e)
        }
    }

    /** Called after a successful Credential Manager Google Sign-In to exchange the ID token. */
    suspend fun signInWithGoogleIdToken(idToken: String): AppResult<User> {
        return try {
            val credential = GoogleAuthProvider.getCredential(idToken, null)
            val authResult = auth.signInWithCredential(credential).await()
            val firebaseUser = authResult.user
                ?: return AppResult.Error("Google sign-in failed. Please try again.")

            val existingDoc = usersCollection.document(firebaseUser.uid).get().await()
            val profile = if (existingDoc.exists()) {
                existingDoc.toObject(User::class.java) ?: User(uid = firebaseUser.uid)
            } else {
                val newUser = User(
                    uid = firebaseUser.uid,
                    name = firebaseUser.displayName ?: "CityPulse User",
                    email = firebaseUser.email ?: "",
                    photoUrl = firebaseUser.photoUrl?.toString() ?: "",
                    createdAt = System.currentTimeMillis()
                )
                usersCollection.document(firebaseUser.uid).set(newUser).await()
                newUser
            }
            AppResult.Success(profile)
        } catch (e: Exception) {
            AppResult.Error(e.toFriendlyMessage(), e)
        }
    }

    suspend fun sendPasswordResetEmail(email: String): AppResult<Unit> {
        return try {
            auth.sendPasswordResetEmail(email.trim()).await()
            AppResult.Success(Unit)
        } catch (e: Exception) {
            AppResult.Error(e.toFriendlyMessage(), e)
        }
    }

    suspend fun getUserProfile(uid: String): AppResult<User> {
        return try {
            val snapshot = usersCollection.document(uid).get().await()
            val user = snapshot.toObject(User::class.java)
                ?: return AppResult.Error("Profile not found.")
            AppResult.Success(user)
        } catch (e: Exception) {
            AppResult.Error(e.toFriendlyMessage(), e)
        }
    }

    suspend fun updateUserProfile(uid: String, updates: Map<String, Any?>): AppResult<Unit> {
        return try {
            usersCollection.document(uid).update(updates).await()
            AppResult.Success(Unit)
        } catch (e: Exception) {
            AppResult.Error(e.toFriendlyMessage(), e)
        }
    }

    fun logout() {
        auth.signOut()
    }

    /** Translates common Firebase exceptions into messages safe to show in the UI. */
    private fun Exception.toFriendlyMessage(): String {
        val raw = this.message ?: return "Something went wrong. Please try again."
        return when {
            raw.contains("email address is badly formatted", ignoreCase = true) ->
                "Please enter a valid email address."
            raw.contains("password is invalid", ignoreCase = true) ||
                raw.contains("no user record", ignoreCase = true) ->
                "Incorrect email or password."
            raw.contains("email address is already in use", ignoreCase = true) ->
                "An account already exists with this email."
            raw.contains("network error", ignoreCase = true) ->
                "Network error. Check your connection and try again."
            raw.contains("weak password", ignoreCase = true) ->
                "Password should be at least 6 characters."
            else -> raw
        }
    }
}
