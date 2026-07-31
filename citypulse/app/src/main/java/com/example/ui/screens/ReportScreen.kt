package com.example.ui.screens

import android.Manifest
import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Photo
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.data.model.REPORT_PRIORITIES
import com.example.data.model.Report
import com.example.data.model.WASTE_CATEGORIES
import com.example.ui.theme.*
import com.example.ui.viewmodel.ReportSubmissionState
import com.example.ui.viewmodel.ReportViewModel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberMultiplePermissionsState
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(
    ExperimentalPermissionsApi::class,
    ExperimentalMaterial3Api::class
)
@Composable
fun ReportScreen() {
    val context = LocalContext.current
    val application = context.applicationContext as android.app.Application
    val reportViewModel: ReportViewModel = viewModel(factory = ReportViewModel.factory(application))

    val submissionState by reportViewModel.submissionState.collectAsState()
    val myReports by reportViewModel.myReports.collectAsState()

    var photoUri by remember { mutableStateOf<Uri?>(null) }
    var description by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf("Medium") }
    var categoryMenuExpanded by remember { mutableStateOf(false) }
 var pendingCameraUri by remember { mutableStateOf<Uri?>(null) }

val permissionsState = rememberMultiplePermissionsState(
    permissions = listOf(
        Manifest.permission.CAMERA,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION
    )
)

val locationLabel = if (permissionsState.allPermissionsGranted) {
    "Live GPS location will be attached"
} else {
    "Location permission not granted -- using default location"
}

    LaunchedEffect(Unit) {
        if (!permissionsState.allPermissionsGranted) {
            permissionsState.launchMultiplePermissionRequest()
        }
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) photoUri = pendingCameraUri
    }
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri -> if (uri != null) photoUri = uri }

    LaunchedEffect(submissionState) {
        if (submissionState is ReportSubmissionState.Success) {
            photoUri = null
            description = ""
            category = ""
            priority = "Medium"
        }
    }

    Scaffold(
        containerColor = BackgroundDark,
        topBar = {
            Column(modifier = Modifier.padding(16.dp)) {
                Spacer(modifier = Modifier.height(24.dp))
                Text("Smart Waste Report", color = TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                Text("Help keep the city clean -- AI-assisted triage", color = TextSecondary, fontSize = 14.sp)
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                PhotoPickerArea(
                    photoUri = photoUri,
                    onTakePhoto = {
                        val uri = createCameraOutputUri(context)
                        pendingCameraUri = uri
                        cameraLauncher.launch(uri)
                    },
                    onPickFromGallery = {
                        galleryLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                    }
                )
            }

            item {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceDark, RoundedCornerShape(12.dp))
                        .padding(16.dp)
                ) {
                    Icon(Icons.Filled.LocationOn, contentDescription = "Location", tint = AccentOrange)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Location (auto-detected)", color = TextSecondary, fontSize = 12.sp)
                        Text(locationLabel, color = TextPrimary, fontSize = 14.sp)
                    }
                }
            }

            item {
                ExposedDropdownMenuBox(
                    expanded = categoryMenuExpanded,
                    onExpandedChange = { categoryMenuExpanded = it }
                ) {
                    OutlinedTextField(
                        value = category,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Category") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryMenuExpanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedContainerColor = SurfaceDark,
                            unfocusedContainerColor = SurfaceDark,
                            focusedBorderColor = AccentTeal,
                            unfocusedBorderColor = GlassBorder
                        )
                    )
                    ExposedDropdownMenu(
                        expanded = categoryMenuExpanded,
                        onDismissRequest = { categoryMenuExpanded = false }
                    ) {
                        WASTE_CATEGORIES.forEach { option ->
                            DropdownMenuItem(
                                text = { Text(option) },
                                onClick = {
                                    category = option
                                    categoryMenuExpanded = false
                                }
                            )
                        }
                    }
                }
            }

            item {
                Column {
                    Text("Priority", color = TextSecondary, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        REPORT_PRIORITIES.forEach { level ->
                            FilterChip(
                                selected = priority == level,
                                onClick = { priority = level },
                                label = { Text(level) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = AccentTeal,
                                    selectedLabelColor = Color.White,
                                    containerColor = SurfaceDark,
                                    labelColor = TextSecondary
                                )
                            )
                        }
                    }
                }
            }

            item {
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp),
                    placeholder = { Text("Describe the issue (optional, AI will assist)", color = TextSecondary) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = AccentTeal,
                        unfocusedBorderColor = GlassBorder,
                        focusedContainerColor = SurfaceDark,
                        unfocusedContainerColor = SurfaceDark,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    shape = RoundedCornerShape(12.dp)
                )
            }

            item {
                if (submissionState is ReportSubmissionState.Error) {
                    Text(
                        (submissionState as ReportSubmissionState.Error).message,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 13.sp
                    )
                }
            }

            item {
                val isSubmitting = submissionState is ReportSubmissionState.UploadingPhoto ||
                    submissionState is ReportSubmissionState.AnalyzingWithAi ||
                    submissionState is ReportSubmissionState.Saving

                Button(
                    onClick = {
                        photoUri?.let {
                            reportViewModel.submitReport(
                                photoUri = it,
                                description = description,
                                category = category,
                                priority = priority,
                                hasLocationPermission = permissionsState.allPermissionsGranted
                            )
                        }
                    },
                    enabled = photoUri != null && category.isNotBlank() && !isSubmitting,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                ) {
                    when (submissionState) {
                        is ReportSubmissionState.UploadingPhoto -> SubmitProgressLabel("Uploading photo...")
                        is ReportSubmissionState.AnalyzingWithAi -> SubmitProgressLabel("Analyzing with AI...")
                        is ReportSubmissionState.Saving -> SubmitProgressLabel("Saving report...")
                        else -> Text("Analyze & Submit Report", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            item {
                val successState = submissionState as? ReportSubmissionState.Success
                if (successState != null) {
                    AiAnalysisResultCard(successState.aiAnalysis)
                }
            }

            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text("My Reports", color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
            }

            if (myReports.isEmpty()) {
                item {
                    Text("No reports yet -- submit one above.", color = TextSecondary, fontSize = 13.sp)
                }
            } else {
                items(myReports) { report ->
                    MyReportItem(report)
                }
            }

            item { Spacer(modifier = Modifier.height(64.dp)) }
        }
    }
}

@Composable
private fun SubmitProgressLabel(text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp, color = Color.White)
        Spacer(modifier = Modifier.width(10.dp))
        Text(text, fontSize = 15.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun PhotoPickerArea(photoUri: Uri?, onTakePhoto: () -> Unit, onPickFromGallery: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
            .background(SurfaceDark, RoundedCornerShape(16.dp))
            .border(1.dp, GlassBorder, RoundedCornerShape(16.dp)),
        contentAlignment = Alignment.Center
    ) {
        if (photoUri != null) {
            AsyncImage(
                model = photoUri,
                contentDescription = "Selected photo",
                modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(16.dp))
            )
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SmallActionChip("Retake", onTakePhoto)
                SmallActionChip("Choose Different", onPickFromGallery)
            }
        } else {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Filled.CameraAlt, contentDescription = "Camera", tint = AccentTeal, modifier = Modifier.size(40.dp))
                Spacer(modifier = Modifier.height(8.dp))
                Text("Add a photo of the issue", color = TextSecondary)
                Spacer(modifier = Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    SmallActionChip("Take Photo", onTakePhoto, icon = Icons.Filled.CameraAlt)
                    SmallActionChip("Upload Photo", onPickFromGallery, icon = Icons.Filled.Photo)
                }
            }
        }
    }
}

