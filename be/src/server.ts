import { config } from "@/config";
import http from "http";
import app from "./app";

const PORT = config.PORT;

const server = http.createServer(app);

process.on("uncaughtException", (err: Error) => {
  console.error(err.name, err);
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
  process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
  console.error(err);
  console.error("UNHANDLED REJECTION 💥 Shutting down...");

  server.close(() => {
    console.log("💥 Process terminated");
    process.exit(1);
  });
});

server.listen(PORT, () => {
  console.log(`[server]: Running on http://localhost:${PORT} 🎰`);
});
