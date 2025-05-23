import { Card } from "app/components/Card";
import { AttributeInspector } from "./AttributeInspector/AttributeInspector";
import { useConversationContext } from "app/contexts/conversation.context";
import { Conversation } from "./Conversation/Conversation";
import { LuAudioLines } from "react-icons/lu";
import { use, useEffect, useState } from "react";
import cn from "classnames";
import { useSceneContext } from "../Scene/Scene.context";
import { Tabs } from "app/components/Tabs";
import { Tooltip } from "app/components/Tooltip";
import { SceneProperties } from "./SceneProperties/SceneProperties";

enum RightPanelTab {
  CONVERSATION = "Conversation",
  ATTRIBUTE = "Attributes",
}

export const RightPanel = () => {
  const {
    isSupported,
    toggleRecording,
    isRecording,
    isProcessing,
    messages,
    submitMessage,
  } = useConversationContext();
  const { selectedObjects } = useSceneContext();
  const [activeTab, setActiveTab] = useState<RightPanelTab>(
    RightPanelTab.CONVERSATION
  );

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (messages.length > 0) {
      setActiveTab(RightPanelTab.CONVERSATION);
    } else {
      setActiveTab(RightPanelTab.ATTRIBUTE);
    }
  }, [messages]);

  useEffect(() => {
    if (selectedObjects.length > 0) {
      setActiveTab(RightPanelTab.ATTRIBUTE);
    }
  }, [selectedObjects]);

  // Don't render the button if recording is not supported
  if (!isSupported) return null;

  return (
    <Card className="fixed top-4 right-4 w-[250px] h-[calc(100vh-32px)]">
      {/* Tabs */}
      <Tabs
        tabs={[RightPanelTab.CONVERSATION, RightPanelTab.ATTRIBUTE]}
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as RightPanelTab)}
      />

      <div className="flex flex-col flex-1">
        {activeTab === RightPanelTab.CONVERSATION && <Conversation />}
        {activeTab === RightPanelTab.ATTRIBUTE && <AttributeInspector />}
        {activeTab === RightPanelTab.ATTRIBUTE &&
          selectedObjects.length === 0 && <SceneProperties />}
      </div>
      <div className="m-2 mt-4 absolute bottom-0 left-0 right-0 p-2 bg-gray-800 rounded-lg text-[10px]">
        <textarea
          value={message}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitMessage(message);
              setMessage("");
            } else if (e.key === "Backspace") {
              e.stopPropagation();
            }
          }}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full mb-1 p-1 placeholder:text-gray-400 text-gray-300 border border-gray-700 rounded-md focus:outline-none focus:border-gray-500 resize-none"
          rows={2}
          placeholder="Type a message..."
        />
        <div className="flex gap-2 justify-end">
          <Tooltip
            text="Hold to speak"
            initialPosition="left"
            className="w-full flex-1 flex"
          >
            <button
              disabled={isProcessing}
              onMouseDownCapture={toggleRecording}
              onTouchStart={toggleRecording}
              onMouseUpCapture={toggleRecording}
              onTouchEnd={toggleRecording}
              className={cn({
                "w-full bg-active text-white py-[3px] px-[6px] rounded-sm flex gap-2 items-center justify-center cursor-pointer hover:bg-active-hover transition-all":
                  true,
                "bg-red-500": isRecording,
                "bg-gray-700 animate-pulse !cursor-default hover:bg-gray-700":
                  isProcessing,
              })}
            >
              <LuAudioLines />
              <span>Speak your wish</span>
            </button>
          </Tooltip>
          <button
            disabled={isProcessing}
            onClick={() => {
              submitMessage(message);
              setMessage("");
            }}
            className={cn({
              "bg-active text-white py-[3px] px-[12px] rounded-sm cursor-pointer hover:bg-active-hover transition-all":
                true,
              "bg-gray-700 animate-pulse !cursor-default hover:bg-gray-700":
                isProcessing,
            })}
          >
            Send
          </button>
        </div>
      </div>
    </Card>
  );
};
