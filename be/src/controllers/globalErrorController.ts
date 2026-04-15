import { NextFunction, Request, Response } from "express";
import { config } from "@/config";
import { AppError } from "@/utils";
import { StatusCodes } from "@/constants";

const sendError = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const NODE_ENV = config.NODE_ENV;

  const customError = {
    name: error.name,
    message: error.message,
    statusCode: error?.code || error.statusCode,
    status: error.status,
    stack: error.stack,
    isOperational: Boolean(error.isOperational),
  };

  if (customError.name === "ValidationError") {
    customError.name = "Data Validation Error";
    customError.message =
      customError.message || "Server data validation error.";
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.isOperational = true;
  }

  if (customError.name === "JsonWebTokenError") {
    customError.name = "JWT Error";
    customError.message = "Your token is invalid! Please log in again!!";
    customError.statusCode = StatusCodes.UNAUTHORIZED;
    customError.isOperational = true;
  }

  if (customError.name === "TokenExpiredError") {
    customError.name = "JWT Token Expired";
    customError.message = "Your token has expired! Please log in again!!";
    customError.statusCode = StatusCodes.UNAUTHORIZED;
    customError.isOperational = true;
  }

  if (
    customError.statusCode === 11000 &&
    customError.name === "MongoServerError"
  ) {
    const duplicateField = customError.message
      .split("index: ")[1]
      .split("dup key")[0]
      .split("_")[0];
    customError.name = "Duplicate field";
    customError.message = `Duplicate field ${duplicateField}. Please use another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.isOperational = true;
  }

  if (
    customError.name === "SyntaxError" &&
    customError.message.includes("Unexpected token ")
  ) {
    customError.message = "Invalid data format";
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.isOperational = true;
  }

  !customError.isOperational &&
    console.log("NON OPERATIONAL ERROR :: ", customError.message, {
      name: customError.name,
      statusCode: customError.statusCode,
      message: customError.message,
      stack: customError.stack,
      isOperational: customError.isOperational,
      ip: req.ip,
      app: req.app.locals.title,
    });

  interface ErrorResponse {
    name?: string;
    message: string;
    status: string;
    statusCode: number;
    stack?: string;
  }

  const errorResponse: ErrorResponse = {
    status: customError.status,
    message: customError.message,
    statusCode: customError.statusCode,
    name: customError.name,
  };

  if (NODE_ENV === "development") {
    errorResponse.stack = customError.stack;
    errorResponse.message = customError?.message;
  } else {
    errorResponse.message = customError?.isOperational
      ? customError?.message
      : "Something went wrong.";
    console.error("ERROR ==> ", errorResponse);
  }

  return res.status(customError.statusCode || 500).json(errorResponse);
};

export const globalCentralErrorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  error.statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  error.status = error.status || "error";

  sendError(error, req, res, next);
};
