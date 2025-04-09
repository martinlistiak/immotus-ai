import { Card } from "app/components/Card";
import { AttributeInspector } from "../AttributeInspector/AttributeInspector";
import { useConversationContext } from "app/contexts/conversation.context";
import { Conversation } from "../Conversation/Conversation";
import { LuAudioLines } from "react-icons/lu";
import { useEffect, useState } from "react";
import cn from "classnames";
export const RightPanel = () => {
  const {
    conversation,
    isSupported,
    toggleRecording,
    isRecording,
    isProcessing,
    messages,
    submitMessage,
  } = useConversationContext();
  const [message, setMessage] = useState("");

  // Don't render the button if recording is not supported
  if (!isSupported) return null;

  return (
    <Card className="fixed top-4 right-4 w-[250px] h-[calc(100vh-32px)]">
      <Conversation />
      {messages.length <= 0 && <AttributeInspector />}
      <div className="m-2 mt-4 absolute bottom-0 left-0 right-0 p-2 bg-gray-800 rounded-lg text-[10px]">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full mb-1 p-1 placeholder:text-gray-400 text-gray-300 border border-gray-700 rounded-md focus:outline-none focus:border-gray-500 resize-none"
          rows={2}
          placeholder="Type a message..."
        />
        <div className="flex gap-2 justify-end">
          <button
            disabled={isProcessing}
            onMouseDownCapture={toggleRecording}
            onTouchStart={toggleRecording}
            onMouseUpCapture={toggleRecording}
            onTouchEnd={toggleRecording}
            className={cn({
              "flex-1 bg-active text-white py-[3px] px-[6px] rounded-sm flex gap-2 items-center justify-center cursor-pointer hover:bg-active-hover transition-all":
                true,
              "bg-red-500": isRecording,
              "bg-gray-700 animate-pulse !cursor-default hover:bg-gray-700":
                isProcessing,
            })}
          >
            <LuAudioLines />
            <span>Speak your wish</span>
          </button>
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
