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
import { LibraryContextProvider } from "app/contexts/library.context";
import { ImportContextProvider } from "app/contexts/import.context";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AnalyticsProvider } from "app/contexts/analytics.context";
import { ErrorBoundaryWithAnalytics } from "app/components/ErrorBoundary";

export const EditorPage = () => {
  const queryClient = new QueryClient();

  return (
    <AnalyticsProvider>
      <ErrorBoundaryWithAnalytics>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <DndProvider backend={HTML5Backend}>
              <SceneContextProvider>
                <LibraryContextProvider>
                  <ImportContextProvider>
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
                  </ImportContextProvider>
                </LibraryContextProvider>
              </SceneContextProvider>
            </DndProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundaryWithAnalytics>
    </AnalyticsProvider>
  );
};
