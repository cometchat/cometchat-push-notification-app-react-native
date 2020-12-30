import React, {useEffect} from 'react';
import {View, Text, Image, TouchableOpacity, Platform} from 'react-native';
import {Input, Button} from 'react-native-elements';
import {CometChat} from '@cometchat-pro/react-native-chat';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import {CommonActions} from '@react-navigation/native';
import localStyles from '@login/LoginStyles';
import {appID, authKey, appRegion} from '@resources/Constants';
export default function Login({navigation, routes}) {
  useEffect(() => {
    messaging().onMessage(async (remoteMessage) => {
      console.log('message received', remoteMessage);
      console.log({
        title: remoteMessage.data.title,
        body: remoteMessage.data.alert,
      });
      let isIOS = Platform.OS === 'ios';
      if (isIOS) {
        await notifee.displayNotification({
          title: remoteMessage.data.title,
          body: remoteMessage.data.alert,
          ios: {
            foregroundPresentationOptions: {
              critical: true,
              alert: true,
              badge: true,
              sound: true,
            },
          },
        });
      } else {
        console.log('android');
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
        });
        let result = await notifee.displayNotification({
          title: remoteMessage.data.title,
          body: remoteMessage.data.alert,
          android: {
            channelId,
          },
        });
        console.log(result);
      }
    });
    let cometChatSettings = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(appRegion)
      .build();
    CometChat.init(appID, cometChatSettings).then(
      () => {
        console.log('Initialization completed successfully');
        CometChat.getLoggedinUser().then((user) => {
          if (user) {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [{name: 'Home', params: {name: user.name}}],
              }),
            );
          }
        });
        //You can now call login function.
      },
      (error) => {
        console.log('Initialization failed with error:', error);
        //Check the reason for error and take apppropriate action.
      },
    );
  }, []);
  const registerForFCM = async (id) => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      let FCMToken = await messaging().getToken();
      console.log('token:', FCMToken);
      let response = await CometChat.registerTokenForPushNotification(FCMToken);
      console.log('register fro fcm :', response);
    }
  };

  const login = (uid) => {
    CometChat.login(uid, authKey).then(
      (User) => {
        console.log('Login Successful:', {User});
        registerForFCM(User.uid);

        // User loged in successfully.
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{name: 'Home', params: {name: User.name}}],
          }),
        );
      },
      (error) => {
        console.log('Login failed with exception:', {error});
        // User login failed, check error and take appropriate action.
      },
    );
  };
  return (
    <View style={localStyles.flex1}>
      <View style={localStyles.headerContainer}>
        <Image
          style={localStyles.cometChatLogo}
          source={require('@icons/cometchat_white.png')}
        />
        <Text style={localStyles.cometChatLabel}>CometChat</Text>
        <Text style={localStyles.headerText}>Push Notification Sample App</Text>
      </View>
      <View style={localStyles.loginContainer}>
        <Text style={localStyles.loginHeader}>
          Login with one of our sample users
        </Text>
        <View style={localStyles.userListContainer}>
          <TouchableOpacity
            onPress={() => login('SUPERHERO1')}
            style={localStyles.userContainer}>
            <Image
              style={localStyles.userIcon}
              source={require('@icons/ironman.png')}
            />
            <Text style={localStyles.userNameText}>SUPERHERO1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => login('SUPERHERO2')}
            style={localStyles.userContainer}>
            <Image
              style={localStyles.userIcon}
              source={require('@icons/captainamerica.png')}
            />
            <Text style={localStyles.userNameText}>SUPERHERO2</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => login('SUPERHERO3')}
            style={localStyles.userContainer}>
            <Image
              style={localStyles.userIcon}
              source={require('@icons/spiderman.png')}
            />
            <Text style={localStyles.userNameText}>SUPERHERO3</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => login('SUPERHERO4')}
            style={localStyles.userContainer}>
            <Image
              style={localStyles.userIcon}
              source={require('@icons/wolverine.png')}
            />
            <Text style={localStyles.userNameText}>SUPERHERO4</Text>
          </TouchableOpacity>
        </View>

        <Input
          style={localStyles.inputStyles}
          placeholder={'or else continue login with uid'}
        />
        <Button
          buttonStyle={localStyles.buttonStyle}
          titleStyle={localStyles.buttonTextStyle}
          title={'LOGIN USING UID'}
        />
      </View>
    </View>
  );
}
