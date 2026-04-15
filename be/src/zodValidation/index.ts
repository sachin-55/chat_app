import { config } from "@/config";
import { AppError, catchAsync } from "@/utils";
import { NextFunction, Request, Response } from "express";
import z, { ZodError } from "zod";

export const zValidateData = (schema: z.ZodObject<any, any>) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync({
          body: req.body,
          params: req.params,
          query: req.query,
        });

        next();
      } catch (error) {
        if (config.NODE_ENV !== "production" && error instanceof ZodError) {
          console.error(
            "ZOD Validation Error ::",
            error?.issues?.map((issue: any) => issue.message),
          );
        }
        if (error instanceof ZodError) {
          const initialPath = new Set();
          const errorMessages = error.issues.map((issue: any) => {
            // const lastPath = issue.path[issue.path.length - 1];
            initialPath.add(issue.path[0]);
            // return {
            //   [lastPath]: issue.message
            // };
            return issue.message;
          });

          const CustomError = new AppError(
            JSON.stringify(errorMessages.join(", ")),
            400,
            `Invalid ${Array.from(initialPath).join(", ")} Data`,
          );
          next(CustomError);
        } else {
          const CustomError = new AppError(
            "Internal Server Error",
            500,
            "Internal Server Error",
          );
          next(CustomError);
        }
      }
    },
  );
};
