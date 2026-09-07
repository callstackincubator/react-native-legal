// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ReactNativeLegal",
    platforms: [.iOS(.v15), .tvOS(.v15)],
    products: [
        .library(name: "ReactNativeLegal", targets: ["ReactNativeLegalObjC"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "ReactNativeLegalSwift",
            path: ".",
            sources: [
                "ios/ReactNativeLegalDetailViewController.swift",
                "ios/ReactNativeLegalLicenseMetadata.swift",
                "ios/ReactNativeLegalModuleImpl.swift",
                "ios/ReactNativeLegalTableViewController.swift",
            ],
            publicHeadersPath: "ios",
            cSettings: [.headerSearchPath("ios")],
            cxxSettings: [.headerSearchPath("ios"), .define("DEBUG", .when(configuration: .debug)), .define("NDEBUG", .when(configuration: .release))],
            linkerSettings: [.linkedFramework("UIKit"), .linkedFramework("Foundation"), .linkedFramework("CoreGraphics")]
        ),
        .target(
            name: "ReactNativeLegalObjC",
            dependencies: [
                "ReactNativeLegalSwift",
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
            ],
            path: ".",
            sources: [
                "ios/ReactNativeLegalModule.h",
                "ios/ReactNativeLegalModule.mm",
            ],
            publicHeadersPath: "ios",
            cSettings: [.headerSearchPath("ios"), .define("REACT_NATIVE_LEGAL_USING_SPM")],
            cxxSettings: [
                .headerSearchPath("ios"),
                .define("REACT_NATIVE_LEGAL_USING_SPM"),
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
                .unsafeFlags(["-fmodules", "-fcxx-modules"])
            ],
            linkerSettings: [.linkedFramework("UIKit"), .linkedFramework("Foundation"), .linkedFramework("CoreGraphics")]
        )
    ],
    cxxLanguageStandard: .cxx20
)
