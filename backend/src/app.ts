import express, { Express } from "express";
import mongoose from "mongoose";
import apiRoutes from "./routes/api";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Middleware
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

export default app;
