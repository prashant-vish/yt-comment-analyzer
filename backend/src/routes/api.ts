import express from "express";
import { Request, Response } from "express";
import { fetchComments } from "../services/ytService";
import { analyzeAllComments } from "../services/geminiService";
import { generateInsights } from "../services/insightService";
import Comment from "../models/comment";
import Analysis from "../models/analysis";
const router = express.Router();

router.post("/analyze", async (req: Request, res: Response): Promise<any> => {
  try {
    const { url } = req.body;
    const videoId = url.split("v=")[1]; // Extract video ID from URL

    // Check if we already have an analysis for this video
    const existingAnalysis = await Analysis.findOne({ videoId });
    if (existingAnalysis) {
      return res.json({
        message: "Analysis already exists",
        analysis: existingAnalysis,
      });
    }

    // 1. Fetching comments from the video
    let commentsData = await fetchComments(videoId);

    if (commentsData.length === 0) {
      return res.status(200).send({
        message: "No comments found for this video",
      });
    }

    // const commentTexts = commentsData.map((comment) => comment.text);

    // 2. Analyzing the comments
    let analyzedComment = await analyzeAllComments(commentsData);

    // 3. Generate insights
    const analysis = generateInsights(videoId, analyzedComment);

    // 4. Store everything in MongoDB
    // Save each analyzed comment
    // await Comment.insertMany(
    //   analyzedComment.map((comment) => ({
    //     commentId: comment.id,
    //     videoId,
    //     text: comment.text,
    //     authorDisplayName: comment.authorDisplayName,
    //     publishedAt: comment.publishedAt,
    //     likeCount: comment.likeCount,
    //     sentiment: comment.sentiment,
    //     score: comment.score,
    //     isReply: comment.isReply || false,
    //     parentId: comment.parentId || null,
    //   }))
    // );
    // Save the analysis
    const savedAnalysis = await Analysis.create({
      videoId,
      commentCount: analysis.commentCount,
      sentimentBreakdown: analysis.sentimentBreakdown,
      keywords: analysis.keywords,
      monthlyDistribution: analysis.monthlyDistribution,
      createdAt: new Date(),
    });

    res.send({
      message: "Video ID extracted successfully",
      analysis: savedAnalysis,
    });
  } catch (error: any) {
    console.error("Error in analysis:", error);
    res.status(500).json({
      error: "An error occurred during analysis",
      message: error.message,
    });
  }
});

export default router;
