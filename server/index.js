import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/*Security middleware*/
app.use(helmet());

/* CORS  * Restrict this later to frontend origin*/
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/*Logging*/
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/* JSON parser with payload protection*/
app.use(
  express.json({
    limit: "5mb",
    strict: true,
  })
);

/* Health route*/
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "layout-agent-backend",
    environment: process.env.NODE_ENV || "development",
  });
});

/* API routes */
app.use("/api/chat", chatRoutes);

/* 404 handler*/
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

/* Global error handler*/
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON payload",
    });
  }

  res.status(500).json({
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});