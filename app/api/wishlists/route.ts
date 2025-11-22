import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { wishlistItemSchema } from "@/lib/validation";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = wishlistItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Wishlist create error", error);
    return NextResponse.json(
      { message: "Unable to create wishlist item" },
      { status: 500 },
    );
  }
}

