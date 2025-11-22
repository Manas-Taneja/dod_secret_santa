import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import type { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const AUTH_COOKIE_NAME = "dod-secret-santa-token";
const JWT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

type JwtPayload = {
  userId: string;
  iat: number;
  exp: number;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export function signUserToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: JWT_MAX_AGE_SECONDS,
  });
}

export function verifyUserToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export function attachAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: JWT_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export type PublicUser = {
  id: string;
  displayName: string;
};

export function toPublicUser(user: {
  id: string;
  displayName: string;
}): PublicUser {
  return {
    id: user.id,
    displayName: user.displayName,
  };
}

export async function getAuthToken(): Promise<string | null> {
  try {
    // Try cookies() first (works in server components and route handlers)
    const cookieStore = await cookies();
    const cookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (cookie?.value) {
      return cookie.value;
    }
  } catch (error) {
    // If cookies() fails, try parsing from headers
    try {
      const headersList = await headers();
      const cookieHeader = headersList.get("cookie");
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
          const [name, value] = cookie.trim().split("=");
          acc[name] = decodeURIComponent(value);
          return acc;
        }, {} as Record<string, string>);
        return cookies[AUTH_COOKIE_NAME] ?? null;
      }
    } catch (headerError) {
      // Both methods failed
      return null;
    }
  }
  return null;
}

export async function getSessionUser(token?: string | null): Promise<PublicUser | null> {
  const authToken = token ?? (await getAuthToken());
  if (!authToken) return null;

  const payload = verifyUserToken(authToken);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, displayName: true },
  });

  return user ?? null;
}

