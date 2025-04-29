import { Scene } from "./Scene/Scene";
import { Toolbar } from "./Toolbar/Toolbar";
import {
  SceneContextProvider,
  SceneDragAndDropContextProvider,
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
        <SceneDragAndDropContextProvider>
          <ConversationContextProvider>
            <Scene />
            <LeftPanel />
            <Toolbar />
            <RightPanel />
            <SceneSelection />
          </ConversationContextProvider>
        </SceneDragAndDropContextProvider>
      </SceneHoverContextProvider>
    </SceneContextProvider>
  );
};
