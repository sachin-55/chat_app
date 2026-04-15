import { StatusCodes } from "@/constants/statusCodes";

export class AppError extends Error {
  isOperational: boolean;
  status: string;
  statusCode: number;
  code?: number;

  constructor(message: string, statusCode: number = 400, name?: string) {
    super(message);
    this.name = name || "Bad Request";
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith("4") ? "error" : "fail";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(message, StatusCodes.NOT_FOUND, "Not Found");
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request, request is not valid.") {
    super(message, StatusCodes.BAD_REQUEST, "Bad Request");
  }
}
export class ForbiddenError extends AppError {
  constructor(message = "Do not have permission.", name = "Forbidden") {
    super(message, StatusCodes.FORBIDDEN, name);
  }
}
export class UnauthorizedAppError extends AppError {
  constructor(message = "Do not have authorization.", name = "Unauthorized") {
    super(message, StatusCodes.UNAUTHORIZED, name);
  }
}
