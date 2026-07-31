package com.example.ui.screens

import android.Manifest
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.model.AqiCategory
import com.example.data.model.EnvironmentSnapshot
import com.example.ui.theme.*
import com.example.ui.viewmodel.AuthViewModel
import com.example.ui.viewmodel.DashboardUiState
import com.example.ui.viewmodel.DashboardViewModel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberMultiplePermissionsState
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun DashboardScreen() {
    val context = androidx.compose.ui.platform.LocalContext.current
    val application = context.applicationContext as android.app.Application
    val dashboardViewModel: DashboardViewModel = viewModel(factory = DashboardViewModel.factory(application))
    val authViewModel: AuthViewModel = viewModel(factory = AuthViewModel.Factory)

    val uiState by dashboardViewModel.uiState.collectAsState()
    val isRefreshing by dashboardViewModel.isRefreshing.collectAsState()
    val profile by authViewModel.currentUserProfile.collectAsState()

    val locationPermissions = rememberMultiplePermissionsState(
        permissions = listOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
    )

    var permissionRequested by remember { mutableStateOf(false) }
    LaunchedEffect(locationPermissions.allPermissionsGranted, permissionRequested) {
        when {
            locationPermissions.allPermissionsGranted -> dashboardViewModel.onPermissionResult(true)
            !permissionRequested -> {
                permissionRequested = true
                locationPermissions.launchMultiplePermissionRequest()
            }
            else -> dashboardViewModel.onPermissionResult(false)
        }
    }

    Scaffold(
        containerColor = BackgroundDark,
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { Spacer(modifier = Modifier.height(16.dp)) }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(greeting(), color = TextSecondary, fontSize = 14.sp)
                        Text(
                            profile?.name?.ifBlank { "there" }?.substringBefore(" ") ?: "there",
                            color = TextPrimary,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Row {
                        IconButton(onClick = { dashboardViewModel.refresh() }) {
                            if (isRefreshing) {
                                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp, color = AccentTeal)
                            } else {
                                Icon(Icons.Filled.Refresh, contentDescription = "Refresh", tint = TextPrimary)
                            }
                        }
                        IconButton(onClick = { /* Notifications: wired up in a later phase */ }) {
                            Icon(Icons.Filled.Notifications, contentDescription = "Notifications", tint = TextPrimary)
                        }
                    }
                }
            }

            item {
                AnimatedContent(targetState = uiState, label = "dashboard-state") { state ->
                    when (state) {
                        is DashboardUiState.Loading -> AQICardSkeleton()
                        is DashboardUiState.Success -> Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                            AQICard(state.data)
                            WeatherCard(state.data)
                        }
                        is DashboardUiState.Error -> ErrorCard(state.message, onRetry = { dashboardViewModel.refresh() })
                    }
                }
            }

            item { QuickActions() }

            item {
                Text(
                    "Reports tracking arrives in a later phase -- this app currently shows no fake report data.",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }

            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

private fun greeting(): String {
    val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
    return when (hour) {
        in 5..11 -> "Good Morning,"
        in 12..16 -> "Good Afternoon,"
        else -> "Good Evening,"
    }
}

@Composable
fun AQICard(data: EnvironmentSnapshot) {
    val categoryColor = Color(data.aqiCategory.colorHex)
    val animatedAqi by animateFloatAsState(
        targetValue = data.aqiIndex.toFloat(),
        animationSpec = tween(durationMillis = 700),
        label = "aqi-counter"
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.linearGradient(colors = listOf(PrimaryBlue, categoryColor)),
                    shape = RoundedCornerShape(24.dp)
                )
                .padding(24.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Air Quality Index", color = GlassWhite, fontSize = 14.sp)
                    Text(data.weather.locationLabel, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.Bottom) {
                    Text("${animatedAqi.toInt()}", color = Color.White, fontSize = 48.sp, fontWeight = FontWeight.Bold)
                    Text(" / 5  ${data.aqiCategory.label}", color = Color.White, fontSize = 20.sp, modifier = Modifier.padding(bottom = 8.dp))
                }
                if (data.isFromCache) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Showing last known reading -- offline", color = GlassWhite, fontSize = 12.sp)
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text(data.aqiCategory.healthAdvice, color = GlassWhite, fontSize = 12.sp, lineHeight = 16.sp)
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    WeatherStat("PM2.5", "%.1f µg/m³".format(data.pollutants.pm25))
                    WeatherStat("PM10", "%.1f µg/m³".format(data.pollutants.pm10))
                    WeatherStat("CO", "%.0f µg/m³".format(data.pollutants.co))
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    WeatherStat("NO2", "%.1f µg/m³".format(data.pollutants.no2))
                    WeatherStat("SO2", "%.1f µg/m³".format(data.pollutants.so2))
                    WeatherStat("O3", "%.1f µg/m³".format(data.pollutants.o3))
                }
            }
        }
    }
}

