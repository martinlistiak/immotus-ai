import { Card } from "app/components/Card";
import { AttributeInspector } from "../AttributeInspector/AttributeInspector";
import { useConversationContext } from "app/contexts/conversation.context";
import { Conversation } from "../Conversation/Conversation";

export const RightPanel = () => {
  const { conversation } = useConversationContext();
  return (
    <Card className="fixed top-4 right-4 w-[230px] h-[calc(100vh-96px)]">
      {conversation && <Conversation />}
      <AttributeInspector />
    </Card>
  );
};
