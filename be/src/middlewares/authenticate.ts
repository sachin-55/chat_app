import { config } from "@/config";
import { User } from "@/database/models";
import { IExtendedSocket } from "@/types/socket";
import { catchAsync, UnauthorizedAppError } from "@/utils";
import cookie from "cookie";
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

    const userId = decodedToken?.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new UnauthorizedAppError("Invalid Token.");
    }
    req.user = user;

    next();
  },
);

export const authenticateSocket = async (
  socket: IExtendedSocket,
  next: (err?: any) => void,
) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
      return next(new Error("No cookies found"));
    }

    const parsed = cookie.parse(rawCookie);
    const token = parsed.token;

    if (!token) {
      throw new UnauthorizedAppError("Invalid Token or token not found.");
    }

    const decodedToken = await verifyToken(token);
    const userId = decodedToken?.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedAppError("Invalid Token.");
    }
    socket.data.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
