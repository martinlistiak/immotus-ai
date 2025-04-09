import { getConversations } from "app/api/conversation";
import { createContext, useContext, useEffect, useState } from "react";
import { useSceneContext } from "app/pages/EditorPage/Scene/Scene.context";
export type Conversation = {
  id: string;
  name: string;
  messages: Message[];
};

export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

export const ConversationContext = createContext({
  conversation: null as Conversation | null,
  setConversation: (_conversation: Conversation | null) => {},
  conversations: [] as Conversation[],
});

export const ConversationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedObjects } = useSceneContext();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    getConversations()
      .then((conversations) => {
        setConversations(conversations);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (selectedObjects.length >= 1) {
      setConversation(null);
    }
  }, [selectedObjects]);
  return (
    <ConversationContext.Provider
      value={{ conversation, setConversation, conversations }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversationContext = () => {
  return useContext(ConversationContext);
};
