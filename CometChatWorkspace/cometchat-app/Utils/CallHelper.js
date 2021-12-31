import {CometChat} from '@cometchat-pro/react-native-chat';
import {Platform} from 'react-native';
import uuid from 'react-native-uuid';
import RNCallKeep, {AnswerCallPayload} from 'react-native-callkeep';
import {navigate} from '../StackNavigator';
import messaging from '@react-native-firebase/messaging';
import VoipPushNotification from 'react-native-voip-push-notification';
import invokeApp from 'react-native-invoke-app';
import KeepAwake from 'react-native-keep-awake';
import {AppState} from 'react-native';
import _BackgroundTimer from 'react-native-background-timer';
export default class CallKeepHelper {
  constructor(msg) {
    if (msg) {
      CallKeepHelper.msg = msg;
    }
    this.setupEventListeners();
    this.registerToken();
    this.checkLoggedInUser();
    this.addLoginListener();
    CallKeepHelper.callEndedBySelf = false;
  }
  static FCMToken = null;
  static voipToken = null;
  static msg = null;
  static callEndedBySelf = null;
  static callerId = '';
  static callerId1 = '';
  static isLoggedIn = false;
  checkLoggedInUser = async () => {
    try {
      let user = await CometChat.getLoggedinUser();
      if (user) {
        if (user) {
          CallKeepHelper.isLoggedIn = true;
        }
      }
    } catch (error) {
      console.log('error checkLoggedInUser', error);
    }
  };

  addLoginListener = () => {
    var listenerID = 'UNIQUE_LISTENER_ID';
    CometChat.addLoginListener(
      listenerID,
      new CometChat.LoginListener({
        loginSuccess: (e) => {
          CallKeepHelper.isLoggedIn = true;
          this.registerTokenToCometChat();
        },
      }),
    );
  };

  registerTokenToCometChat = async () => {
    if (!CallKeepHelper.isLoggedIn) {
      return false;
    }

    try {
      if (Platform.OS == 'android') {
        if (CallKeepHelper.FCMToken) {
          let response = await CometChat.registerTokenForPushNotification(
            CallKeepHelper.FCMToken,
          );
        }
      } else {
        if (CallKeepHelper.FCMToken) {
          let response = await CometChat.registerTokenForPushNotification(
            CallKeepHelper.FCMToken,
            {voip: false},
          );
        }
        if (CallKeepHelper.voipToken) {
          let response = await CometChat.registerTokenForPushNotification(
            CallKeepHelper.voipToken,
            {voip: true},
          );
        }
      }
    } catch (error) {}
  };

