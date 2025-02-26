import express from "express";

const router = express.Router();

router.post("/analyze", (req, res) => {
  res.json({ status: "API is running" });
});

export default router;
