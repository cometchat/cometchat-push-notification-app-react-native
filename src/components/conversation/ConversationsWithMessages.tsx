import React, { useEffect, useState } from "react";
import { CometChatConversationsWithMessages } from "@cometchat/chat-uikit-react-native";
import { CometChat } from "@cometchat/chat-sdk-react-native";

const ConversationsWithMessages = ({ route }: any) => {
  const [user, setUser] = useState<any>();
  const [group, setGroup] = useState<any>();
  const { params } = route;
  useEffect(() => {
    if (params && params.receiverType === "user" && params.senderUid) {
      CometChat.getUser(params.senderUid).then((user) => {
        console.log({ user });
        setUser(user);
      });
    } else if (params && params.receiverType === "group") {
      CometChat.getGroup(params.guid).then((group) => {
        setGroup(group);
      });
    }
  }, []);

  if (user)
    return (
      <CometChatConversationsWithMessages
        user={user}
        messagesConfigurations={{
          messageListConfiguration: {
            messageRequestBuilder: new CometChat.MessagesRequestBuilder()
              .setUID(user.uid)
              .setLimit(20),
          },
        }}
      />
    );
  if (group)
    return (
      <CometChatConversationsWithMessages
        group={group}
        messagesConfigurations={{
          messageListConfiguration: {
            messageRequestBuilder: new CometChat.MessagesRequestBuilder()
              .setGUID(group.guid)
              .setLimit(20),
          },
        }}
      />
    );
  return <CometChatConversationsWithMessages />;
};

export default ConversationsWithMessages;
