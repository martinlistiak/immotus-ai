import type { User } from "app/types/auth";
import { axiosInstance } from "./client";

export const postLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ user: User }> => {
  return axiosInstance.post("/user/login", {
    email,
    password,
  });
};

export const getUser = async (): Promise<User> => {
  const response = await axiosInstance.get("/user");
  return response.data;
};
