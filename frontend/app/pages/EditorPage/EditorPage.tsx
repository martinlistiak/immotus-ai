import { Scene } from "./Scene/Scene";
import { Toolbar } from "./Toolbar/Toolbar";
import {
  SceneContextProvider,
  SceneHoverContextProvider,
} from "./Scene/Scene.context";
import { RightPanel } from "./RightPanel/RightPanel";
import { ConversationContextProvider } from "app/contexts/conversation.context";
import { SceneSelection } from "./SceneSelection/SceneSelection";
import { LeftPanel } from "./LeftPanel/LeftPanel";
export const EditorPage = () => {
  return (
    <SceneContextProvider>
      <SceneHoverContextProvider>
        <ConversationContextProvider>
          <Scene />
          <LeftPanel />
          <Toolbar />
          <RightPanel />
          <SceneSelection />
        </ConversationContextProvider>
      </SceneHoverContextProvider>
    </SceneContextProvider>
  );
};
