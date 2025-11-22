import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  attachAuthCookie,
  signUserToken,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { displayName: username } });

    const valid =
      user && (await verifyPassword(password, user.hashedPassword));

    if (!valid || !user) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 },
      );
    }

    const token = signUserToken(user.id);
    const response = NextResponse.json({ user: toPublicUser(user) });
    attachAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { message: "Unable to login" },
      { status: 500 },
    );
  }
}

