import React, {useEffect, useState} from 'react';
import {View, Text, Platform, TouchableOpacity} from 'react-native';
import {Input, Button} from 'react-native-elements';
import {CometChat} from '@cometchat-pro/react-native-chat';
import * as ImagePicker from 'react-native-image-picker';
import {CommonActions} from '@react-navigation/native';
import localStyles from '@home/HomeStyles';
export default function Home({navigation, route}) {
  const [uid, setUid] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('user');
  const userName = route?.params?.name;

  useEffect(() => {
    checkExtension();
  });

  const checkExtension = async () => {
    const setting = await CometChat.getAppSettings();
    const extension = setting.extensions.filter(
      (ext) => ext.id === 'push-notification',
    );

    console.log('extension:', extension);
  };
  const sendMessage = () => {
    if (!uid) {
      alert('Enter UID');
      return false;
    }
    if (!message) {
      alert('Enter message');
      return false;
    }
    var receiverType =
      type == 'user'
        ? CometChat.RECEIVER_TYPE.USER
        : CometChat.RECEIVER_TYPE.GROUP;
    var textMessage = new CometChat.TextMessage(uid, message, receiverType);

    CometChat.sendMessage(textMessage).then(
      (message) => {
        console.log('message', message);
        alert('sent Successfully');
      },
      (error) => {
        console.log('Message sending failed with error:', error);
      },
    );
    setMessage('');
  };

  const initiateCall = (type) => {
    if (!uid) {
      alert('Enter UID');
      return false;
    }
    var call = new CometChat.Call(uid, type, 'user');
    CometChat.initiateCall(call).then((Call) => {
      CometChat.getUser(uid).then((user) => {
        alert('called successfully');
      });
    });
  };

  const imagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 200,
      maxWidth: 200,
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      console.log('rrs', response);
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        // console.log("ImagePicker Response: ", response);
        if (Platform.OS === 'ios' && response.fileName != undefined) {
          var ext = response.fileName.split('.')[1].toLowerCase();
          var type = this.getMimeType(ext);
          var name = response.fileName;
        } else {
          var type = response.type;
          var name = 'Camera_001.jpeg';
        }
        var file = {
          name: Platform.OS === 'android' ? response.fileName : name,
          type: Platform.OS === 'android' ? response.type : type,
          uri:
            Platform.OS === 'android'
              ? response.uri
              : response.uri.replace('file://', ''),
        };
        sendMediaMessage(file);
      }
    });
  };

  const sendMediaMessage = (msg) => {
    let messageType = CometChat.MESSAGE_TYPE.IMAGE;
    var receiverType =
      type == 'user'
        ? CometChat.RECEIVER_TYPE.USER
        : CometChat.RECEIVER_TYPE.GROUP;
    var mediaMessage = new CometChat.MediaMessage(
      uid,
      msg,
      messageType,
      receiverType,
    );
    CometChat.sendMediaMessage(mediaMessage).then(
      (message) => {
        alert('send successfully');
      },
      (error) => {
        alert('something went wrong');
        console.log('Media message sending failed with error', error);
      },
    );
  };

  const sendCustomMessage = () => {
    if (!uid) {
      alert('Enter UID');
      return false;
    }
    if (!message) {
      alert('Enter message');
      return false;
    }
    var receiverType =
      type == 'user'
        ? CometChat.RECEIVER_TYPE.USER
        : CometChat.RECEIVER_TYPE.GROUP;
    var customMessage = new CometChat.CustomMessage(
      uid,
      receiverType,
      'custom',
      {message},
    );

    CometChat.sendCustomMessage(customMessage).then(
      (message) => {
        console.log('message', message);
        alert('sent Successfully');
      },
      (error) => {
        console.log('Message sending failed with error:', error);
      },
    );
    setMessage('');
  };

  const logout = () => {
    CometChat.logout().then(
      () => {
        console.log('Logout completed successfully');
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{name: 'Login'}],
          }),
        );
      },
      //Logout completed successfully
      (error) => {
        //Logout failed with exception
        console.log('Logout failed with exception:', {error});
      },
    );
  };

  return (
    <View style={localStyles.flex1}>
      <View style={localStyles.flex1}>
        <Text style={localStyles.headerText}>Logged in as {userName}</Text>

        <Input
          containerStyle={localStyles.userNameInputContainerStyle}
          inputContainerStyle={localStyles.userNameInputStyles}
          placeholder={type == 'user' ? 'Enter UID here' : 'Enter Guid'}
          value={uid}
          onChangeText={(id) => setUid(id)}
        />

        <View style={localStyles.userTypeContainer}>
          <TouchableOpacity
            onPress={() => {
              setType('user');
            }}
            style={
              type === 'user'
                ? localStyles.selectedType
                : localStyles.unselectedType
            }>
            <Text>To User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setType('group');
            }}
            style={
              type !== 'user'
                ? localStyles.selectedType
                : localStyles.unselectedType
            }>
            <Text>To Group</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 10,
            marginLeft: '5%',
          }}>
          Enter Text Message
        </Text>

        <Input
          containerStyle={localStyles.msgInputContainerStyle}
          inputContainerStyle={localStyles.userNameInputStyles}
          placeholder="message"
          value={message}
          onChangeText={(msg) => setMessage(msg)}
        />
        <View style={localStyles.buttonContainer}>
          <Button
            onPress={() => sendMessage()}
            containerStyle={localStyles.buttonStyle}
            titleStyle={localStyles.buttonTitleStyle}
            title={'Text Message'}
          />
          <Button
            onPress={() => imagePicker()}
            containerStyle={localStyles.buttonStyle}
            titleStyle={localStyles.buttonTitleStyle}
            title={'Media Message'}
          />
        </View>
        <View style={localStyles.buttonContainer}>
          <Button
            onPress={() => initiateCall('audio')}
            containerStyle={localStyles.buttonStyle}
            titleStyle={localStyles.buttonTitleStyle}
            title={'Audio Call'}
          />
          <Button
            onPress={() => initiateCall('video')}
            containerStyle={localStyles.buttonStyle}
            titleStyle={localStyles.buttonTitleStyle}
            title={'Video Call'}
          />
        </View>
        <View style={localStyles.buttonContainer}>
          <Button
            containerStyle={localStyles.buttonStyle}
            titleStyle={localStyles.buttonTitleStyle}
            onPress={() => sendCustomMessage()}
            title={'Custom Message'}
          />
        </View>
      </View>

      <Button
        style={localStyles.logoutBtnStyles}
        titleStyle={localStyles.buttonTitleStyle}
        onPress={() => logout()}
        title={'Logout'}
      />
    </View>
  );
}
