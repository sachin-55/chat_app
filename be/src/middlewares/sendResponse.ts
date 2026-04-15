import { NextFunction, Request, Response } from "express";
import { handleResponse } from "@/utils";
import { ResponseParamsType } from "@/types";

export const responseHandler =
  () => (_req: Request, res: Response, next: NextFunction) => {
    res.handleResponse = (
      options: Pick<
        ResponseParamsType,
        "data" | "message" | "pagination" | "statusCode"
      >,
    ) => handleResponse({ ...options, res });
    next();
  };
