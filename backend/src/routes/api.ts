import express from "express";
import { Request, Response } from "express";
import { fetchComments } from "../services/ytService";
import { analyzeAllComments } from "../services/geminiService";
import { generateInsights } from "../services/insightService";
const router = express.Router();

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const videoId = url.split("v=")[1]; // Extract video ID from URL

    // 1. Fetching comments from the video
    let commentsData = await fetchComments(videoId);

    // const commentTexts = commentsData.map((comment) => comment.text);

    // 2. Analyzing the comments
    let analyzedComment = await analyzeAllComments(commentsData);

    // 3. Generate insights
    const analysis = generateInsights(videoId, analyzedComment);

    res.json({
      message: "Video ID extracted successfully",
      commentsData,
      analyzedComment,
      analysis,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
