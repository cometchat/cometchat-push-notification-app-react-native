/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {CometChat} from '@cometchat-pro/react-native-chat';
import messaging from '@react-native-firebase/messaging';
import {name as appName} from './app.json';
import CallKeepHelper from './Utils/CallHelper';
import uuid from 'react-native-uuid';
import RNCallKeep from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

const options = {
  ios: {
    appName: 'My app name',
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'ok',
    imageName: 'phone_account_icon',

    // Required to get audio in background when using Android 11
    foregroundService: {
      channelId: 'com.company.my',
      channelName: 'Foreground service for my app',
      notificationTitle: 'My app is running on background',
      notificationIcon: 'Path to the resource icon of the notification',
    },
  },
};

RNCallKeep.setup(options);
RNCallKeep.setAvailable(true);
let callKeep = new CallKeepHelper();
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!');
  RNCallKeep.setup(options);
  RNCallKeep.setAvailable(true);

  try {
    let msg = CometChat.CometChatHelper.processMessage(
      JSON.parse(remoteMessage.data.message),
    );

    if (msg.category == 'call') {
      if (msg.action == 'initiated') {
        CallKeepHelper.msg = msg;

        CallKeepHelper.displayCallAndroid();
      } else {
        RNCallKeep.endCall(msg.conversationId);
      }
    }
  } catch (e) {
    console.log(e);
  }
});
AppRegistry.registerComponent(appName, () => HeadlessCheck);
