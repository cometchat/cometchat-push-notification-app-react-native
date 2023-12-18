import React, {useLayoutEffect, useRef, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import {CometChatContextProvider} from '@cometchat/chat-uikit-react-native';
import {CometChatTheme} from '@cometchat/chat-uikit-react-native';
import StackNavigator from './src/StackNavigator';
import {UserContextProvider} from './UserContext';
import {CometChatIncomingCall} from '@cometchat/chat-uikit-react-native';
import {CometChatUIEventHandler} from '@cometchat/chat-uikit-react-native';
var listnerID = 'UNIQUE_LISTENER_ID';

const App = () => {
  const getPermissions = () => {
    if (Platform.OS == 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };

  const [callRecevied, setCallReceived] = useState(false);
  const incomingCall = useRef(null);

  useLayoutEffect(() => {
    getPermissions();
    CometChat.setDemoMetaInfo({
      name: "React Native Push Notification Sample App",
      type: "push-notification-react-native",
      version: "1.0",
      platform: "react-native",
    });

    // CometChat.addCallListener(
    //   listnerID,
    //   new CometChat.CallListener({
    //     onIncomingCallReceived: (call: any) => {
    //       incomingCall.current = call;
    //       setCallReceived(true);
    //     },
    //     onOutgoingCallRejected: (call: any) => {
    //       incomingCall.current = null;
    //       setCallReceived(false);
    //     },
    //     onIncomingCallCancelled: (call: any) => {
    //       incomingCall.current = null;
    //       setCallReceived(false);
    //     },
    //   }),
    // );

    CometChatUIEventHandler.addCallListener(listnerID, {
      ccCallEnded: () => {
        incomingCall.current = null;
        setCallReceived(false);
      },
    });

    return () => {
      CometChatUIEventHandler.removeCallListener(listnerID);
      CometChat.removeCallListener(listnerID);
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      {/* {callRecevied && (
        <CometChatIncomingCall
          //@ts-ignore
          call={incomingCall.current}
          onDecline={call => {
            setCallReceived(false);
          }}
          incomingCallStyle={{
            backgroundColor: 'white',
            titleColor: 'black',
            subtitleColor: 'gray',
            titleFont: {
              fontSize: 20,
              fontWeight: 'bold',
            },
          }}
        />
      )} */}
      <UserContextProvider>
        <CometChatContextProvider theme={new CometChatTheme({})}>
          <StackNavigator />
        </CometChatContextProvider>
      </UserContextProvider>
    </SafeAreaView>
  );
};

export default App;
