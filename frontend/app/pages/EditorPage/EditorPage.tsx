import { Scene } from "./Scene/Scene";
import { Toolbar } from "./Toolbar/Toolbar";
import {
  SceneContextProvider,
  SceneDragAndDropContextProvider,
  SceneHoverContextProvider,
  SceneExportContextProvider,
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
          <SceneExportContextProvider>
            <ConversationContextProvider>
              <Scene />
              <LeftPanel />
              <Toolbar />
              <RightPanel />
              <SceneSelection />
            </ConversationContextProvider>
          </SceneExportContextProvider>
        </SceneDragAndDropContextProvider>
      </SceneHoverContextProvider>
    </SceneContextProvider>
  );
};
