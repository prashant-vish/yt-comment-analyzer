import mongoose, { Schema, Document } from "mongoose";
import { AnalyzedComment } from "../types";

// Create a modified type that omits 'id' to avoid conflict with Mongoose's Document
export interface CommentDocument
  extends Omit<AnalyzedComment, "id">,
    Document {}

const CommentSchema: Schema = new Schema(
  {
    commentId: { type: String, required: true, unique: true }, // Rename to commentId
    videoId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    authorDisplayName: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    likeCount: { type: Number, default: 0 },
    sentiment: {
      type: String,
      enum: ["agree", "disagree", "neutral"],
      required: true,
    },
    score: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<CommentDocument>("Comment", CommentSchema);
