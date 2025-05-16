import { Card } from "app/components/Card";
import cn from "classnames";
import { useConversationContext } from "app/contexts/conversation.context";
import { useEffect, useRef } from "react";

export const Conversation = () => {
  const { messages, expandedToolPayloadIndex, setExpandedToolPayloadIndex } =
    useConversationContext();
  const messagesRef = useRef(messages || []);
  const messagesElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current.length !== messages.length) {
      messagesRef.current = messages;
      if (messagesElementRef.current) {
        messagesElementRef.current.scrollTo({
          top: messagesElementRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  return (
    <div>
      <div
        ref={messagesElementRef}
        className="space-y-2 max-h-[calc(100vh-181px)] pb-2 overflow-y-auto"
      >
        {!messages.length && (
          <div className="text-gray-400 text-center text-xs mt-2">
            No messages yet
          </div>
        )}
        {messages.length !== 0 && (
          <div className="flex flex-col gap-2">
            {messages.map((message, index) => (
              <Card
                key={index}
                className={cn({
                  "rounded-lg shadow-lg p-3 break-words text-[12px] leading-[1.125] w-[90%] [user-select:text]":
                    true,
                  "ml-auto bg-active-hover max-w-[90%] text-white":
                    message.type === "user",
                  "mr-auto bg-gray-700 max-w-[90%] text-white":
                    message.type === "assistant" || message.type === "tool",
                })}
              >
                {message.type !== "tool" && message.text}
                {message.type === "tool" && (
                  <div className="w-full grid items-center justify-start gap-1">
                    <span className="text-center text-[10px] font-bold p-[6px_12px] border border-gray-400 rounded-md text-gray-400">
                      {message.toolName}
                    </span>
                    <span
                      onClick={() => {
                        setExpandedToolPayloadIndex((prev) =>
                          prev === index ? null : index
                        );
                      }}
                      className="m-0 p-0 text-xs text-gray-400 cursor-pointer hover:text-gray-300"
                    >
                      See the tool payload
                    </span>
                    {expandedToolPayloadIndex === index && (
                      <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words bg-gray-900 rounded-md p-2 w-fit overflow-x-auto">
                        {message.text}
                      </pre>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
