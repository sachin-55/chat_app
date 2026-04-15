import { config } from "@/config";
import { catchAsync, UnauthorizedAppError } from "@/utils";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const verifyToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as JwtPayload);
    });
  });
};

export const authenticate = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
      throw new UnauthorizedAppError("Invalid Token or token not found.");
    }

    const decodedToken = await verifyToken(token);

    // Attach user to request
    req.user = decodedToken;

    next();
  },
);
