import { User } from "@/database/models";
import { BadRequestError, catchAsync } from "@/utils";
import {
  loginUserBodySchema,
  registerUserBodySchema,
} from "@/zodValidation/usersSchema";
import { Request, Response } from "express";

export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, avatar } = registerUserBodySchema.parse(
    req.body,
  );

  const user = await User.findOne({ email });

  if (user) {
    throw new BadRequestError("User with this email already exists");
  }
  const newUser = await User.create({ name, email, password, avatar });
  const accessToken = newUser.generateAccessToken();
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return res.handleResponse({ data: newUser });
});

export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = loginUserBodySchema.parse(req.body);

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const isPasswordValid = await user.validatePassword(password, user.password);

  if (!isPasswordValid) {
    throw new BadRequestError("Invalid password");
  }

  const accessToken = user.generateAccessToken();
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return res.handleResponse({ data: user });
});
