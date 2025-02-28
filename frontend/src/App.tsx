import "./App.css";
import HomePage from "./pages/HomePage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Error404Page from "./components/Error404Page.tsx";

export type DashboardProps = {
  sentimentData: {
    message: string;
    analysis?: {
      videoId: string;
      commentCount: number;
      sentimentBreakdown: {
        agree: number;
        disagree: number;
        neutral: number;
      };
      keywords: {
        word: string;
        count: number;
      }[];
      monthlyDistribution: {
        month: string;
        count: number;
      }[];
      createdAt: Date;
    };
    error?: string;
  }; // Replace `any[]` with the correct type
};

function App() {
  const [sentimentData, setSentimentData] = useState<any>();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<HomePage setSentimentData={setSentimentData} />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard sentimentData={sentimentData} />}
          />
          <Route path="*" element={<Error404Page />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
