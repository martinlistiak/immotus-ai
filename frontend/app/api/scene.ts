import type { SceneType } from "app/types/scene-ast";
import { axiosInstance } from "./client";

export const getScenes = async () => {
  try {
    const response = await axiosInstance.get("/scene");
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const postScene = async ({
  name,
  scene,
}: {
  name: string;
  scene: SceneType;
}) => {
  const response = await axiosInstance.post(`/scene/${name}`, { scene });
  return response.data;
};

export const getScene = async ({ name }: { name: string }) => {
  const response = await axiosInstance.get(`/scene/${name}`);
  return response.data;
};

export const renameScene = async ({
  name,
  newName,
}: {
  name: string;
  newName: string;
}) => {
  const response = await axiosInstance.patch(`/scene/${name}/rename`, {
    name: newName,
  });
  return response.data;
};

export const deleteScene = async ({ name }: { name: string }) => {
  const response = await axiosInstance.delete(`/scene/${name}`);
  return response.data;
};
