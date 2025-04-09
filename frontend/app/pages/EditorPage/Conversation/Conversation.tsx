import { Card } from "app/components/Card";
import cn from "classnames";
import { useConversationContext } from "app/contexts/conversation.context";

export const Conversation = () => {
  const { messages, expandedToolPayloadIndex, setExpandedToolPayloadIndex } =
    useConversationContext();

  return (
    <div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {messages.length !== 0 && (
          <div className="flex flex-col gap-2">
            {messages.map((message, index) => (
              <Card
                key={index}
                className={cn({
                  "rounded-lg shadow-lg p-3 break-words text-[12px] leading-[1.125] w-[90%]":
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
                      <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words bg-gray-900 rounded-md p-2">
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
