import type { SceneObjects, SceneType } from "app/types/scene-ast";
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

export const getScene = async ({
  id,
}: {
  id: number | string;
}): Promise<SceneType> => {
  const response = await axiosInstance.get(`/scene/${id}`);
  return response.data;
};

export const postScene = async ({
  name,
  objects,
}: {
  name: string;
  objects: SceneObjects;
}) => {
  const response = await axiosInstance.post(`/scene`, { name, objects });
  return response.data;
};

export const updateSceneObjects = async ({
  id,
  objects,
}: {
  id: number | string;
  objects: SceneObjects;
}) => {
  const response = await axiosInstance.patch(`/scene/${id}`, { objects });
  return response.data;
};

export const renameScene = async ({
  id,
  newName,
}: {
  id: number | string;
  newName: string;
}) => {
  const response = await axiosInstance.patch(`/scene/${id}/rename`, {
    name: newName,
  });
  return response.data;
};

export const deleteScene = async ({ id }: { id: number | string }) => {
  const response = await axiosInstance.delete(`/scene/${id}`);
  return response.data;
};
