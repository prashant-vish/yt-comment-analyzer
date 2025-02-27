import * as dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Comment, AnalyzedComment } from "../types";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Add a delay function to prevent API rate limits (429 errors)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeCommentSentiment(
  comment: Comment
): Promise<AnalyzedComment> {
  try {
    const prompt = `
    Analyze the sentiment of this YouTube comment regarding whether the commenter agrees with the video content, disagrees with it, or is neutral/unrelated.
    
    Comment: "${comment.text}"
    
    IMPORTANT: Your ENTIRE response must be a valid JSON object with no additional text, markdown formatting, or explanations. The JSON must have exactly this format:
    {"sentiment": "agree|disagree|neutral", "score": 0.X}
  `;

    await delay(2000); // Wait for 2 second before making a request

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    // Clean the response (remove unwanted Markdown formatting)
    const cleanedText = responseText
      .replace(/```json|```/g, "")
      .trim()
      .replace(/^\s*\{/, "{") // Ensure JSON starts properly
      .replace(/\}\s*$/, "}"); // Ensure JSON ends properly

    // Parse the JSON response safely
    const analysis = JSON.parse(cleanedText);

    return {
      ...comment,
      sentiment: analysis.sentiment as "agree" | "disagree" | "neutral",
      score: analysis.score,
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      ...comment,
      sentiment: "neutral",
      score: 0,
    };
  }
}

// Process multiple comments sequentially (prevent API overload)
export async function analyzeAllComments(
  comments: Comment[]
): Promise<AnalyzedComment[]> {
  const analyzedComments: AnalyzedComment[] = [];

  for (const comment of comments) {
    const analyzedComment = await analyzeCommentSentiment(comment);
    analyzedComments.push(analyzedComment);
  }

  return analyzedComments;
}
