// swift-tools-version: 6.0
import PackageDescription

let package = Package(
  name: "Tools",
  platforms: [
    .macOS(.v11)
  ],
  dependencies: [
    .package(url: "https://github.com/mono0926/LicensePlist", from: "3.28.0")
  ],
  targets: [
    .target(name: "Tools", path: "")
  ]
)
