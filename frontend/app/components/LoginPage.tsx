import { useState } from "react";
import { Spinner } from "./Spinner";
import cn from "classnames";
export const LoginPage = ({
  isLoadingLogin,
  login,
}: {
  isLoadingLogin: boolean;
  login: ({ email, password }: { email: string; password: string }) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center justify-center">
        <div className="text-6xl font-cal-sans text-gray-200 tracking-tight mb-4">
          IM.
        </div>
        <h1 className="text-2xl font-cal-sans text-gray-200 tracking-wide mb-1">
          Welcome to Immotus!
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Login to your account using your email and password.
        </p>
        <input
          className="w-[250px] text-center border-none outline-none bg-[rgba(255,255,255,0.1)] rounded-md px-4 py-2 text-white font-normal text-sm focus:bg-[rgba(255,255,255,0.2)] transition-colors duration-50 hover:bg-[rgba(255,255,255,0.2)] mb-3"
          disabled={isLoadingLogin}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-[250px] text-center border-none outline-none bg-[rgba(255,255,255,0.1)] rounded-md px-4 py-2 text-white font-normal text-sm focus:bg-[rgba(255,255,255,0.2)] transition-colors duration-50 hover:bg-[rgba(255,255,255,0.2)] mb-3"
          disabled={isLoadingLogin}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={isLoadingLogin}
          type="button"
          onClick={() => login({ email, password })}
          className={cn(
            "rounded-md bg-[rgba(255,255,255,0.1)] w-[200px] py-2 text-white border border-gray-700 font-normal text-sm cursor-pointer hover:bg-[rgba(255,255,255,0.2)] transition-colors duration-50",
            {
              "!cursor-default pointer-events-none": isLoadingLogin,
            }
          )}
        >
          {isLoadingLogin ? (
            <div className="flex items-center justify-center">
              <Spinner size={16} />
            </div>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
};
