import express from "express";
import { Request, Response } from "express";
import { fetchComments } from "../services/ytService";
import { analyzeAllComments } from "../services/geminiService";
import { generateInsights } from "../services/insightService";
import Comment from "../models/comment";
import Analysis from "../models/analysis";
import { error } from "console";
const router = express.Router();

function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  // Clean the URL first
  url = url.trim();

  // Regular expression to match various YouTube URL patterns
  const patterns = [
    // Standard watch URL with v parameter
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,

    // URL with v parameter anywhere in query string
    /[?&]v=([^&]+)/,

    // Short URL format
    /youtu\.be\/([^&\?\/]+)/,

    // Embedded URL format
    /youtube\.com\/embed\/([^&\?\/]+)/,

    // /v/ format
    /youtube\.com\/v\/([^&\?\/]+)/,

    // Attribution link
    /youtube\.com\/attribution_link.*?v%3D([^%&]+)/,

    // YouTube shorts
    /youtube\.com\/shorts\/([^&\?\/]+)/,
  ];

  // Try each pattern
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Return only the videoId part
      return match[1].split("&")[0];
    }
  }

  return null;
}

router.post("/analyze", async (req: Request, res: Response): Promise<any> => {
  try {
    const { url } = req.body;
    let videoId = extractYouTubeVideoId(url); // Extract video ID from URL

    // Check if we already have an analysis for this video
    const existingAnalysis = await Analysis.findOne({ videoId });
    if (existingAnalysis) {
      return res.json({
        message: "Analysis already exists",
        analysis: existingAnalysis,
      });
    }
    if (videoId === null) {
      return res.status(400).send({
        message: "Link Desn't have VideoId",
        error: "Can't Find VideoId",
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
