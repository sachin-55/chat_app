import { PaginationType, ResponseParamsType } from "@/types";
import { AppError } from "./errors";
import { StatusCodes } from "@/constants";

export const handleResponse = ({
  res,
  statusCode = 200,
  data,
  pagination,
  message,
}: ResponseParamsType) => {
  if (statusCode >= 400) {
    if (statusCode >= 500) {
      throw new AppError(
        "Server Error",
        StatusCodes.INTERNAL_SERVER_ERROR,
        message || "Something went wrong. ",
      );
    } else {
      throw new AppError(
        "Bad Request",
        StatusCodes.BAD_REQUEST,
        message || "An error occurred. ",
      );
    }
  }
  const status = "success";

  const respData: {
    data: any | null;
    pagination?: PaginationType;
    results?: number;
    message?: string;
  } = {
    data: null,
  };

  if (data) {
    respData.data = data;
  }

  if (message) {
    respData.message = message;
  }

  if (Array.isArray(data)) {
    respData.results = data.length;
    if (!!pagination) {
      respData.pagination = pagination;
    }
  }

  return res.status(statusCode).send({ status, ...respData });
};
