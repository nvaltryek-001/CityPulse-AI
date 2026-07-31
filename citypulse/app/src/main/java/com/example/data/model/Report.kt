package com.example.data.model

data class WasteAiAnalysis(
    val wasteType: String = "",
    val severity: String = "",
    val suggestedAction: String = "",
    val department: String = "",
    val estimatedCleanupCost: String = "",
    val confidenceScore: Double = 0.0
)

data class Report(
    val id: String = "",
    val userId: String = "",
    val userName: String = "",
    val description: String = "",
    val category: String = "",
    val priority: String = "",
    val photoUrl: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val locationLabel: String = "",
    val status: String = "Submitted",
    val aiAnalysis: WasteAiAnalysis? = null,
    val createdAt: Long = System.currentTimeMillis()
)

val WASTE_CATEGORIES = listOf(
    "Overflowing Bin",
    "Illegal Dumping",
    "Street Litter",
    "Broken Infrastructure",
    "Stagnant Water / Drainage",
    "Other"
)

val REPORT_PRIORITIES = listOf("Low", "Medium", "High", "Urgent")
