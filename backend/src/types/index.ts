export interface Comment {
  id: string;
  text: string;
  authorDisplayName: string;
  publishedAt: Date;
  likeCount: number;
  isReply?: boolean;
  parentId?: string | null;
}

export interface AnalyzedComment extends Comment {
  sentiment: "agree" | "disagree" | "neutral";
  score?: number;
}

export interface VideoAnalysis {
  videoId: string;
  commentCount: number;
  sentimentBreakdown: {
    agree: number;
    disagree: number;
    neutral: number;
  };
  keywords: Array<{ word: string; count: number }>;
  monthlyDistribution: Record<string, number>;
}
