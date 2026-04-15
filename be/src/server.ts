import app from "./app";
import { config } from "@/config";

const PORT = config.PORT;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`[server]: Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[server]: Error starting server:", error);
    process.exit(1);
  }
};

startServer();
