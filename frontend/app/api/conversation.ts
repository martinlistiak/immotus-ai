import { axiosInstance } from "./client";
import { Anthropic } from "@anthropic-ai/sdk";

type ConversationType = Anthropic.Messages.MessageParam[];

export const getConversations = async () => {
  try {
    const response = await axiosInstance.get("/conversation");
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const postConversation = async ({
  name,
  conversation,
}: {
  name: string;
  conversation: ConversationType;
}) => {
  const response = await axiosInstance.post(`/conversation/${name}`, {
    conversation,
  });
  return response.data;
};

export const getConversation = async ({ name }: { name: string }) => {
  const response = await axiosInstance.get(`/conversation/${name}`);
  return response.data;
};

export const renameConversation = async ({
  name,
  newName,
}: {
  name: string;
  newName: string;
}) => {
  const response = await axiosInstance.patch(`/conversation/${name}/rename`, {
    name: newName,
  });
  return response.data;
};

export const deleteConversation = async ({ name }: { name: string }) => {
  const response = await axiosInstance.delete(`/conversation/${name}`);
  return response.data;
};
