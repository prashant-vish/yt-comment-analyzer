"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCommentSentiment = analyzeCommentSentiment;
exports.analyzeAllComments = analyzeAllComments;
const dotenv = __importStar(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
// Improved rate limiting with exponential backoff
async function makeRequestWithBackoff(requestFn, maxRetries = 5, initialDelay = 2000) {
    var _a, _b, _c;
    let retries = 0;
    while (true) {
        try {
            // Wait before making the request
            if (retries > 0) {
                const backoffDelay = initialDelay * Math.pow(2, retries - 1);
                console.log(`Retry ${retries}/${maxRetries}, waiting ${backoffDelay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            }
            else {
                // Initial delay
                await new Promise((resolve) => setTimeout(resolve, initialDelay));
            }
            return await requestFn();
        }
        catch (error) {
            const isRateLimitError = ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes("429")) ||
                ((_b = error.details) === null || _b === void 0 ? void 0 : _b.includes("rate limit")) ||
                ((_c = error.details) === null || _c === void 0 ? void 0 : _c.includes("quota exceeded"));
            if (isRateLimitError && retries < maxRetries) {
                retries++;
                console.log(`Rate limit hit. Attempt ${retries}/${maxRetries}`);
            }
            else if (retries >= maxRetries) {
                console.error("Max retries exceeded");
                throw error;
            }
            else {
                // Not a rate limit error
                throw error;
            }
        }
    }
}
// Batch processing with concurrency control
async function analyzeCommentSentiment(comment) {
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
            sentiment: analysis.sentiment,
            score: analysis.score,
        };
    }
    catch (error) {
        console.error("Error analyzing sentiment:", error);
        return {
            ...comment,
            sentiment: "neutral",
            score: 0,
        };
    }
}
// Process comments with controlled concurrency
async function analyzeAllComments(comments, concurrencyLimit = 3) {
    const results = [];
    const queue = [...comments];
    // Process batches of comments with limited concurrency
    while (queue.length > 0) {
        const batch = queue.splice(0, concurrencyLimit);
        const batchPromises = batch.map((comment) => analyzeCommentSentiment(comment));
        try {
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            // Log progress
            console.log(`Processed ${results.length}/${comments.length} comments`);
            // Add additional delay between batches if needed
            if (queue.length > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        catch (error) {
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
//# sourceMappingURL=geminiService.js.map