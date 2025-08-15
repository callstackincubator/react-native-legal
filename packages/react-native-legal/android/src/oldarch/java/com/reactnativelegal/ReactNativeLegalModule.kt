package com.reactnativelegal

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = ReactNativeLegalModule.NAME)
class ReactNativeLegalModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    override fun getName() = NAME

    @ReactMethod
    fun launchLicenseListScreen(licenseHeaderText: String) {
        ReactNativeLegalModuleImpl.launchLicenseListScreen(
            reactApplicationContext,
            licenseHeaderText,
        )
    }

    @ReactMethod
    fun getLibrariesAsync(promise: Promise?) {
        try {
            promise?.resolve(ReactNativeLegalModuleImpl.getLibraries(reactApplicationContext))
        } catch (e: Exception) {
            promise?.reject(e)
        }
    }

    companion object {
        const val NAME = ReactNativeLegalModuleImpl.NAME
    }
}
