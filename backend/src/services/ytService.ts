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

export async function fetchComments(videoId: string): Promise<Comment[]> {
  let comments: Comment[] = [];
  let nextPageToken: string | null = null;
  try {
    do {
      const response: any = await axios.get(BASE_URL, {
        params: {
          key: YOUTUBE_API_KEY,
          part: "snippet",
          videoId: videoId,
          maxResults: 100, // Maximum limit per request
          pageToken: nextPageToken,
        },
      });

      if (response.data.items) {
        response.data.items.forEach((item: any) => {
          const commentWithHtml =
            item.snippet.topLevelComment.snippet.textDisplay;
          // Remove HTML tags
          const commentWithoutHtml = commentWithHtml.replace(
            /<\/?[^>]+(>|$)/g,
            ""
          );
          // Remove timestamps (matches formats like 00:45, 1:23, 2:15:30)
          const comment = commentWithoutHtml.replace(
            /^\d{1,2}:\d{2}(?::\d{2})?\s*/,
            ""
          );

          const authorName =
            item.snippet.topLevelComment.snippet.authorDisplayName;
          const author = maskName(authorName);


          comments.push({
            id: item.id,
            text: comment,
            authorDisplayName: author,
            publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
            likeCount: item.snippet.topLevelComment.snippet.likeCount,
          });
        });
      }

      nextPageToken = response.data.nextPageToken || null; // Update nextPageToken
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

