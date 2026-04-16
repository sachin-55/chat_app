import z from "zod";

export const registerUserBodySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  avatar: z.string().optional(),
  email: z.email({ error: "Invalid email address." }),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginUserBodySchema = z.object({
  email: z.email({ error: "Invalid email address." }),
  password: z.string(),
});

export const getAllUsersQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
});
