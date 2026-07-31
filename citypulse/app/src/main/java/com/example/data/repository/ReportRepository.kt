package com.example.data.repository

import android.util.Base64
import com.example.data.model.AppResult
import com.example.data.model.Report
import com.example.data.model.WasteAiAnalysis
import com.example.data.remote.GeminiApi
import com.example.data.remote.GeminiContent
import com.example.data.remote.GeminiGenerateContentRequest
import com.example.data.remote.GeminiInlineData
import com.example.data.remote.GeminiPart
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.storage.FirebaseStorage
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

@JsonClass(generateAdapter = true)
data class GeminiWasteAnalysisJson(
    val wasteType: String? = null,
    val severity: String? = null,
    val suggestedAction: String? = null,
    val department: String? = null,
    val estimatedCleanupCost: String? = null,
    val confidenceScore: Double? = null
)

class ReportRepository(
    private val storage: FirebaseStorage = FirebaseStorage.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val geminiApi: GeminiApi = com.example.data.remote.NetworkModule.geminiApi,
    private val geminiApiKey: String
) {
    private val reportsCollection = firestore.collection("reports")
    private val usersCollection = firestore.collection("users")
    private val jsonAdapter = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
        .adapter(GeminiWasteAnalysisJson::class.java)

    suspend fun uploadPhoto(uid: String, photoBytes: ByteArray): AppResult<String> {
        return try {
            val fileName = "report_${System.currentTimeMillis()}.jpg"
            val ref = storage.reference.child("report_photos/$uid/$fileName")
            ref.putBytes(photoBytes).await()
            val downloadUrl = ref.downloadUrl.await()
            AppResult.Success(downloadUrl.toString())
        } catch (e: Exception) {
            AppResult.Error(e.message ?: "Photo upload failed.", e)
        }
    }

    suspend fun analyzeWasteImage(
        photoBytes: ByteArray,
        description: String,
        category: String
    ): AppResult<WasteAiAnalysis> {
        if (geminiApiKey.isBlank() || geminiApiKey == "MY_GEMINI_API_KEY") {
            return AppResult.Error(
                "Gemini API key not configured. See SETUP.md (Phase 3) to add a free key."
            )
        }

        return try {
            val base64Image = Base64.encodeToString(photoBytes, Base64.NO_WRAP)
            val prompt = buildPrompt(description, category)

            val request = GeminiGenerateContentRequest(
                contents = listOf(
                    GeminiContent(
                        parts = listOf(
                            GeminiPart(text = prompt),
                            GeminiPart(inlineData = GeminiInlineData(mimeType = "image/jpeg", data = base64Image))
                        )
                    )
                )
            )

            val response = geminiApi.generateContent(apiKey = geminiApiKey, request = request)
            val rawJson = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                ?: return AppResult.Error("AI analysis returned no result. Please try again.")

            val parsed = jsonAdapter.fromJson(rawJson)
                ?: return AppResult.Error("Couldn't parse AI analysis. Please try again.")

            AppResult.Success(
                WasteAiAnalysis(
                    wasteType = parsed.wasteType ?: "Unknown",
                    severity = parsed.severity ?: "Unknown",
                    suggestedAction = parsed.suggestedAction ?: "Manual review required.",
                    department = parsed.department ?: "General Sanitation",
                    estimatedCleanupCost = parsed.estimatedCleanupCost ?: "Not estimated",
                    confidenceScore = (parsed.confidenceScore ?: 0.0).coerceIn(0.0, 1.0)
                )
            )
        } catch (e: Exception) {
            // AI analysis is a nice-to-have, not a blocker -- report submission
            // continues even if this fails (see ReportViewModel).
            AppResult.Error(e.message ?: "AI analysis failed.", e)
        }
    }

    suspend fun submitReport(report: Report): AppResult<String> {
        return try {
            val docRef = reportsCollection.document()
            val finalReport = report.copy(id = docRef.id)
            docRef.set(finalReport).await()

            // Best-effort gamification hook for the future Leaderboard phase.
            runCatching {
                usersCollection.document(report.userId).update(
                    mapOf(
                        "reportsCount" to com.google.firebase.firestore.FieldValue.increment(1),
                        "points" to com.google.firebase.firestore.FieldValue.increment(10)
                    )
                ).await()
            }

            AppResult.Success(docRef.id)
        } catch (e: Exception) {
            AppResult.Error(e.message ?: "Couldn't save the report.", e)
        }
    }

    /** Realtime listener -- the report list updates live as Firestore data changes. */
    fun observeMyReports(uid: String, limit: Long = 30): Flow<List<Report>> = callbackFlow {
        val listener = reportsCollection
            .whereEqualTo("userId", uid)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(limit)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                val reports = snapshot?.documents?.mapNotNull { it.toObject(Report::class.java) }
                    ?: emptyList()
                trySend(reports)
            }
        awaitClose { listener.remove() }
    }

    private fun buildPrompt(description: String, category: String): String = """
        You are a civic waste-management assistant analyzing a photo submitted through a
        smart-city app. The user-selected category is "$category" and their description
        (may be empty) is: "$description".

        Analyze the image and respond with ONLY a JSON object (no markdown, no extra text)
        with exactly these keys:
        - wasteType: short string, the specific type of waste/issue visible (e.g. "Mixed household waste", "Construction debris", "Stagnant water")
        - severity: one of "Low", "Medium", "High", "Critical"
        - suggestedAction: one short sentence recommending what the city should do
        - department: which municipal department should handle this (e.g. "Solid Waste Management", "Water & Sanitation", "Roads & Infrastructure")
        - estimatedCleanupCost: a short human-readable estimate, e.g. "₹500 - ₹1,500" (approximate is fine, always include a currency-labeled range)
        - confidenceScore: a number from 0 to 1 representing your confidence in this analysis
    """.trimIndent()
}
