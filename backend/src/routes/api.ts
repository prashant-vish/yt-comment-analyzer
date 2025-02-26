import express from "express";
import { Request, Response } from "express";
import { fetchComments } from "../services/ytService";

const router = express.Router();

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const videoId = url.split("v=")[1]; // Extract video ID from URL

    let comments = await fetchComments(videoId);

    res.json({ message: "Video ID extracted successfully", comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
