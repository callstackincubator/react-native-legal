package com.reactnativelegal

import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.MenuItem
import android.view.View
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.core.view.updatePadding
import com.mikepenz.aboutlibraries.LibsBuilder.Companion.BUNDLE_TITLE
import com.mikepenz.aboutlibraries.ui.LibsSupportFragment

/**
 * Based on AboutLibraries LibsActivity, but simplified (no search filter), with improved back
 * handling and hidden Toolbar/ActionBar for TV devices
 */
class ReactNativeLegalActivity : AppCompatActivity() {
    private lateinit var fragment: LibsSupportFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.ReactNativeLegalTheme)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_licenses)

        setupEdgeToEdge()

        val bundle = intent.extras
        fragment = LibsSupportFragment().apply { arguments = bundle }

        // https://developer.android.com/training/tv/start/hardware.html#runtime-check
        val isTVDevice = packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)

        if (isTVDevice) {
            hideToolbar()
        } else {
            setupToolbar(bundle)
        }

        supportFragmentManager
            .beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            onBackPressedDispatcher.onBackPressed()
            return true
        }
        return super.onOptionsItemSelected(item)
    }

    private fun hideToolbar() {
        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        toolbar.visibility = View.GONE
        supportActionBar?.hide()
    }

    private fun setupToolbar(bundle: Bundle?) {
        val title = bundle?.getString(BUNDLE_TITLE, "") ?: ""

        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)

        supportActionBar?.let {
            it.setDisplayHomeAsUpEnabled(true)
            it.setDisplayShowTitleEnabled(title.isNotEmpty())
            it.title = title
        }

        toolbar.setOnApplyWindowInsetsListener { v, insets ->
            val systemInsets =
                WindowInsetsCompat.toWindowInsetsCompat(insets)
                    .getInsets(WindowInsetsCompat.Type.systemBars())
            v.updatePadding(
                left = systemInsets.left,
                top = systemInsets.top,
                right = systemInsets.right,
            )

            insets
        }

        if (toolbar.isAttachedToWindow) {
            toolbar.requestApplyInsets()
        } else {
            toolbar.addOnAttachStateChangeListener(
                object : View.OnAttachStateChangeListener {
                    override fun onViewAttachedToWindow(v: View) {
                        v.removeOnAttachStateChangeListener(this)
                        v.requestApplyInsets()
                    }

                    override fun onViewDetachedFromWindow(v: View) = Unit
                }
            )
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
