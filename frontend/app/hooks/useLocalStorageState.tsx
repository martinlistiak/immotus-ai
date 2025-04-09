import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  if (typeof window === "undefined") {
    return [initialValue, () => {}] as const;
  }

  const [state, setState] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}
