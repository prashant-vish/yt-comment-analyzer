import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY as string;
if (!API_KEY) {
  throw new Error("GENERATIVE_API_KEY is missing! Check your .env file.");
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function generateContent(prompt: string) {
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}

console.log(generateContent("Once upon a time"));
