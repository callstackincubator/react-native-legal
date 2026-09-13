package com.reactnativelegal

import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.rememberTopAppBarState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.style.TextOverflow
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.mikepenz.aboutlibraries.ui.compose.android.produceLibraries
import com.mikepenz.aboutlibraries.ui.compose.m3.LibrariesContainer

@OptIn(ExperimentalMaterial3Api::class)
class ReactNativeLegalActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.ReactNativeLegalTheme)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_licenses)

        setupEdgeToEdge()

        val bundle = intent.extras
        val id = bundle?.getInt("id") ?: -1
        val title = bundle?.getString("title", "") ?: ""
        val composeView = findViewById<ComposeView>(R.id.compose_view)

        // https://developer.android.com/training/tv/start/hardware.html#runtime-check
        val isTVDevice = packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)

        composeView.setContent {
            val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior(rememberTopAppBarState())

            MaterialTheme(
                colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()
            ) {
                Scaffold(
                    modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
                    topBar = {
                        if (!isTVDevice) {
                            CenterAlignedTopAppBar(
                                title = {
                                    Text(title, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                },
                                navigationIcon = {
                                    IconButton(
                                        onClick = { onBackPressedDispatcher.onBackPressed() }
                                    ) {
                                        Icon(
                                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                            contentDescription = "Go back",
                                        )
                                    }
                                },
                            )
                        }
                    },
                ) { innerPadding ->
                    if (id == -1) {
                        Column(
                            modifier = Modifier.fillMaxSize().padding(innerPadding),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                        ) {
                            Text("Incorrect resource identifier provided")
                        }
                    } else {
                        val libraries by produceLibraries(id)
                        LibrariesContainer(
                            libraries = libraries,
                            modifier = Modifier.fillMaxSize().padding(innerPadding),
                        )
                    }
                }
            }
        }
    }

    /**
     * Based on React Native's edge-to-edge util
     * https://github.com/facebook/react-native/blob/6e7797d5ab1af6bab8d94b1c1ad62dddc1ec5474/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views/view/WindowUtil.kt#L106
     */
    private fun setupEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(window, false)

        val isLightTheme =
            resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK !=
                Configuration.UI_MODE_NIGHT_YES

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.isStatusBarContrastEnforced = false
            window.isNavigationBarContrastEnforced = true
        }

        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor =
            when {
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q -> Color.TRANSPARENT
                // https://cs.android.com/android/platform/superproject/+/master:frameworks/base/core/java/com/android/internal/policy/DecorView.java;drc=6ef0f022c333385dba2c294e35b8de544455bf19;l=142
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && isLightTheme ->
                    Color.argb(0xe6, 0xFF, 0xFF, 0xFF)
                // https://cs.android.com/android/platform/superproject/+/master:frameworks/base/core/res/remote_color_resources_res/values/colors.xml;l=67
                else -> Color.argb(0x80, 0x1b, 0x1b, 0x1b)
            }

        WindowInsetsControllerCompat(window, window.decorView).apply {
            isAppearanceLightStatusBars = isLightTheme
            isAppearanceLightNavigationBars = isLightTheme
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes.layoutInDisplayCutoutMode =
                when {
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.R ->
                        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                    else -> WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                }
        }
    }
}
