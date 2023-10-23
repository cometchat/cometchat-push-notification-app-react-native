import { CometChat } from "@cometchat/chat-sdk-react-native";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import { Platform } from "react-native";
import RNCallKeep, { IOptions } from "react-native-callkeep";
import { navigate } from "../src/StackNavigator";
import { SCREENS_CONSTANTS } from "../src/CONSTS";
import _BackgroundTimer from "react-native-background-timer";
import VoipPushNotification from "react-native-voip-push-notification";
import { CometChatCalls } from "@cometchat/calls-sdk-react-native";

const options: IOptions = {
  ios: {
    appName: "Sample App",
  },
  android: {
    alertTitle: "Permissions required",
    alertDescription: "This application needs to access your phone accounts",
    cancelButton: "Cancel",
    okButton: "ok",
    imageName: "phone_account_icon",
    additionalPermissions: [],
    // Required to get audio in background when using Android 11
    foregroundService: {
      channelId: "com.sampleapp.my",
      channelName: "Foreground service for my app",
      notificationTitle: "My app is running on background",
      //   notificationIcon: 'Path to the resource icon of the notification',
    },
  },
};

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export class NotificationHandler {
  static channelId: any;
  static currentNotificationId: string;
  static previousNotificationIds: string[];
  static isRinging: boolean = false;
  static isAnswered: boolean = false;
  static callerId: any;
  static msg: any = {};
  constructor() {
    NotificationHandler.getPermissions();
    if (Platform.OS === "android") NotificationHandler.createChannel();
    NotificationHandler.setupEventListeners();
  }

  static async getPermissions() {
    try {
      RNCallKeep.setup(options);
      RNCallKeep.setAvailable(true);
      RNCallKeep.setReachable();
      await notifee.requestPermission();
    } catch (error) {
      console.log(error);
    }
  }

  static async createChannel() {
    NotificationHandler.channelId = await notifee.createChannel({
      id: "message",
      name: "messages",
      lights: true,
      vibration: true,
      importance: AndroidImportance.HIGH,
    });
  }

  static async displayNotification({
    id,
    title,
    body,
    data,
    android,
  }: {
    id: string | undefined;
    title: string;
    body: string;
    data: { [key: string]: string | number | object };
    android?: object;
  }) {
    NotificationHandler.currentNotificationId = await notifee.displayNotification(
      {
        id,
        title,
        body,
        data,
        android: {
          channelId: NotificationHandler.channelId,
          smallIcon: "ic_small_icon",
          circularLargeIcon: true,
          smallIconLevel: 1,
          actions: [
            {
              pressAction: {
                id: "default",
              },
              title: "open",
            },
          ],
          ...android,
        },
      }
    );
    NotificationHandler.previousNotificationIds?.push(
      NotificationHandler.currentNotificationId
    );
    return NotificationHandler.currentNotificationId;
  }
  static async cancel(notificationId: any) {
    await notifee.cancelNotification(
      notificationId || NotificationHandler.currentNotificationId
    );
  }

  static displayCallAndroid = () => {
    NotificationHandler.isRinging = true;
    NotificationHandler.callerId = generateUUID();
    RNCallKeep.displayIncomingCall(
      NotificationHandler.callerId,
      NotificationHandler.msg?.sender?.name,
      NotificationHandler.msg?.sender?.name,
      "generic"
    );
  };
  static didDisplayIncomingCall = (DidDisplayIncomingCallArgs: any) => {
    if (DidDisplayIncomingCallArgs.callUUID) {
      if (Platform.OS == "ios") {
        NotificationHandler.callerId = DidDisplayIncomingCallArgs.callUUID;
      }
    }
    if (DidDisplayIncomingCallArgs.error) {
      console.log({
        message: `Callkeep didDisplayIncomingCall error: ${DidDisplayIncomingCallArgs.error}`,
      });
    }

    NotificationHandler.isRinging = true;
  };
  static onAnswerCall = ({ callUUID }: any) => {
    NotificationHandler.isRinging = false;
    var sessionID = NotificationHandler.msg?.sessionId;
    CometChat.acceptCall(sessionID).then(
      (call) => {
        NotificationHandler.isAnswered = true;
        if (Platform.OS === "android") {
          RNCallKeep.endAllCalls();
        }
        navigate({
          index: 0,
          routes: [
            { name: SCREENS_CONSTANTS.CALL, params: { call, needReset: true } },
          ],
        });
      },
      (error) => {
        console.log("Call acceptance failed with error", error);
      }
    );
    RNCallKeep.backToForeground();
  };

  static removeCallDialerWithUUID = (callerId: string) => {
    if (callerId || NotificationHandler.callerId)
      RNCallKeep.reportEndCallWithUUID(
        callerId
          ? callerId
          : typeof NotificationHandler.callerId === "string"
          ? NotificationHandler.callerId
          : NotificationHandler.callerId?.callUUID,
        6
      );
  };
  static removeCallDialer = () => {
    RNCallKeep.endAllCalls();
  };

  static endCall = async (callerId?: any) => {
    if (
      NotificationHandler.msg &&
      NotificationHandler.msg?.category === "call"
    ) {
      _BackgroundTimer.start();
      let sessionID = NotificationHandler.msg?.sessionId;
      if (NotificationHandler.isAnswered === true) {
        NotificationHandler.isAnswered = false;
        CometChatCalls.endSession();
        CometChat.endCall(sessionID);
      } else {
        let status = CometChat.CALL_STATUS.REJECTED;
        await CometChat.rejectCall(sessionID, status).catch((err) => {
          console.log(err);
        });
      }
      _BackgroundTimer.stop();
    }

    if (callerId) {
      RNCallKeep.endCall(
        typeof callerId === "string" ? callerId : callerId?.callUUID
      );
    } else if (NotificationHandler.callerId) {
      RNCallKeep.endCall(
        typeof NotificationHandler.callerId === "string"
          ? NotificationHandler.callerId
          : NotificationHandler.callerId?.callUUID
      );
    }
    RNCallKeep.endAllCalls();
  };

  static setupEventListeners() {
    if (Platform.OS == "ios") {
      notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
          let msg: any = detail.notification?.data?.message;
          if (msg) {
            let dataObj = {
              conversationId: msg.conversationId,
              senderUid: msg.sender,
              receiverType: msg.receiverType,
              guid: msg.receiver,
            };
            navigate({
              index: 0,
              routes: [
                {
                  name: SCREENS_CONSTANTS.CONVERSATIONS_WITH_MESSAGES,
                  params: dataObj,
                },
              ],
            });
          }
        }
      });

      VoipPushNotification.addEventListener(
        "notification",
        (notification: any) => {
          let msg: any = CometChat.CometChatHelper.processMessage(
            notification.message
          );
          NotificationHandler.msg = msg;
          if (
            NotificationHandler.callerId &&
            (msg?.data?.action === "cancelled" ||
              msg?.data?.action === "unanswered")
          ) {
            RNCallKeep.reportEndCallWithUUID(NotificationHandler.callerId, 6);
          }
        }
      );
    } else {
      notifee.onBackgroundEvent(async ({ type, detail }) => {
        const { notification } = detail;
        if (type === EventType.PRESS) {
          await notifee.cancelNotification(notification?.id as string);
          RNCallKeep.backToForeground();
          navigate({
            index: 0,
            routes: [
              {
                name: SCREENS_CONSTANTS.CONVERSATIONS_WITH_MESSAGES,
                params: detail.notification?.data,
              },
            ],
          });
        }
      });
    }

    RNCallKeep.addEventListener("endCall", NotificationHandler.endCall);
    RNCallKeep.addEventListener("answerCall", NotificationHandler.onAnswerCall);
    RNCallKeep.addEventListener(
      "didDisplayIncomingCall",
      NotificationHandler.didDisplayIncomingCall
    );
  }
}
