// src/types.ts
export interface CommentStats {
  totalComments: number;
  agree: number;
  disagree: number;
  neutral: number;
}

export interface SentimentDistribution {
  agree: number;
  disagree: number;
  neutral: number;
}

export interface MonthlyDistribution {
  month: string;
  comments: number;
}

export interface CommentAnalysisData {
  sentimentDistribution: SentimentDistribution;
  commentStats: CommentStats;
  monthlyDistribution: MonthlyDistribution[];
  topKeywords: string[];
}
