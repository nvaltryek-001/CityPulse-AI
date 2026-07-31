package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.example.ui.theme.BackgroundDark

@Composable
fun MapScreen() {
    Box(
        modifier = Modifier.fillMaxSize().background(BackgroundDark),
        contentAlignment = Alignment.Center
    ) {
        Text("Interactive Map Placeholder\n(Native Map UI)", color = MaterialTheme.colorScheme.onBackground)
    }
}
