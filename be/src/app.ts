import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { HealthCheckResponse } from "@/types";
import { globalCentralErrorHandler } from "./controllers";
import { config } from "@/config";
import { responseHandler } from "@/middlewares";
import { mainRouterV1 } from "./routes";

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(responseHandler());

// Routes
app.get("/health", (_req: Request, res: Response) => {
  const health: HealthCheckResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
  res.json(health);
});

app.use("/api/v1", mainRouterV1());

app.use(globalCentralErrorHandler);
export default app;
