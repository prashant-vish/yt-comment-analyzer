import React from "react";
import Home from "../components/Home.tsx";

export interface HomePageProps {
  setSentimentData: React.Dispatch<React.SetStateAction<any[]>>;
}

const HomePage: React.FC<HomePageProps> = ({ setSentimentData }) => {
  return (
    <>
      <Home setSentimentData={setSentimentData} />
    </>
  );
};

export default HomePage;
