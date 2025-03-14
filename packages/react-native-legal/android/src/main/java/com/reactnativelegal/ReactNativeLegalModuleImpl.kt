package com.reactnativelegal

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.mikepenz.aboutlibraries.LibsBuilder

object ReactNativeLegalModuleImpl {
    const val NAME = "ReactNativeLegalModule"

    fun launchLicenseListScreen(reactContext: ReactApplicationContext, licenseHeaderText: String) {
        val context = reactContext.currentActivity ?: return
        val intent =
            Intent(context, ReactNativeLegalActivity::class.java).apply {
                this.putExtra("data", LibsBuilder())
                this.putExtra(LibsBuilder.BUNDLE_TITLE, licenseHeaderText)
            }

        context.startActivity(intent)
    }
}
