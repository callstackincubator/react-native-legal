package com.reactnativelegal

import android.content.pm.PackageManager
import android.content.res.Configuration
import android.os.Bundle
import android.view.MenuItem
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
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

        val isLightTheme =
            resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK !=
                Configuration.UI_MODE_NIGHT_YES

        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = isLightTheme
            isAppearanceLightNavigationBars = isLightTheme
        }

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
                left = v.paddingLeft + systemInsets.left,
                top = v.paddingTop + systemInsets.top,
                right = v.paddingRight + systemInsets.right,
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
}
