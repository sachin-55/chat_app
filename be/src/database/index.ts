import { config } from "@/config";
import { AppError } from "@/utils";
import mongoose from "mongoose";

export const initDB = async () => {
  try {
    if (!config.DATABASE_URI) {
      throw new AppError("Database URI is not defined", 500);
    }
    mongoose
      .connect(config.DATABASE_URI)
      .then(() => {
        console.log("[database]: Connected successfully 📊");
      })
      .catch((error) => {
        console.error("Failed to initialize database", error);
        throw new AppError("Failed to initialize database", 500);
      });
  } catch (error) {
    console.error("Failed to initialize database", error);
    throw new AppError("Failed to initialize database", 500);
  }
};
