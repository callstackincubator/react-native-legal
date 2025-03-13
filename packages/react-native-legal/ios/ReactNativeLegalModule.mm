#import "ReactNativeLegalModule.h"

#if __has_include(<ReactNativeLegal/ReactNativeLegal-Swift.h>)
#import <ReactNativeLegal/ReactNativeLegal-Swift.h>
#else
#import "ReactNativeLegal-Swift.h"
#endif

#if RCT_NEW_ARCH_ENABLED
#import "ReactNativeLegal.h"

@interface ReactNativeLegalModule () <NativeReactNativeLegalSpec>
@end
#endif

@implementation ReactNativeLegalModule

RCT_EXPORT_MODULE(ReactNativeLegalModule)

RCT_EXPORT_METHOD(launchLicenseListScreen : (NSString *)licenseHeaderText)
{
  [ReactNativeLegalModuleImpl launchLicenseListScreenWithLicenseHeaderText:licenseHeaderText];
}

#if RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeReactNativeLegalSpecJSI>(params);
}
#endif

@end
