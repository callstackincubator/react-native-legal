package com.reactnativelegal

import android.content.Intent
import android.os.Bundle
import androidx.core.os.bundleOf
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.mikepenz.aboutlibraries.Libs
import com.mikepenz.aboutlibraries.LibsBuilder
import com.mikepenz.aboutlibraries.util.withContext

object ReactNativeLegalModuleImpl {
    const val NAME = "ReactNativeLegalModule"

    private var cachedData: List<Bundle>? = null

    fun launchLicenseListScreen(reactContext: ReactApplicationContext, licenseHeaderText: String) {
        val context = reactContext.currentActivity ?: return
        val intent =
            Intent(context, ReactNativeLegalActivity::class.java).apply {
                this.putExtra("data", LibsBuilder())
                this.putExtra(LibsBuilder.BUNDLE_TITLE, licenseHeaderText)
            }

        context.startActivity(intent)
    }

    fun getLibraries(reactContext: ReactApplicationContext): WritableMap {
        if (cachedData == null) {
            cachedData = retrieveLibrariesArray(reactContext)
        }

        return Arguments.createMap().apply { putArray("data", Arguments.fromList(cachedData)) }
    }

    private fun retrieveLibrariesArray(reactContext: ReactApplicationContext): List<Bundle>? {
        val context = reactContext.currentActivity ?: return null

        val libraries = Libs.Builder().withContext(context).build().libraries

        return libraries.map { library ->
            bundleOf(
                "id" to library.uniqueId,
                "name" to library.name,
                "description" to library.description,
                "website" to library.website,
                "developers" to library.developers.joinToString(),
                "organization" to library.organization?.name,
                "licenses" to
                    library.licenses.map { license ->
                        bundleOf(
                            "name" to license.name,
                            "url" to license.url,
                            "year" to license.year,
                            "licenseContent" to (license.licenseContent ?: ""),
                        )
                    },
            )
        }
    }
}
