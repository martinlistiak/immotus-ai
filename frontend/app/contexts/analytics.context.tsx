import {
  createContext,
  type FunctionComponent,
  useContext,
  useEffect,
} from "react";
import Countly from "countly-sdk-web";

interface AnalyticsContextType {
  trackEvent: (key: string, data?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: any;
}

export const AnalyticsProvider: FunctionComponent<AnalyticsProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    // Initialize Countly
    if (import.meta.env.PROD) {
      Countly.init({
        app_key: "6c69b49945bc8f3f6521ac7748ba840be650fb3c",
        url: "https://countly.lab.foxapps.tech",
        use_session_cookie: false,
        debug: false,
      });
    }

    Countly.q.push(["track_sessions"]);

    // Start tracking session
    Countly.q.push(["start"]);

    return () => {
      // End session when component unmounts
      Countly.q.push(["end_session"]);
    };
  }, []);

  const trackEvent = (key: string, data?: Record<string, any>): void => {
    Countly.q.push([
      "add_event",
      {
        key,
        segmentation: data,
      },
    ]);
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within a AnalyticsProvider");
  }
  return context;
};

export const trackPageView = (path: string): void => {
  Countly.q.push(["track_pageview", path]);
};
