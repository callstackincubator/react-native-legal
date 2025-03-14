package com.reactnativelegal

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = ReactNativeLegalModule.NAME)
class ReactNativeLegalModule(reactContext: ReactApplicationContext) :
    NativeReactNativeLegalSpec(reactContext) {
    override fun launchLicenseListScreen(licenseHeaderText: String) {
        ReactNativeLegalModuleImpl.launchLicenseListScreen(
            reactApplicationContext,
            licenseHeaderText,
        )
    }

    companion object {
        const val NAME = ReactNativeLegalModuleImpl.NAME
    }
}
