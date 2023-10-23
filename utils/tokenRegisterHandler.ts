import { CometChat } from "@cometchat/chat-sdk-react-native";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import VoipPushNotification from "react-native-voip-push-notification";
export class TokenRegisterHandler {
  static FCMToken: string;
  static VOIPToken: string;
  static APNSToken: string;
  static isLoggedIn: boolean;
  static isUsingAPNS: boolean = true;
  constructor() {
    TokenRegisterHandler.checkLoggedInUser();
    TokenRegisterHandler.addLoginListener();
    TokenRegisterHandler.addVOIPListener();
  }

  static checkLoggedInUser = async () => {
    let user = await CometChat.getLoggedinUser().catch((err) => {
      setTimeout(() => {
        TokenRegisterHandler.checkLoggedInUser();
      }, 1000);
    });
    if (user) {
      TokenRegisterHandler.isLoggedIn = true;
      TokenRegisterHandler.registerToken();
    }
  };

  static addLoginListener = () => {
    var listenerID = "UNIQUE_LISTENER_ID";
    CometChat.addLoginListener(
      listenerID,
      new CometChat.LoginListener({
        loginSuccess: (e: any) => {
          TokenRegisterHandler.isLoggedIn = true;
          TokenRegisterHandler.registerToken();
        },
      })
    );
  };

  static addVOIPListener = () => {
    VoipPushNotification.addEventListener("register", async (token) => {
      TokenRegisterHandler.VOIPToken = token;
      TokenRegisterHandler.registerTokenToCometChat();
    });
  };

  static registerToken = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        if (Platform.OS == "android") {
          let FCM = await messaging().getToken();
          TokenRegisterHandler.FCMToken = FCM;
          TokenRegisterHandler.registerTokenToCometChat();
        } else {
          if (!messaging().isDeviceRegisteredForRemoteMessages)
            await messaging().registerDeviceForRemoteMessages();
          if (TokenRegisterHandler.isUsingAPNS) {
            VoipPushNotification.registerVoipToken();

            let APNSToken = await messaging().getAPNSToken();
            if (APNSToken) {
              TokenRegisterHandler.APNSToken = APNSToken;
              TokenRegisterHandler.registerTokenToCometChat();
            }
          } else {
            let FCM = await messaging().getToken();
            TokenRegisterHandler.FCMToken = FCM;
            TokenRegisterHandler.registerTokenToCometChat();
          }
        }
      }
    } catch (error) {}
  };

  static registerTokenToCometChat = async () => {
    if (!TokenRegisterHandler.isLoggedIn) {
      return false;
    }

    try {
      if (Platform.OS == "android") {
        if (TokenRegisterHandler.FCMToken) {
          let response = await CometChat.registerTokenForPushNotification(
            TokenRegisterHandler.FCMToken
          );
        }
      } else {
        if (TokenRegisterHandler.FCMToken) {
          let response = await CometChat.registerTokenForPushNotification(
            TokenRegisterHandler.FCMToken
          );
        }
        if (TokenRegisterHandler.isUsingAPNS) {
          if (TokenRegisterHandler.VOIPToken) {
            let response = await CometChat.registerTokenForPushNotification(
              TokenRegisterHandler.VOIPToken,
              { voip: true }
            );
          }
          if (TokenRegisterHandler.APNSToken) {
            let response = await CometChat.registerTokenForPushNotification(
              TokenRegisterHandler.APNSToken,
              { voip: false }
            );
          }
        }
      }
    } catch (error) {}
  };
}
