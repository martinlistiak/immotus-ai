import { Scene } from "./Scene/Scene";
import { ObjectInspector } from "./ObjectInspector/ObjectInspector";
import { Toolbar } from "./Toolbar/Toolbar";
import { SceneContextProvider } from "./Scene/Scene.context";
import { FloatingSpeechBubble } from "app/components/FloatingSpeechBubble";
import { AttributeInspector } from "./AttributeInspector/AttributeInspector";
import { RightPanel } from "./RightPanel/RightPanel";
import { ConversationContextProvider } from "app/contexts/conversation.context";

export const EditorPage = () => {
  return (
    <SceneContextProvider>
      <ConversationContextProvider>
        <Scene />
        <ObjectInspector />
        <Toolbar />
        <RightPanel />
        {/* <AttributeInspector /> */}
        {/* <FloatingSpeechBubble /> */}
      </ConversationContextProvider>
    </SceneContextProvider>
  );
};
