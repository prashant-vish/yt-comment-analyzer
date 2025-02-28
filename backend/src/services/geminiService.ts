import * as dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Comment, AnalyzedComment } from "../types";

dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Improved rate limiting with exponential backoff
async function makeRequestWithBackoff(
  requestFn: () => Promise<any>,
  maxRetries = 5,
  initialDelay = 2000
): Promise<any> {
  let retries = 0;

  while (true) {
    try {
      // Wait before making the request
      if (retries > 0) {
        const backoffDelay = initialDelay * Math.pow(2, retries - 1);
        console.log(
          `Retry ${retries}/${maxRetries}, waiting ${backoffDelay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      } else {
        // Initial delay
        await new Promise((resolve) => setTimeout(resolve, initialDelay));
      }

      return await requestFn();
    } catch (error: any) {
      const isRateLimitError =
        error.message?.includes("429") ||
        error.details?.includes("rate limit") ||
        error.details?.includes("quota exceeded");

      if (isRateLimitError && retries < maxRetries) {
        retries++;
        console.log(`Rate limit hit. Attempt ${retries}/${maxRetries}`);
      } else if (retries >= maxRetries) {
        console.error("Max retries exceeded");
        throw error;
      } else {
        // Not a rate limit error
        throw error;
      }
    }
  }
}

// Batch processing with concurrency control
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

    const requestFn = async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    };

    const responseText = await makeRequestWithBackoff(requestFn);

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

// Process comments with controlled concurrency
export async function analyzeAllComments(
  comments: Comment[],
  concurrencyLimit = 3
): Promise<AnalyzedComment[]> {
  const results: AnalyzedComment[] = [];
  const queue = [...comments];

  // Process batches of comments with limited concurrency
  while (queue.length > 0) {
    const batch = queue.splice(0, concurrencyLimit);
    const batchPromises = batch.map((comment) =>
      analyzeCommentSentiment(comment)
    );

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Log progress
      console.log(`Processed ${results.length}/${comments.length} comments`);

      // Add additional delay between batches if needed
      if (queue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error processing batch:", error);
      // On batch failure, reduce concurrency and push comments back to queue
      queue.unshift(...batch);
      concurrencyLimit = Math.max(1, concurrencyLimit - 1);
      console.log(`Reduced concurrency to ${concurrencyLimit}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  return results;
}
