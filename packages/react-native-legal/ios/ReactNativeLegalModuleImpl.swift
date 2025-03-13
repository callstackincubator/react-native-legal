import UIKit

@objc(ReactNativeLegalModuleImpl)
public class ReactNativeLegalModuleImpl: NSObject {
  @objc public static func launchLicenseListScreen(licenseHeaderText: String) {
    guard
      let settingsBundleUrl = Bundle.main.url(forResource: "Settings", withExtension: "bundle"),
      let settingsBundle = Bundle(url: settingsBundleUrl),
      let licensePlistUrl = settingsBundle.url(
        forResource: "com.mono0926.LicensePlist", withExtension: "plist"),
      let dictArray = parsePlistToDictArray(fileUrl: licensePlistUrl)
    else {
      return
    }

    let licenses = parseRawLicenseMetadataToArray(
      rawLicenses: getChildPaneSpecifiers(dictArray: dictArray),
      licensePlistUrl: licensePlistUrl
    )

    DispatchQueue.main.async {
      guard let presentedViewController = RCTPresentedViewController() else {
        return
      }

      let tableViewController = ReactNativeLegalTableViewController(
        title: licenseHeaderText, data: licenses)
      let navController = UINavigationController(rootViewController: tableViewController)
      navController.modalPresentationStyle = .fullScreen
      presentedViewController.present(navController, animated: true)
    }
  }

  private static func getChildPaneSpecifiers(dictArray: [[String: Any]]) -> [[String: Any]] {
    return
      dictArray
      .filter { $0["Type"] as? String == "PSChildPaneSpecifier" }
  }

  private static func parseRawLicenseMetadataToArray(
    rawLicenses: [[String: Any]], licensePlistUrl: URL
  ) -> [ReactNativeLegalLicenseMetadata] {
    return
      rawLicenses
      .map { licenseObj in
        guard
          let file = licenseObj["File"] as? String,
          let title = licenseObj["Title"] as? String
        else {
          return ReactNativeLegalLicenseMetadata()
        }

        let fileUrl = licensePlistUrl.deletingLastPathComponent().addPathComponent(file)
          .appendingPathExtension("plist")

        guard
          let data = parsePlistToDictArray(fileUrl: fileUrl),
          let item = data.first(where: { $0["FooterText"] != nil }),
          let footerText = item["FooterText"] as? String
        else {
          return ReactNativeLegalLicenseMetadata(name: title)
        }

        return ReactNativeLegalLicenseMetadata(name: title, content: footerText)
      }
      .filter { $0.name != nil }
  }

  private static func parsePlistToDictArray(fileUrl: URL) -> [[String: Any]]? {
    guard
      let data = try? NSDictionary(contentsOf: fileUrl, error: ()),
      let array = data["PreferenceSpecifiers"] as? [Any]
    else {
      return nil
    }

    return array.compactMap { $0 as? [String: Any] }
  }
}

extension URL {
  func addPathComponent(_ component: String) -> URL {
    if #available(iOS 16.0, tvOS 16.0, *) {
      return self.appending(component: component)
    }

    return self.appendingPathComponent(component)
  }
}