  registerToken = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        if (Platform.OS == 'android') {
          let FCM = await messaging().getToken();

          CallKeepHelper.FCMToken = FCM;
          this.registerTokenToCometChat();
        } else {
          VoipPushNotification.registerVoipToken();
          let FCM = await messaging().getAPNSToken();
          CallKeepHelper.FCMToken = FCM;
          this.registerTokenToCometChat();
        }
      }
    } catch (error) {}
  };

  endCall = ({callUUID}) => {
    if (CallKeepHelper.callerId) RNCallKeep.endCall(CallKeepHelper.callerId);
    _BackgroundTimer.start();
    setTimeout(() => {
      this.rejectCall();
    }, 3000);
  };

  rejectCall = async () => {
    if (
      !CallKeepHelper.callEndedBySelf &&
      CallKeepHelper.msg &&
      CallKeepHelper.msg.call?.category !== 'custom'
    ) {
      var sessionID = CallKeepHelper.msg.sessionId;
      var status = CometChat.CALL_STATUS.REJECTED;
      let call = await CometChat.rejectCall(sessionID, status);
      _BackgroundTimer.stop();
    } else {
      _BackgroundTimer.stop();
    }
  };

  static displayCallAndroid = () => {
    this.IsRinging = true;
    CallKeepHelper.callerId = CallKeepHelper.msg.conversationId;
    RNCallKeep.displayIncomingCall(
      CallKeepHelper.msg.conversationId,
      CallKeepHelper.msg.sender.name,
      CallKeepHelper.msg.sender.name,
      'generic',
    );
    setTimeout(() => {
      if (this.IsRinging) {
        this.IsRinging = false;
        // 6 = MissedCall
        // https://github.com/react-native-webrtc/react-native-callkeep#constants
        RNCallKeep.reportEndCallWithUUID(CallKeepHelper.callerId, 6);
      }
    }, 15000);
  };

  answerCall = ({callUUID}) => {
    this.IsRinging = false;
    CallKeepHelper.callEndedBySelf = true;
    setTimeout(
      () =>
        navigate({
          index: 0,
          routes: [{name: 'Conversation', params: {call: CallKeepHelper.msg}}],
        }),
      2000,
    );
    // RNCallKeep.endAllCalls();
    RNCallKeep.backToForeground();
    if (Platform.OS == 'ios') {
      if (AppState.currentState == 'active') {
        RNCallKeep.endAllCalls();
        _BackgroundTimer.stop();
      } else {
        this.addAppStateListener();
      }
    } else {
      RNCallKeep.endAllCalls();
      _BackgroundTimer.stop();
    }
  };

  addAppStateListener = () => {
    AppState.addEventListener('change', (newState) => {
      if (newState == 'active') {
        RNCallKeep.endAllCalls();
        _BackgroundTimer.stop();
      }
    });
  };

  didDisplayIncomingCall = (DidDisplayIncomingCallArgs) => {
    if (DidDisplayIncomingCallArgs.callUUID) {
      if (Platform.OS == 'ios') {
        CallKeepHelper.callerId = DidDisplayIncomingCallArgs.callUUID;
      }
    }
    if (DidDisplayIncomingCallArgs.error) {
      console.log({
        message: `Callkeep didDisplayIncomingCall error: ${DidDisplayIncomingCallArgs.error}`,
      });
    }

    this.IsRinging = true;

    setTimeout(() => {
      if (this.IsRinging) {
        this.IsRinging = false;
        // 6 = MissedCall
        // https://github.com/react-native-webrtc/react-native-callkeep#constants
        RNCallKeep.reportEndCallWithUUID(
          DidDisplayIncomingCallArgs.callUUID,
          6,
        );
      }
    }, 15000);
  };

  setupEventListeners() {
    if (Platform.OS == 'ios') {
      CometChat.addCallListener(
        'this.callListenerId',
        new CometChat.CallListener({
          onIncomingCallCancelled: (call) => {
            RNCallKeep.endAllCalls();
          },
        }),
      );

      RNCallKeep.addEventListener('didLoadWithEvents', (event) => {
        for (let i = 0; i < event.length; i++) {
          if (event[i]?.name == 'RNCallKeepDidDisplayIncomingCall') {
            CallKeepHelper.callerId = event[i]?.data?.callUUID;
          }
        }
      });

      VoipPushNotification.addEventListener('register', async (token) => {
        CallKeepHelper.voipToken = token;
        this.registerTokenToCometChat();
        // let response = await CometChat.registerTokenForPushNotification(token, {
        //   voip: true,
        // });
      });
      VoipPushNotification.addEventListener('notification', (notification) => {
        let msg = CometChat.CometChatHelper.processMessage(
          notification.message,
        );

        CallKeepHelper.msg = msg;
      });

      VoipPushNotification.addEventListener(
        'didLoadWithEvents',
        async (events) => {
          if (!events || !Array.isArray(events) || events.length < 1) {
            return;
          }
          for (let voipPushEvent of events) {
            let {name, data} = voipPushEvent;
            if (
              name ===
              VoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent
            ) {
              CallKeepHelper.voipToken = data;
            } else if (
              name ===
              VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent
            ) {
              let msg = CometChat.CometChatHelper.processMessage(data.message);

              CallKeepHelper.msg = msg;
            }
          }
        },
      );
    }

    RNCallKeep.addEventListener('endCall', this.endCall);

    RNCallKeep.addEventListener('answerCall', this.answerCall);
  }

  removeEventListeners() {
    RNCallKeep.removeEventListener('endCall');
    RNCallKeep.removeEventListener('didDisplayIncomingCall');
    RNCallKeep.removeEventListener('didLoadWithEvents');
    VoipPushNotification.removeEventListener('didLoadWithEvents');
    VoipPushNotification.removeEventListener('register');
    VoipPushNotification.removeEventListener('notification');
  }
}
