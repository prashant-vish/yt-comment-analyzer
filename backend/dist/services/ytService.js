"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchComments = fetchComments;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = process.env.BASE_URL;
function maskName(name) {
    if (name.length <= 2) {
        return name[0] + "*"; // Mask only the first character
    }
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}
function textWithOutHTML(textWithHTML) {
    const textWithoutHtml = textWithHTML.replace(/<\/?[^>]+(>|$)/g, "");
    // Remove timestamps
    const text = textWithoutHtml.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/, "");
    return text;
}
async function fetchComments(videoId) {
    var _a;
    let comments = [];
    let nextPageToken = null;
    try {
        do {
            const response = await axios_1.default.get(BASE_URL, {
                params: {
                    key: YOUTUBE_API_KEY,
                    part: "snippet,replies", // Added "replies"
                    videoId: videoId,
                    maxResults: 100,
                    pageToken: nextPageToken,
                },
            });
            if (response.data.items) {
                response.data.items.forEach((item) => {
                    // Process top-level comment
                    const topLevelComment = item.snippet.topLevelComment;
                    const commentWithHtml = topLevelComment.snippet.textDisplay;
                    const comment = textWithOutHTML(commentWithHtml);
                    const authorName = topLevelComment.snippet.authorDisplayName;
                    const author = maskName(authorName);
                    // Add top-level comment
                    comments.push({
                        id: topLevelComment.id, // Correct ID for the comment
                        text: comment,
                        authorDisplayName: author,
                        publishedAt: topLevelComment.snippet.publishedAt,
                        likeCount: topLevelComment.snippet.likeCount,
                        isReply: false,
                        parentId: null, // No parent for top-level comments
                    });
                    // Process replies if they exist
                    if (item.replies && item.replies.comments) {
                        item.replies.comments.forEach((reply) => {
                            const replyWithHtml = reply.snippet.textDisplay;
                            const replyText = textWithOutHTML(replyWithHtml);
                            const replyAuthorName = reply.snippet.authorDisplayName;
                            const replyAuthor = maskName(replyAuthorName);
                            // Add reply comment
                            comments.push({
                                id: reply.id, // Reply comment ID
                                text: replyText,
                                authorDisplayName: replyAuthor,
                                publishedAt: reply.snippet.publishedAt,
                                likeCount: reply.snippet.likeCount,
                                isReply: true,
                                parentId: topLevelComment.id, // Link to parent comment
                            });
                        });
                    }
                });
            }
            nextPageToken = response.data.nextPageToken || null;
        } while (nextPageToken);
        console.log(`Total comments fetched: ${comments.length}`);
        return comments;
    }
    catch (error) {
        console.error("Error fetching comments:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return [];
    }
}
//# sourceMappingURL=ytService.js.map