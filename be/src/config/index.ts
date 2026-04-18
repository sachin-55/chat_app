import { StringValue } from "@/types";
import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:5173",
  ],
  DATABASE_URI: process.env.DATABASE_URI || "",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
  ACCESS_TOKEN_EXPIRY: (process.env.ACCESS_TOKEN_EXPIRY || "1d") as
    | number
    | StringValue,
  REFRESH_TOKEN_EXPIRY: (process.env.REFRESH_TOKEN_EXPIRY || "7d") as
    | number
    | StringValue,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || "",
  VAPID_EMAIL: process.env.VAPID_EMAIL || "",
};
