/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  let isIOS = Platform.OS === 'ios';
    if(isIOS){
      await notifee.displayNotification({
        title: remoteMessage.data.title,
        body: remoteMessage.data.alert,
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });
    }else{
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });
      await notifee.displayNotification({
        title: remoteMessage.data.title,
        body: remoteMessage.data.alert,
        android: {
          channelId
        },
      });
    }
});

AppRegistry.registerComponent(appName, () => App);
