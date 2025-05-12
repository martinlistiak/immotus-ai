import { getConversations } from "app/api/conversation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useSceneContext } from "app/pages/EditorPage/Scene/Scene.context";
export type Conversation = {
  id: string;
  name: string;
  messages: Message[];
};

type Message = {
  text: string;
  type: "user" | "assistant" | "tool";
  toolName?: string;
};

// export type Message = {
//   id: string;
//   content: string;
//   role: "user" | "assistant";
// };

export const ConversationContext = createContext({
  conversation: null as Conversation | null,
  setConversation: (_conversation: Conversation | null) => {},
  conversations: [] as Conversation[],
  isSupported: false as boolean,
  isRecording: false as boolean,
  isProcessing: false as boolean,
  messages: [] as Message[],
  expandedToolPayloadIndex: null as number | null,
  setExpandedToolPayloadIndex: ((_index: number | null) => {}) as Dispatch<
    SetStateAction<number | null>
  >,
  toggleRecording: () => {},
  submitMessage: (_text: string) => {},
});

export const ConversationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedObjects, scene } = useSceneContext();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
    // Check if MediaRecorder is supported
    if ("MediaRecorder" in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    getConversations()
      .then((conversations) => {
        setConversations(conversations);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (selectedObjects.length >= 1) {
      setConversation(null);
    }
  }, [selectedObjects]);

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

  const processMessage = async (text: string, language: string = "en") => {
    setIsProcessing(true);

    // Reset audio queue
    audioQueue.current = [];
    isPlayingRef.current = false;

    // Add user message to history
    setMessages((prev) => [...prev, { text, type: "user" }]);

    // Close any existing SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    let currentAssistantMessage = "";

    // Create a new EventSource connection
    const eventSource = new EventSource(
      `${
        import.meta.env.VITE_API_URL
      }/stream-response?prompt=${encodeURIComponent(
        text
      )}&language=${language}&conversationName=${"default"}&sceneId=${
        scene?.id
      }`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "tool_use") {
        if (data.content.type === "SET_SCENE") {
          dispatchScene({
            type: "SET_SCENE",
            payload: {
              scene: data.content.scene,
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
        } else if (data.content.type === "GET_SCENE") {
          dispatchScene({
            type: "SET_SCENE",
            payload: {
              scene: data.content.scene,
            },
          });
        }
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
  };

  const submitMessage = async (text: string) => {
    await processMessage(text);
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
              `${import.meta.env.VITE_API_URL}/speech-to-text`,
              {
                method: "POST",
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}`);
            }

            const { text, language } = await response.json();
            await processMessage(text, language);

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
    <ConversationContext.Provider
      value={{
        conversation,
        setConversation,
        conversations,
        isSupported,
        isRecording,
        isProcessing,
        messages,
        expandedToolPayloadIndex,
        setExpandedToolPayloadIndex,
        toggleRecording,
        submitMessage,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversationContext = () => {
  return useContext(ConversationContext);
};