@Composable
fun WeatherCard(data: EnvironmentSnapshot) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("${data.weather.temperatureC.toInt()}°C", color = TextPrimary, fontSize = 32.sp, fontWeight = FontWeight.Bold)
                    Text(
                        data.weather.condition.replaceFirstChar { it.uppercase() },
                        color = TextSecondary,
                        fontSize = 14.sp
                    )
                }
                Icon(Icons.Filled.WaterDrop, contentDescription = null, tint = AccentTeal, modifier = Modifier.size(40.dp))
            }
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                WeatherStatDark("Feels Like", "${data.weather.feelsLikeC.toInt()}°C")
                WeatherStatDark("Humidity", "${data.weather.humidityPercent}%")
                WeatherStatDark("Wind", "%.1f m/s".format(data.weather.windSpeedMs))
                WeatherStatDark("Pressure", "${data.weather.pressureHpa} hPa")
            }
            if (data.forecast.isNotEmpty()) {
                Spacer(modifier = Modifier.height(20.dp))
                Text("Next few hours", color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    data.forecast.take(4).forEach { point ->
                        val time = remember(point.timestampMillis) {
                            SimpleDateFormat("h a", Locale.getDefault()).format(Date(point.timestampMillis))
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(time, color = TextSecondary, fontSize = 11.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("${point.temperatureC.toInt()}°", color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                            Text("${point.precipitationProbabilityPercent}%", color = AccentTeal, fontSize = 10.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun WeatherStatDark(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        Text(label, color = TextSecondary, fontSize = 11.sp)
    }
}

@Composable
fun WeatherStat(label: String, value: String) {
    Column {
        Text(label, color = GlassWhite, fontSize = 12.sp)
        Text(value, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun AQICardSkeleton() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(280.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = SurfaceDark
        )
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(
                color = AccentTeal
            )

            Text(
                text = "Fetching live AQI & weather...",
                color = TextSecondary,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 64.dp)
            )
        }
    }
}
@Composable
fun ErrorCard(message: String, onRetry: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Column(modifier = Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Filled.Air, contentDescription = null, tint = AccentOrange, modifier = Modifier.size(36.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(message, color = TextSecondary, fontSize = 13.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(modifier = Modifier.height(12.dp))
            Button(onClick = onRetry, colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)) {
                Text("Retry")
            }
        }
    }
}

@Composable
fun QuickActions() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        ActionButton(title = "Report Waste", modifier = Modifier.weight(1f))
        ActionButton(title = "View Map", modifier = Modifier.weight(1f))
    }
}

@Composable
fun ActionButton(title: String, modifier: Modifier = Modifier) {
    Button(
        onClick = { /* Wired up when Waste Reporting / Maps phases are built */ },
        modifier = modifier.height(56.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(containerColor = SurfaceLight)
    ) {
        Text(title, color = TextPrimary)
    }
}
