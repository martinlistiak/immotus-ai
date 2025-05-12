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
import { AuthProvider } from "app/contexts/auth.context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const EditorPage = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
      </AuthProvider>
    </QueryClientProvider>
  );
};
