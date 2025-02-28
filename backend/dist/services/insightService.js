"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInsights = generateInsights;
function generateInsights(videoId, analyzedComments) {
    // Count comments by sentiment
    const sentimentBreakdown = {
        agree: analyzedComments.filter((c) => c.sentiment === "agree").length,
        disagree: analyzedComments.filter((c) => c.sentiment === "disagree").length,
        neutral: analyzedComments.filter((c) => c.sentiment === "neutral").length,
    };
    // Get monthly distribution
    const monthlyDistribution = {};
    analyzedComments.forEach((comment) => {
        const date = new Date(comment.publishedAt);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (!monthlyDistribution[monthYear]) {
            monthlyDistribution[monthYear] = 0;
        }
        monthlyDistribution[monthYear]++;
    });
    // Extract keywords (excluding common words)
    const commonWords = new Set([
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "this",
        "that",
        "i",
        "you",
        "he",
        "she",
        "it",
        "we",
        "they",
        "my",
        "your",
        "his",
        "her",
        "its",
        "our",
        "their",
        "video",
    ]);
    const wordCounts = {};
    analyzedComments.forEach((comment) => {
        // Split comment text into words and process each word
        const words = comment.text.toLowerCase().split(/\W+/);
        words.forEach((word) => {
            // Skip empty strings, short words, and common words
            if (word && word.length > 2 && !commonWords.has(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
    });
    // Get top keywords
    const keywords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
    return {
        videoId,
        commentCount: analyzedComments.length,
        sentimentBreakdown,
        keywords,
        monthlyDistribution,
    };
}
//# sourceMappingURL=insightService.js.map