import { Response } from "express";
import { StatusCodesType } from ".";

export type PaginationType = {
  page: number;
  limit: number;
  results?: number;
  totalPages?: number;
  totalResults?: number;
  nextPage?: number | null;
  prevPage?: number | null;
};

export type ResponseParamsType = {
  res: Response;
  statusCode?: StatusCodesType;
  data?: any;
  message?: string;
  pagination?: PaginationType;
};
