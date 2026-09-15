package com.reactnativelegal

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.core.os.bundleOf
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.mikepenz.aboutlibraries.Libs

object ReactNativeLegalModuleImpl {
    const val NAME = "ReactNativeLegalModule"

    private var cachedData: List<Bundle>? = null
    private var cachedId: Int = -1

    fun launchLicenseListScreen(reactContext: ReactApplicationContext, licenseHeaderText: String) {
        val context = reactContext.currentActivity ?: return
        val id = getOrInitLibrariesResourceIdentifier(context)
        val intent =
            Intent(context, ReactNativeLegalActivity::class.java).apply {
                this.putExtra("id", id)
                this.putExtra("title", licenseHeaderText)
            }

        context.startActivity(intent)
    }

    fun getLibraries(reactContext: ReactApplicationContext): WritableMap {
        if (cachedData == null) {
            cachedData = retrieveLibrariesArray(reactContext)
        }

        val libraries = cachedData ?: emptyList()
        return Arguments.createMap().apply { putArray("data", Arguments.fromList(libraries)) }
    }

    private fun getOrInitLibrariesResourceIdentifier(context: Context): Int {
        if (cachedId == -1) {
            cachedId =
                context.resources.getIdentifier(
                    "aboutlibraries",
                    "raw",
                    context.packageName,
                )
        }
        return cachedId
    }

    private fun retrieveLibrariesArray(reactContext: ReactApplicationContext): List<Bundle>? {
        val context = reactContext.currentActivity ?: return null

        val jsonString =
            context.resources
                .openRawResource(getOrInitLibrariesResourceIdentifier(context))
                .bufferedReader()
                .use { it.readText() }
        val libraries = Libs.Builder().withJson(jsonString).build().libraries

        return libraries.map { library ->
            bundleOf(
                "id" to library.uniqueId,
                "name" to library.name,
                "version" to library.artifactVersion,
                "description" to library.description,
                "website" to library.website,
                "developers" to
                    library.developers.map { developer ->
                        bundleOf(
                            "name" to developer.name,
                            "organisationUrl" to developer.organisationUrl,
                        )
                    },
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
