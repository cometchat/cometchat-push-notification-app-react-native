import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Login, SignIn, SignUp } from "./components/login";
import CallScreen from "./components/calls/CallScreen";
import ConversationsWithMessages from "./components/conversation/ConversationsWithMessages";
import { SCREENS_CONSTANTS } from "./CONSTS";
export const navigationRef = React.createRef<any>();

export function navigate(...props: any[]) {
  navigationRef.current?.reset(...props);
}

function StackNavigator(props: any) {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ header: () => null }}
        initialRouteName={SCREENS_CONSTANTS.LOGIN}
      >
        <Stack.Screen name={SCREENS_CONSTANTS.LOGIN} component={Login} />
        <Stack.Screen name={SCREENS_CONSTANTS.SIGNIN} component={SignIn} />
        <Stack.Screen name={SCREENS_CONSTANTS.SIGNUP} component={SignUp} />
        <Stack.Screen name={SCREENS_CONSTANTS.CALL} component={CallScreen} />
        <Stack.Screen
          name={SCREENS_CONSTANTS.CONVERSATIONS_WITH_MESSAGES}
          component={ConversationsWithMessages}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default StackNavigator;
