package com.example.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import com.example.BuildConfig
import com.example.data.repository.GoogleAuthHelper
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.MapScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.ReportScreen
import com.example.ui.screens.auth.ForgotPasswordScreen
import com.example.ui.screens.auth.LoginScreen
import com.example.ui.screens.auth.SignupScreen
import com.example.ui.theme.AccentTeal
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.SurfaceDark
import com.example.ui.viewmodel.AuthViewModel
import kotlinx.coroutines.launch

private object Routes {
    const val SPLASH = "splash"
    const val AUTH_GRAPH = "auth_graph"
    const val LOGIN = "login"
    const val SIGNUP = "signup"
    const val FORGOT_PASSWORD = "forgot_password"
    const val MAIN = "main"
}

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard : Screen("dashboard", "Home", Icons.Filled.Home)
    object Report : Screen("report", "Report", Icons.Filled.Warning)
    object Map : Screen("map", "Map", Icons.Filled.LocationOn)
    object Profile : Screen("profile", "Profile", Icons.Filled.Person)
}

val items = listOf(
    Screen.Dashboard,
    Screen.Report,
    Screen.Map,
    Screen.Profile
)

@Composable
fun CityPulseApp() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = viewModel(factory = AuthViewModel.Factory)

    NavHost(navController = navController, startDestination = Routes.SPLASH) {
        composable(Routes.SPLASH) {
            SplashGate(
                isLoggedIn = authViewModel.isLoggedIn,
                onDecided = { loggedIn ->
                    val target = if (loggedIn) Routes.MAIN else Routes.AUTH_GRAPH
                    navController.navigate(target) {
                        popUpTo(Routes.SPLASH) { inclusive = true }
                    }
                }
            )
        }

        navigation(startDestination = Routes.LOGIN, route = Routes.AUTH_GRAPH) {
            composable(Routes.LOGIN) {
                val context = LocalContext.current
                val scope = rememberCoroutineScope()
                LoginScreen(
                    onLoginSuccess = { navController.navigateToMain() },
                    onNavigateToSignup = { navController.navigate(Routes.SIGNUP) },
                    onNavigateToForgotPassword = { navController.navigate(Routes.FORGOT_PASSWORD) },
                    onGoogleSignInClick = {
                        scope.launch {
                            signInWithGoogle(context, authViewModel)
                            if (authViewModel.isLoggedIn) navController.navigateToMain()
                        }
                    },
                    authViewModel = authViewModel
                )
            }
            composable(Routes.SIGNUP) {
                SignupScreen(
                    onSignupSuccess = { navController.navigateToMain() },
                    onNavigateBack = { navController.popBackStack() },
                    authViewModel = authViewModel
                )
            }
            composable(Routes.FORGOT_PASSWORD) {
                ForgotPasswordScreen(
                    onNavigateBack = { navController.popBackStack() },
                    authViewModel = authViewModel
                )
            }
        }

        composable(Routes.MAIN) {
            MainScreen(
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Routes.AUTH_GRAPH) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}

private fun NavHostController.navigateToMain() {
    navigate(Routes.MAIN) {
        popUpTo(Routes.AUTH_GRAPH) { inclusive = true }
    }
}

private suspend fun signInWithGoogle(context: android.content.Context, authViewModel: AuthViewModel) {
    val webClientId = BuildConfig.GOOGLE_WEB_CLIENT_ID
    if (webClientId.isBlank() || webClientId == "MY_GOOGLE_WEB_CLIENT_ID") {
        // Not configured yet -- see SETUP.md "Google Sign-In" section.
        return
    }
    val helper = GoogleAuthHelper(context)
    val result = helper.requestGoogleIdToken(webClientId)
    result.onSuccess { idToken -> authViewModel.signInWithGoogleIdToken(idToken) }
}

/** Brief splash frame that decides which graph to land on based on current Firebase session. */
@Composable
private fun SplashGate(isLoggedIn: Boolean, onDecided: (Boolean) -> Unit) {
    LaunchedEffect(Unit) {
        onDecided(isLoggedIn)
    }
    Box(
        modifier = Modifier.fillMaxSize().background(BackgroundDark),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(color = AccentTeal)
    }
}

@Composable
private fun MainScreen(onLogout: () -> Unit) {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = SurfaceDark,
                contentColor = Color.White
            ) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                items.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = AccentTeal,
                            selectedTextColor = AccentTeal,
                            unselectedIconColor = Color.Gray,
                            unselectedTextColor = Color.Gray,
                            indicatorColor = SurfaceDark
                        ),
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) { DashboardScreen() }
            composable(Screen.Report.route) { ReportScreen() }
            composable(Screen.Map.route) { MapScreen() }
            composable(Screen.Profile.route) { ProfileScreen(onLogout = onLogout) }
        }
    }
}
