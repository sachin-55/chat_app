import { IUser } from "@/database/interface/user";
import { PaginationType, StatusCodesType } from "@/types";

declare global {
  namespace Express {
    interface Response {
      handleResponse: (options: {
        statusCode?: StatusCodesType;
        data?: any;
        message?: string;
        pagination?: PaginationType;
      }) => void;
    }
    interface Request {
      user?: IUser;
    }
  }
}
