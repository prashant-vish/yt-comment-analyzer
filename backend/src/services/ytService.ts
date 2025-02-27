import axios from "axios";
import dotenv from "dotenv";
import { Comment } from "../types";

// Load environment variables
dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string;
const BASE_URL = process.env.BASE_URL as string;

function maskName(name: string): string {
  if (name.length <= 2) {
    return name[0] + "*"; // Mask only the first character
  }
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

function textWithOutHTML(textWithHTML: string): string {
  const textWithoutHtml = textWithHTML.replace(/<\/?[^>]+(>|$)/g, "");

  // Remove timestamps
  const text = textWithoutHtml.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/, "");
  return text;
}

export async function fetchComments(videoId: string): Promise<Comment[]> {
  let comments: Comment[] = [];
  let nextPageToken: string | null = null;
  try {
    do {
      const response: any = await axios.get(BASE_URL, {
        params: {
          key: YOUTUBE_API_KEY,
          part: "snippet,replies", // Added "replies"
          videoId: videoId,
          maxResults: 100,
          pageToken: nextPageToken,
        },
      });

      if (response.data.items) {
        response.data.items.forEach((item: any) => {
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
            item.replies.comments.forEach((reply: any) => {
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
  } catch (error: any) {
    console.error(
      "Error fetching comments:",
      error.response?.data || error.message
    );
    return [];
  }
}
