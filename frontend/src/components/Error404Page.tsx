import React, { useState, useEffect } from "react";
import { AlertTriangle, Loader } from "lucide-react";

interface Error404PageProps {
  customMessage?: string;
  onHomeClick?: () => void;
  onBackClick?: () => void;
  loadingDuration?: number; // Time in milliseconds for the loading state
}

const Error404Page: React.FC<Error404PageProps> = ({
  customMessage = "Don't directly come this page Go back and put link and come",
  onHomeClick = () => (window.location.href = "/"),
  onBackClick = () => window.history.back(),
  loadingDuration = 1000, // Default 1.5 seconds of loading
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadingDuration);

    return () => clearTimeout(timer);
  }, [loadingDuration]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader size={48} className="text-purple-500 animate-spin" />
        <p className="mt-4 text-gray-600">Checking page status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <AlertTriangle size={64} className="text-amber-500" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">{customMessage}</p>
        <div className="space-y-4">
          <button
            onClick={onBackClick}
            className="px-4 py-2 cursor-pointer bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors mx-2"
          >
            Go Back
          </button>
          <button
            onClick={onHomeClick}
            className="px-4 py-2 cursor-pointer bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mx-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error404Page;
