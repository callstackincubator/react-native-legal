package com.reactnativelegal

import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.mikepenz.aboutlibraries.Libs
import com.mikepenz.aboutlibraries.LibsBuilder
import com.mikepenz.aboutlibraries.util.withContext

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
        android.util.Log.d("DUPA", "START")
        LibsBuilder().libs?.let {
            it.libraries.forEach { lib ->
                android.util.Log.d("DUPA", "library: ${lib.name} - ${lib}")
            }
        }
        Libs.Builder().withContext(context).build().libraries.forEach { lib ->
            android.util.Log.d("DUPA", "library2: ${lib.name} - ${lib}")
        }
        android.util.Log.d("DUPA", "STOP")
    }

    fun getLibraries(reactContext: ReactApplicationContext): WritableMap {
        val context = reactContext.currentActivity ?: return Arguments.createMap()

        val libraries = Libs.Builder().withContext(context).build().libraries

        val data = Arguments.createArray()

        libraries.forEach { library ->
            data.pushMap(
                Arguments.createMap().apply {
                    putString("id", library.uniqueId)
                    putString("name", library.name)
                    putString("description", library.description)
                    putString("website", library.website)
                    putString("developers", library.developers.joinToString())
                    library.organization?.let { organization ->
                        putString("organization", organization.name)
                    }

                    val licensesArray = Arguments.createArray()

                    library.licenses.forEach { license ->
                        val licenseMap = Arguments.createMap()

                        licenseMap.putString("name", license.name)
                        licenseMap.putString("url", license.url)
                        licenseMap.putString("year", license.year)
                        licenseMap.putString("licenseContent", license.licenseContent ?: "")

                        licensesArray.pushMap(licenseMap)
                    }
                    putArray("licenses", licensesArray)
                }
            )
        }

        return Arguments.createMap().apply { putArray("data", data) }
    }
}
