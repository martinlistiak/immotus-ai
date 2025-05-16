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
import { axiosInstance } from "app/api/client";
import type { SceneObjects, SceneType } from "app/types/scene-ast";
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

    const url = `${
      import.meta.env.VITE_API_URL
    }/stream-response?prompt=${encodeURIComponent(
      text
    )}&language=${language}&conversationId=${conversation?.id}&sceneId=${
      scene?.id
    }`;
    const eventSource = new EventSource(url, { withCredentials: true });

    let currentAssistantMessage = "";

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "tool_use") {
        // Handle tool use cases
        if (data.content.type === "SET_SCENE") {
          dispatchScene({
            type: "SET_SCENE",
            payload: {
              scene: {
                ...scene,
                objects: data.content.scene.objects as SceneObjects,
              } as SceneType,
            },
          });
        } else if (data.content.type === "ADD_OBJECTS") {
          dispatchScene({
            type: "ADD_OBJECT",
            payload: {
              object: data.content.object as SceneObjects[0],
            },
          });
        } else if (data.content.type === "REMOVE_OBJECTS") {
          dispatchScene({
            type: "REMOVE_OBJECTS",
            payload: {
              objectIds: data.content.objectIds,
            },
          });
        } else if (data.content.type === "DUPLICATE_OBJECTS") {
          dispatchScene({
            type: "DUPLICATE_OBJECTS",
            payload: {
              objectIds: data.content.objectIds,
            },
          });
        }
        setMessages((prev) => [
          ...prev,
          {
            text: JSON.stringify(data.content, null, 2),
            type: "tool",
            toolName: data.content.type,
          },
        ]);
      } else if (data.type === "text") {
        currentAssistantMessage += data.content;
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
