import { createContext, useContext, useState } from "react";
import type { FileType, FolderStructureItem } from "../types/file";
import { useAuthContext } from "./auth.context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "app/api/client";

export const LibraryContext = createContext({
  files: [] as FileType[],
  isUploadingFiles: false,
  setIsUploadingFiles: (isUploadingFiles: boolean) => {},
  isLoadingFiles: false,
  isLoadingStructure: false,
  deleteFile: (fileId: number) => {},
  uploadFiles: (files: FileList) => {},
  folderStructure: [] as FolderStructureItem[],
});

export const LibraryContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuthContext();
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Get user files
  const { data: files, isLoading: isLoadingFiles } = useQuery({
    queryKey: ["files", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await axiosInstance.get<FileType[]>(
        `/file/user/${user.id}`
      );
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Get folder structure
  const { data: folderStructure, isLoading: isLoadingStructure } = useQuery({
    queryKey: ["folder-structure", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await axiosInstance.get<FolderStructureItem[]>(
        `/file/structure/${user.id}`
      );
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Delete file mutation
  const { mutateAsync: deleteFile } = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await axiosInstance.delete(`/file/${fileId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["folder-structure", user?.id],
      });
    },
  });

  const { mutateAsync: downloadFile } = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await axiosInstance.get(`/file/download/${fileId}`);
      return response.data;
    },
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  });

  // Upload files mutation
  const uploadFiles = async (files: FileList) => {
    if (!user?.id || !files.length) return;

    setIsUploadingFiles(true);

    try {
      const formData = new FormData();

      // Append each file to form data
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      // Add additional metadata
      formData.append("userId", String(user.id));

      // Upload files
      await axiosInstance.post("/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh file list
      queryClient.invalidateQueries({ queryKey: ["files", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["folder-structure", user?.id],
      });
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploadingFiles(false);
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        files: files || [],
        isUploadingFiles,
        setIsUploadingFiles,
        isLoadingFiles,
        isLoadingStructure,
        deleteFile,
        uploadFiles,
        downloadFile,
        folderStructure: folderStructure || [],
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibraryContext = () => {
  return useContext(LibraryContext);
};
