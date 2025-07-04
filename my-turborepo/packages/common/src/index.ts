import { z } from "zod";

const usernameRegex = /^[a-z0-9_.!]+$/;

export const CreateUserSchema = z.object({
  username: z.string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be at most 15 characters")
    .regex(usernameRegex, "Username must contain only lowercase letters, numbers, _, ., or !"),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be at most 20 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character"),
  
  name: z.string().trim().nonempty("Name is required")
});

export const SignInSchema = z.object({
    username: z.string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be at most 15 characters")
    .regex(usernameRegex, "Username must contain only lowercase letters, numbers, _, ., or !"),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be at most 20 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character"),
})

export const CreateRoomSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Room name must be at least 3 characters")
    .max(10, "Room name must be at most 10 characters")
});