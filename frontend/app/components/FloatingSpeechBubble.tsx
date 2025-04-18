import { LuAudioLines } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { Card } from "./Card";
import { useState, useEffect, useRef } from "react";
import { useSceneContext } from "app/pages/EditorPage/Scene/Scene.context";
import cn from "classnames";
import { Anthropic } from "@anthropic-ai/sdk";

type Message = {
  text: string;
  type: "user" | "assistant" | "tool";
  toolName?: string;
};

type ConversationType = Anthropic.Messages.MessageParam[];

export const FloatingSpeechBubble = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const audioQueue = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);
  const { dispatchScene } = useSceneContext();
  const [expandedToolPayloadIndex, setExpandedToolPayloadIndex] = useState<
    number | null
  >(null);
  useEffect(() => {
    // Clean up EventSource when component unmounts
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Initialize audio context on user interaction to comply with browser policies
  const initAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  };

  // Function to play audio from base64 string
  const playAudio = async (base64Audio: string): Promise<void> => {
    if (!audioContext.current) return;

    try {
      // Decode base64 audio
      const binaryString = window.atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data and play it
      const audioBuffer = await audioContext.current.decodeAudioData(
        bytes.buffer
      );
      const source = audioContext.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.current.destination);

      // Handle when audio finishes playing
      source.onended = () => {
        playNextAudio();
      };

      source.start(0);
    } catch (e) {
      console.error("Error playing audio:", e);
      // Continue playing the next audio even if this one fails
      playNextAudio();
    }
  };

  // Process the audio queue
  const playNextAudio = () => {
    if (audioQueue.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    const nextAudio = audioQueue.current.shift();
    if (nextAudio) {
      isPlayingRef.current = true;
      playAudio(nextAudio).catch(() => {
        // If there's an error, continue to the next audio
        playNextAudio();
      });
    } else {
      isPlayingRef.current = false;
    }
  };

  // Handle received audio
  const handleAudioReceived = (audio: string) => {
    audioQueue.current.push(audio);

    // If not currently playing, start playing
    if (!isPlayingRef.current) {
      playNextAudio();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorderRef.current?.start();

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsProcessing(true);
          initAudioContext();

          // Combine all chunks into a single blob
          const audioBlob = new Blob(chunksRef.current, {
            type: "audio/webm",
          });

          // Create form data to send to the server
          const formData = new FormData();
          formData.append("audio", audioBlob, "audio.webm");

          try {
            // Send to backend for speech-to-text processing
            const response = await fetch(
              "http://localhost:3001/speech-to-text",
              {
                method: "POST",
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}`);
            }

            const { text, language } = await response.json();

            // Add user message to history
            setMessages((prev) => [...prev, { text, type: "user" }]);

            // Reset audio queue
            audioQueue.current = [];
            isPlayingRef.current = false;

            // Start SSE connection to get streaming response
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
            }

            let currentAssistantMessage = "";

            // Create a new EventSource connection
            const eventSource = new EventSource(
              `http://localhost:3001/stream-response?prompt=${encodeURIComponent(
                text
              )}&language=${language}&conversationName=${"default"}`
            );
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
              const data = JSON.parse(event.data);
              if (data.type === "tool_use") {
                dispatchScene({
                  type: "SET_SCENE",
                  payload: {
                    scene: data.content,
                  },
                });
                // Add tool message to history
                setMessages((prev) => [
                  ...prev,
                  {
                    text: JSON.stringify(data.content, null, 2),
                    type: "tool",
                    toolName: "SET_SCENE",
                  },
                ]);
              } else if (data.type === "text") {
                // Update the current assistant message
                currentAssistantMessage += data.content;
                // Update the messages with the current progress
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage?.type === "assistant") {
                    newMessages[newMessages.length - 1] = {
                      ...lastMessage,
                      text: currentAssistantMessage,
                    };
                  } else {
                    newMessages.push({
                      text: currentAssistantMessage,
                      type: "assistant",
                    });
                  }
                  return newMessages;
                });
              } else if (data.type === "audio") {
                handleAudioReceived(data.content);
              } else if (data.type === "done") {
                eventSource.close();
                setIsProcessing(false);
              } else if (data.type === "error") {
                console.error("Error from server:", data.message);
                eventSource.close();
                setIsProcessing(false);
              }
            };

            eventSource.onerror = (error) => {
              console.error("EventSource error:", error);
              eventSource.close();
              setIsProcessing(false);
            };

            // Clear chunks for next recording
            chunksRef.current = [];
          } catch (error) {
            console.error("Error sending audio:", error);
            setIsProcessing(false);
          }
        };
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err);
        setIsSupported(false);
      });

    if (!isRecording) {
      // Start recording
      chunksRef.current = [];
      setIsRecording(true);
    }
  };

  return (
    <>
      {messages.length > 0 && (
        <div className="fixed bottom-20 right-4 max-w-md w-96 space-y-2">
          <div className="flex justify-end mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700"
              onClick={clearHistory}
            >
              <IoClose />
            </div>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {messages.map((message, index) => (
              <Card
                key={index}
                className={cn({
                  "rounded-lg shadow-lg p-3 break-words": true,
                  "ml-auto bg-active-hover max-w-[80%] text-white":
                    message.type === "user",
                  "mr-auto bg-gray-700 max-w-[80%] text-white":
                    message.type === "assistant" || message.type === "tool",
                })}
              >
                {message.type !== "tool" && message.text}
                {message.type === "tool" && (
                  <div>
                    <span className="text-[10px] font-bold p-[6px_12px] border border-gray-400 rounded-md text-gray-400">
                      {message.toolName}
                    </span>
                    <span
                      onClick={() => {
                        setExpandedToolPayloadIndex((prev) =>
                          prev === index ? null : index
                        );
                      }}
                      className="m-0 p-0 ml-4 text-xs text-gray-400 cursor-pointer hover:text-gray-300"
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
        </div>
      )}

      <Card
        onMouseDownCapture={toggleRecording}
        onTouchStart={toggleRecording}
        onMouseUpCapture={toggleRecording}
        onTouchEnd={toggleRecording}
        className={`fixed bottom-4 right-4 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center cursor-pointer box-shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:*:text-white transition-all ${
          isRecording ? "animate-pulse !bg-blue-500" : ""
        } ${isProcessing ? "!bg-yellow-500" : ""}`}
      >
        <div className="absolute right-18 whitespace-nowrap w-fit h-12  text-gray-500 flex items-center justify-center">
          Hold to talk
        </div>
        <LuAudioLines />
      </Card>
    </>
  );
};
