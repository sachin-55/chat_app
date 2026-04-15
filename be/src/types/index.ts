import { StatusCodes } from "@/constants";

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}
export { PaginationType, ResponseParamsType } from "./response";
export type StatusCodesType = (typeof StatusCodes)[keyof typeof StatusCodes];
