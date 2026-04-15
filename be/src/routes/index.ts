import { Router } from "express";
import { userRoutes } from "./userRoutes";

const router = Router();

export const mainRouterV1 = () => {
  router.use("/users", userRoutes());
  return router;
};
