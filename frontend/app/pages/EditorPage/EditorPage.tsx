import { Scene } from "./Scene/Scene";
import { ObjectInspector } from "./ObjectInspector/ObjectInspector";
import { Toolbar } from "./Toolbar/Toolbar";
import { SceneContextProvider } from "./Scene/Scene.context";
import { RightPanel } from "./RightPanel/RightPanel";
import { ConversationContextProvider } from "app/contexts/conversation.context";
import { SceneSelection } from "./SceneSelection/SceneSelection";
export const EditorPage = () => {
  return (
    <SceneContextProvider>
      <ConversationContextProvider>
        <Scene />
        <ObjectInspector />
        <Toolbar />
        <RightPanel />
        <SceneSelection />
      </ConversationContextProvider>
    </SceneContextProvider>
  );
};
