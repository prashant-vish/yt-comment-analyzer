"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ytService_1 = require("../services/ytService");
const geminiService_1 = require("../services/geminiService");
const insightService_1 = require("../services/insightService");
const comment_1 = __importDefault(require("../models/comment"));
const analysis_1 = __importDefault(require("../models/analysis"));
const router = express_1.default.Router();
function extractYouTubeVideoId(url) {
    if (!url || typeof url !== "string")
        return null;
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
router.post("/analyze", async (req, res) => {
    try {
        const { url } = req.body;
        let videoId = extractYouTubeVideoId(url); // Extract video ID from URL
        // Check if we already have an analysis for this video
        const existingAnalysis = await analysis_1.default.findOne({ videoId });
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
        let commentsData = await (0, ytService_1.fetchComments)(videoId);
        if (commentsData.length === 0) {
            return res.status(400).send({
                error: "No Comments on this video",
                message: "No comments found for this video",
            });
        }
        // const commentTexts = commentsData.map((comment) => comment.text);
        // 2. Analyzing the comments
        let analyzedComment = await (0, geminiService_1.analyzeAllComments)(commentsData);
        // 3. Generate insights
        const analysis = (0, insightService_1.generateInsights)(videoId, analyzedComment);
        // 4. Store everything in MongoDB
        // Save each analyzed comment
        await comment_1.default.insertMany(analyzedComment.map((comment) => ({
            commentId: comment.id,
            videoId,
            text: comment.text,
            authorDisplayName: comment.authorDisplayName,
            publishedAt: comment.publishedAt,
            likeCount: comment.likeCount,
            sentiment: comment.sentiment,
            score: comment.score,
            isReply: comment.isReply || false,
            parentId: comment.parentId || null,
        })));
        // Save the analysis
        const savedAnalysis = await analysis_1.default.create({
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
    }
    catch (error) {
        console.error("Error in analysis:", error);
        res.status(500).json({
            error: "An error occurred during analysis",
            message: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=api.js.map