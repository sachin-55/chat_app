import { config } from "@/config";
import { initDB } from "@/database";
import { responseHandler } from "@/middlewares";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { globalCentralErrorHandler } from "./controllers";
import { mainRouterV1 } from "./routes";
import { initWebPushNotification } from "./services/pushNotification";

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
initWebPushNotification();

app.use((req: Request, res: Response) => {
  res.handleResponse({
    statusCode: 404,
    message: req.originalUrl + " not found",
  });
});

app.use(globalCentralErrorHandler);
export default app;
