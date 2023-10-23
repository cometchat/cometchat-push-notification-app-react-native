import { View } from "react-native";
import React, { useRef } from "react";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { CometChatCalls } from "@cometchat/calls-sdk-react-native";
import { navigate } from "../../StackNavigator";
import { SCREENS_CONSTANTS } from "../../CONSTS";
import { CometChatOngoingCall } from "@cometchat/chat-uikit-react-native";
import { NotificationHandler } from "../../../utils/notificationHandler";
const CallScreen = ({ navigation, route }: any) => {
  const { call } = route.params;
  let sessionID: string = call.sessionId;
  const callListener = useRef<any>(null);
  const callSettings = useRef<any>(null);

  callListener.current = new CometChatCalls.OngoingCallListener({
    onCallEnded: () => {
      //@ts-ignore
      CometChat.clearActiveCall();
      CometChatCalls.endSession();
      navigate({
        index: 0,
        routes: [
          {
            name: SCREENS_CONSTANTS.CONVERSATIONS_WITH_MESSAGES,
            params: { needReset: true },
          },
        ],
      });
      NotificationHandler?.removeCallDialer();
    },
    onCallEndButtonPressed: () => {
      CometChat.endCall((call as CometChat.Call).getSessionId());
      NotificationHandler?.removeCallDialer();
      navigate({
        index: 0,
        routes: [
          {
            name: SCREENS_CONSTANTS.CONVERSATIONS_WITH_MESSAGES,
            params: { needReset: true },
          },
        ],
      });
    },
  });

  callSettings.current = new CometChatCalls.CallSettingsBuilder()
    .enableDefaultLayout(true)
    .setCallEventListener(callListener.current)
    .setIsAudioOnlyCall(call["type"] == "audio");

  return (
    <View style={{ height: "100%", width: "100%", position: "relative" }}>
      <CometChatOngoingCall
        sessionID={sessionID}
        callSettingsBuilder={callSettings.current}
      />
    </View>
  );
};

export default CallScreen;
