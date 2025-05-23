import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import Countly from "countly-sdk-web";
import { useAnalytics } from "app/contexts/analytics.context";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// The wrapper component to access the analytics context
export const ErrorBoundaryWithAnalytics = ({
  children,
  fallback,
}: ErrorBoundaryProps) => {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
};

// The actual error boundary implementation as a class component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to Countly
    const extra_info = {
      componentStack: errorInfo.componentStack,
      ...(error.stack ? { stack: error.stack } : {}),
    };

    Countly.q.push(["log_error", error, extra_info]);

    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 w-screen h-screen bg-black">
            <h2 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-white mb-4">
              The application encountered an error. Please try refreshing the
              page.
            </p>
            <button
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 cursor-pointer text-white rounded transition-colors"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 w-full">
                <p className="font-mono text-sm text-red-500">
                  {this.state.error.message}
                </p>
                <pre className="mt-2 p-4 bg-gray-800 text-gray-200 rounded overflow-x-auto text-xs">
                  {this.state.error.stack}
                </pre>
              </div>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}
