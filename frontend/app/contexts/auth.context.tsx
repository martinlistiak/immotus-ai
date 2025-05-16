import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, postLogin } from "app/api/auth";
import { LoginPage } from "app/components/LoginPage";
import { createContext, useContext } from "react";
import type { User } from "app/types/auth";
export const AuthContext = createContext({
  user: null as User | null,
  login: (user: any) => {},
  logout: () => {},
});

export const AUTH_COOKIE_KEY = "auth_token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const {
    data: userResponse,
    isPending: isLoadingUser,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: false,
  });

  const { mutateAsync: login, isPending: isLoadingLogin } = useMutation({
    mutationFn: postLogin,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
      refetch();
    },
  });

  const logout = () => {
    // setUser(null);
    // todo
  };

  if (isLoadingUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!userResponse) {
    return <LoginPage isLoadingLogin={isLoadingLogin} login={login} />;
  }

  return (
    <AuthContext.Provider value={{ user: userResponse, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
