import express, { Application, Request, Response } from "express";
import cors from "cors";
import { HealthCheckResponse } from "@/types";

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (_req: Request, res: Response) => {
  const health: HealthCheckResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
  res.json(health);
});

export default app;
