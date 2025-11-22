import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url({ message: "Must be a valid URL" })
  .max(300)
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalText = z
  .string()
  .trim()
  .max(400)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const registerSchema = z.object({
  username: z.string().trim().min(2).max(60),
  password: z.string().min(1).max(72),
  tshirtSize: z.string().trim().max(20).optional().or(z.literal("").transform(() => undefined)),
  bottomsSize: z.string().trim().max(20).optional().or(z.literal("").transform(() => undefined)),
  shoeSize: z.string().trim().max(20).optional().or(z.literal("").transform(() => undefined)),
});

export const loginSchema = z.object({
  username: z.string().trim().min(2).max(60),
  password: z.string().min(1),
});

export const wishlistItemSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: optionalText,
  url: optionalUrl,
  priority: z.coerce.number().int().min(1).max(5).default(1),
});

export const wishlistUpdateSchema = wishlistItemSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field is required",
  },
);

