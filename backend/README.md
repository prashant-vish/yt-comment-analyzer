# YouTube Comment Analyzer - Backend

This backend service is designed to fetch, analyze, and generate insights from YouTube comments. It uses various APIs and services to perform sentiment analysis and keyword extraction from the comments of a given YouTube video.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Services](#services)
- [Models](#models)
- [Types](#types)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-repo/youtube-comment-analyzer.git
   cd youtube-comment-analyzer/backend
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the `backend` directory and add the required environment variables (see below).

4. Start the server:
   ```sh
   npm start
   ```

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
YOUTUBE_API_KEY=your_youtube_api_key
BASE_URL=https://www.googleapis.com/youtube/v3/commentThreads
GEMINI_API_KEY=your_gemini_api_key
```

## API Endpoints

### POST /api/analyze

Analyzes the comments of a given YouTube video URL.

**Request Body:**

```json
{
  "url": "https://www.youtube.com/watch?v=example_video_id"
}
```

**Response:**

```json
{
  "message": "Video ID extracted successfully",
  "analysis": {
    "videoId": "example_video_id",
    "commentCount": 100,
    "sentimentBreakdown": {
      "agree": 50,
      "disagree": 30,
      "neutral": 20
    },
    "keywords": [
      { "word": "example", "count": 10 },
      { "word": "keyword", "count": 8 }
    ],
    "monthlyDistribution": {
      "1/2023": 50,
      "2/2023": 50
    }
  }
}
```

## Services

### ytService.ts

- **fetchComments(videoId: string): Promise<Comment[]>**
  - Fetches comments from a YouTube video using the YouTube Data API.
  - Masks author names and removes HTML from comment text.

### geminiService.ts

- **analyzeCommentSentiment(comment: Comment): Promise<AnalyzedComment>**

  - Analyzes the sentiment of a single comment using the Gemini API.
  - Implements rate limiting with exponential backoff.

- **analyzeAllComments(comments: Comment[], concurrencyLimit = 3): Promise<AnalyzedComment[]>**
  - Analyzes all comments with controlled concurrency.

### insightService.ts

- **generateInsights(videoId: string, analyzedComments: AnalyzedComment[]): VideoAnalysis**
  - Generates insights from analyzed comments, including sentiment breakdown, keyword extraction, and monthly distribution.

## Models

### comment.ts

- Mongoose model for storing analyzed comments.

### analysis.ts

- Mongoose model for storing video analysis results.

## Types

### index.ts

- **Comment**

  - Represents a YouTube comment.

- **AnalyzedComment**

  - Extends `Comment` with sentiment analysis results.

- **VideoAnalysis**
  - Represents the analysis results for a YouTube video, including sentiment breakdown, keywords, and monthly distribution.
