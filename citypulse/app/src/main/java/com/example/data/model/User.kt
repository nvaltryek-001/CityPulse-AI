package com.example.data.model

/**
 * Firestore document model stored under collection "users/{uid}".
 * Kept as a plain data class with default values so Firestore's
 * reflective deserializer (toObject<User>()) can construct it.
 */
data class User(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val photoUrl: String = "",
    val phone: String = "",
    val points: Int = 0,
    val reportsCount: Int = 0,
    val badges: List<String> = emptyList(),
    val fcmToken: String = "",
    val isAdmin: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
