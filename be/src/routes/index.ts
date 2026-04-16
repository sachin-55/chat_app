import { Router } from "express";
import { userRoutes } from "./userRoutes";
import { conversationRoutes } from "./conversationRoutes";

const router = Router();

export const mainRouterV1 = () => {
  router.use("/users", userRoutes());
  router.use("/conversations", conversationRoutes());
  return router;
};