@Composable
private fun SmallActionChip(label: String, onClick: () -> Unit, icon: androidx.compose.ui.graphics.vector.ImageVector? = null) {
    AssistChip(
        onClick = onClick,
        label = { Text(label, fontSize = 12.sp) },
        leadingIcon = icon?.let { { Icon(it, contentDescription = null, modifier = Modifier.size(16.dp)) } },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = SurfaceLight,
            labelColor = TextPrimary,
            leadingIconContentColor = AccentTeal
        )
    )
}

@Composable
private fun AiAnalysisResultCard(analysis: com.example.data.model.WasteAiAnalysis?) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = AccentTeal)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Report submitted", color = TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
            if (analysis == null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "AI analysis wasn't available for this report (network issue or missing API key), but your report was saved.",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            } else {
                Spacer(modifier = Modifier.height(12.dp))
                AnalysisRow("Waste Type", analysis.wasteType)
                AnalysisRow("Severity", analysis.severity)
                AnalysisRow("Suggested Action", analysis.suggestedAction)
                AnalysisRow("Department", analysis.department)
                AnalysisRow("Est. Cleanup Cost", analysis.estimatedCleanupCost)
                AnalysisRow("AI Confidence", "${(analysis.confidenceScore * 100).toInt()}%")
            }
        }
    }
}

@Composable
private fun AnalysisRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = TextSecondary, fontSize = 12.sp)
        Text(value, color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun MyReportItem(report: Report) {
    val severityColor = when (report.aiAnalysis?.severity?.lowercase()) {
        "critical" -> AccentOrange
        "high" -> Color(0xFFF97316)
        "medium" -> Color(0xFFF59E0B)
        "low" -> AccentTeal
        else -> TextSecondary
    }
    val time = remember(report.createdAt) {
        SimpleDateFormat("MMM d, h:mm a", Locale.getDefault()).format(Date(report.createdAt))
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = report.photoUrl,
                contentDescription = report.category,
                modifier = Modifier.size(56.dp).clip(RoundedCornerShape(10.dp))
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(report.category, color = TextPrimary, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                Text("${report.locationLabel} • $time", color = TextSecondary, fontSize = 11.sp)
                Text(report.status, color = TextSecondary, fontSize = 11.sp)
            }
            if (report.aiAnalysis != null) {
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(severityColor.copy(alpha = 0.15f))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(report.aiAnalysis.severity, color = severityColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

private fun createCameraOutputUri(context: Context): Uri {
    val dir = File(context.cacheDir, "report_photos").apply { mkdirs() }
    val file = File(dir, "capture_${System.currentTimeMillis()}.jpg")
    return FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
}
