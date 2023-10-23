#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#import <PushKit/PushKit.h>
#import "RNVoipPushNotificationManager.h"

#import "RNCallKeep.h"
#import <Firebase.h>


@implementation AppDelegate
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  // Register VoIP push token (a property of PKPushCredentials) with server
  
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];
}

- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type
{
  NSLog(@"dummy");
  // --- The system calls this method when a previously provided push token is no longer valid for use. No action is necessary on your part to reregister the push type. Instead, use this method to notify your server not to send push notifications using the matching push token.
}


// --- Handle incoming pushes
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  
  // Parse the 'message' dictionary
  NSDictionary *messageDictionary = [payload.dictionaryPayload objectForKey:@"message"];
  // Parse the 'data' dictionary
  NSDictionary *dataDictionary = [messageDictionary objectForKey:@"data"];
  // Get the value of 'action'
  NSString *actionValue = [dataDictionary objectForKey:@"action"];

  // uuid for the call
  NSString *uuid =[[[NSUUID UUID] UUIDString] lowercaseString];

  // Process the received push
  [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];

  if ([actionValue isEqualToString:@"initiated"]) {
      NSLog(@"Action is initiated.");

      // Retrieve information from your voip push payload
      NSDictionary *content = [payload.dictionaryPayload valueForKey:@"aps"];
      NSDictionary *sender = [content valueForKey:@"alert"];
      
      NSString *callerName=[sender valueForKey:@"title"];
      NSString *handle = [sender valueForKey:@"title"];

      [RNCallKeep reportNewIncomingCall: uuid
                                  handle: handle
                              handleType: @"generic"
                                hasVideo: NO
                     localizedCallerName: callerName
                         supportsHolding: YES
                            supportsDTMF: YES
                        supportsGrouping: YES
                      supportsUngrouping: YES
                             fromPushKit: YES
                                 payload: nil
                   withCompletionHandler: completion];

  } else if ([actionValue isEqualToString:@"unanswered"]) {
      // Your code for handling 'unanswered' action
      NSLog(@"Action is unanswered.");
      [RNCallKeep endCallWithUUID:uuid reason:3];
    
  } else if ([actionValue isEqualToString:@"rejected"]) {
      // Your code for handling 'rejected' action
      NSLog(@"Action is rejected.");
      [RNCallKeep endCallWithUUID:uuid reason:6];
    
  } else if ([actionValue isEqualToString:@"busy"]){
      // Unknown action, handle accordingly
      NSLog(@"Action is rejected.");
      [RNCallKeep endCallWithUUID:uuid reason:1];
    
  } else if ([actionValue isEqualToString:@"cancelled"]){
      // Unknown action, handle accordingly
      NSLog(@"Action is cancelled.");
      [RNCallKeep endCallWithUUID:uuid reason:6];
  
  } else if ([actionValue isEqualToString:@"ended"]){
      // Unknown action, handle accordingly
      NSLog(@"Action is ended.");
      [RNCallKeep endCallWithUUID:uuid reason:2];

  } else {
      NSLog(@"Unknown action is not initiated.");

      // report a call with dummy data and end it immediately
     
       [RNCallKeep endCallWithUUID:uuid reason:3];
  }
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"react_native_sample_app";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  [FIRApp configure];
  [RNVoipPushNotificationManager voipRegistration];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
