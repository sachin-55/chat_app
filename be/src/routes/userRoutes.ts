import { userController } from "@/controllers";
import { authenticate } from "@/middlewares";
import { Router } from "express";

const router = Router();
export const userRoutes = () => {
  router.post("/register", userController.registerUser);
  router.post("/login", userController.loginUser);

  router.get(
    "/",
    authenticate({ isOptional: true }),
    userController.getAllUsers,
  );

  router.post(
    "/logout",
    authenticate({ isLogout: true }),
    userController.logout,
  );
  return router;
};
