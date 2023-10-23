import React from "react";
import { View, Text } from "react-native";
import { SCREENS_CONSTANTS } from "../../CONSTS";

export const Create = ({ navigator }: any) => {
  return (
    <View
      style={{
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-around",
      }}
    >
      <Text>
        Don't have any users?
        <Text
          onPress={() => navigator.navigate(SCREENS_CONSTANTS.SIGNUP)}
          style={{ color: "rgb(37, 131, 245)" }}
        >
          CREATE NOW
        </Text>
      </Text>
    </View>
  );
};
