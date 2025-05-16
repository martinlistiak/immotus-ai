import type { User } from "./auth";

export type FileType = {
  id: number;
  name: string;
  path: string;
  extension: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  userId: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  user: User | null;
};

export type FolderStructureItem = {
  name: string;
  size: number;
  time: number;
  type: string;
};
