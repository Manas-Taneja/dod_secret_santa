import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  attachAuthCookie,
  hashPassword,
  signUserToken,
  toPublicUser,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { username, password, tshirtSize, bottomsSize, shoeSize } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { displayName: username } });
    if (existing) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        displayName: username,
        hashedPassword,
        tshirtSize: tshirtSize || null,
        bottomsSize: bottomsSize || null,
        shoeSize: shoeSize || null,
      },
    });

    const token = signUserToken(user.id);
    const response = NextResponse.json(
      { user: toPublicUser(user) },
      { status: 201 },
    );
    attachAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { message: "Unable to register" },
      { status: 500 },
    );
  }
}

