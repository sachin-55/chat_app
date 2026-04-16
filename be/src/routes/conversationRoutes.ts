import { conversationController } from "@/controllers";
import { authenticate } from "@/middlewares";
import { Router } from "express";

const router = Router();

export const conversationRoutes = () => {
  router.use(authenticate);
  router.post("/create", conversationController.createNewConversation);
  router.get("/", conversationController.getConversations);
  router.get("/:conversationId", conversationController.getConversationDetails);
  router.get("/:conversationId/messages", conversationController.getMessages);

  return router;
};
