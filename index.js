/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import messaging from '@react-native-firebase/messaging';
import {TokenRegisterHandler} from './utils/tokenRegisterHandler';
import {NotificationHandler} from './utils/notificationHandler';
import {navigationRef} from './src/StackNavigator';
import {AndroidStyle} from '@notifee/react-native';
import { SCREENS_CONSTANTS } from './src/CONSTS';

new TokenRegisterHandler();
new NotificationHandler();

messaging().onMessage(async message => {
  console.log('Message handled in the forground!', message);
  handleMessages(message);
});
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!');
  handleMessages(remoteMessage, true);
});
handleMessages = (firebaseMessage, inbackground = false) => {
  try {
    let msg = CometChat.CometChatHelper.processMessage(
      JSON.parse(firebaseMessage?.data?.message),
    );

    if (msg.category == 'message' && inbackground) {
      switch (msg.type) {
        case 'text':
          NotificationHandler.displayNotification({
            id: msg.muid,
            title: msg.sender.name,
            body: msg.text,
            data: {
              conversationId: msg.conversationId,
              senderUid: msg.sender.uid,
              receiverType: msg.receiverType,
              guid: msg.receiverId,
            },
            android: {largeIcon: msg.sender.avatar},
          });
          CometChat.markAsDelivered(msg);
          break;
        case 'image':
          NotificationHandler.displayNotification({
            id: msg.muid,
            title: msg.sender.name,
            body: 'Sent an image',
            data: {
              conversationId: msg.conversationId,
              senderUid: msg.sender.uid,
              receiverType: msg.receiverType,
              guid: msg.receiverId,
            },
            android: {
              style: {
                type: AndroidStyle.BIGPICTURE,
                picture: msg?.data?.attachments
                  ? msg.data.attachments[0]['url']
                  : '',
              },

              largeIcon: msg.sender.avatar,
            },
          });
          CometChat.markAsDelivered(msg);
          break;
        case 'video':
          NotificationHandler.displayNotification({
            id: msg.muid,
            title: msg.sender.name,
            body: 'Sent a video',
            data: {
              conversationId: msg.conversationId,
              senderUid: msg.sender.uid,
              receiverType: msg.receiverType,
              guid: msg.receiverId,
            },
            android: {
              style: {
                type: AndroidStyle.BIGPICTURE,
                picture: msg?.data?.attachments
                  ? msg.data.attachments[0]['url']
                  : '',
              },

              largeIcon: msg.sender.avatar,
            },
          });
          CometChat.markAsDelivered(msg);
          break;
        case 'file':
          NotificationHandler.displayNotification({
            id: msg.muid,
            title: msg.sender.name,
            body: 'Sent a file',
            data: {
              conversationId: msg.conversationId,
              senderUid: msg.sender.uid,
              receiverType: msg.receiverType,
              guid: msg.receiverId,
            },
            android: {
              largeIcon: msg.sender.avatar,
            },
          });
          CometChat.markAsDelivered(msg);
          break;
        case 'audio':
          NotificationHandler.displayNotification({
            id: msg.muid,
            title: msg.sender.name,
            body: 'Sent an audio file',
            data: {
              conversationId: msg.conversationId,
              senderUid: msg.sender.uid,
              receiverType: msg.receiverType,
              guid: msg.receiverId,
            },
            android: {
              largeIcon: msg.sender.avatar,
            },
          });
          CometChat.markAsDelivered(msg);
          break;
        case 'media':
          NotificationHandler.displayNotification({
            id: msg.muid,
            title: msg.sender.name,
            body: 'Sent a file',
            data: {
              conversationId: msg.conversationId,
              senderUid: msg.sender.uid,
              receiverType: msg.receiverType,
              guid: msg.receiverId,
            },
            android: {
              largeIcon: msg.sender.avatar,
            },
          });
          CometChat.markAsDelivered(msg);
          break;

        default:
          break;
      }
    }
    if (msg.category == 'call') {
      switch (msg.action) {
        case 'initiated':
          NotificationHandler.msg = msg;
          NotificationHandler.displayCallAndroid();
          break;
        case 'ended':
          CometChat.clearActiveCall();
          NotificationHandler.endCall(NotificationHandler.callerId);
          break;
        case 'unanswered':
          CometChat.clearActiveCall();
          NotificationHandler.removeCallDialerWithUUID(
            NotificationHandler.callerId,
          );
          break;
        case 'busy':
          CometChat.clearActiveCall();
          NotificationHandler.removeCallDialerWithUUID(
            NotificationHandler.callerId,
          );
          break;
        case 'ongoing':
          NotificationHandler.displayNotification({
            title: msg?.callReceiver?.name || '',
            body: 'ongoing call',
          });
          navigate({
            index: 0,
            routes: [
              {
                name: SCREENS_CONSTANTS.CALL,
                params: {call: msg, needReset: true},
              },
            ],
          });
          break;
        case 'rejected':
          CometChat.clearActiveCall();
          NotificationHandler.removeCallDialerWithUUID(
            NotificationHandler.callerId,
          );
          break;
        case 'cancelled':
          CometChat.clearActiveCall();
          NotificationHandler.removeCallDialerWithUUID(
            NotificationHandler.callerId,
          );
          break;
        default:
          break;
      }
      return;
    }
  } catch (e) {
    console.log(e);
  }
};
AppRegistry.registerComponent(appName, () => App);
