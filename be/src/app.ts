import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalCentralErrorHandler } from "./controllers";
import { config } from "@/config";
import { responseHandler } from "@/middlewares";
import { mainRouterV1 } from "./routes";
import { initDB } from "@/database";

const app: Application = express();

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

app.get("/health", (_req: Request, res: Response) => {
  res.handleResponse({
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    message: "Health check passed",
  });
});

app.use("/api/v1", mainRouterV1());
initDB();

app.use((req: Request, res: Response) => {
  res.handleResponse({
    statusCode: 404,
    message: req.originalUrl + " not found",
  });
});

app.use(globalCentralErrorHandler);
export default app;
