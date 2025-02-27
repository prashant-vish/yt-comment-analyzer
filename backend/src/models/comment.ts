// models/Analysis.ts
import mongoose, { Schema, Document } from "mongoose";
import { VideoAnalysis } from "../types";

export interface AnalysisDocument extends VideoAnalysis, Document {}

const AnalysisSchema: Schema = new Schema({
  videoId: { type: String, required: true, unique: true },
  commentCount: { type: Number, required: true },
  sentimentBreakdown: {
    agree: { type: Number, required: true },
    disagree: { type: Number, required: true },
    neutral: { type: Number, required: true }
  },
  keywords: [
    {
      word: { type: String, required: true },
      count: { type: Number, required: true }
    }
  ],
  monthlyDistribution: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<AnalysisDocument>("Analysis", AnalysisSchema);