import { StatusCodes } from "@/constants";

export { PaginationType, ResponseParamsType } from "./response";
export type StatusCodesType = (typeof StatusCodes)[keyof typeof StatusCodes];
export type StringValue = `${number}${"d" | "h" | "m" | "s"}`;
