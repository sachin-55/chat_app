import { IUser } from "@/database/interface/user";
import { User } from "@/database/models";
import { BadRequestError, catchAsync } from "@/utils";
import {
  getAllUsersQuerySchema,
  loginUserBodySchema,
  registerUserBodySchema,
} from "@/zodValidation/usersSchema";
import { Request, Response } from "express";
import { QueryFilter } from "mongoose";

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

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const {
    search,
    limit = 10,
    page = 1,
  } = getAllUsersQuerySchema.parse(req.query);
  const { _id: userId } = req?.user || {};
  const filter: QueryFilter<IUser> = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (userId) {
    filter._id = { $ne: userId };
  }
  const users = await User.find(filter)
    .sort("-createdAt")
    .limit(limit)
    .skip((page - 1) * limit);
  const counts = await User.countDocuments(filter);
  const pagination = {
    totalResults: counts,
    page,
    limit,
    totalPages: Math.ceil(counts / limit),
    results: users.length,
  };

  return res.handleResponse({ data: users, pagination });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });

  return res.handleResponse({ message: "Logout successfully" });
});
