import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { wishlistUpdateSchema } from "@/lib/validation";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = wishlistUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await prisma.wishlistItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("Wishlist update error", error);
    return NextResponse.json(
      { message: "Unable to update wishlist item" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.wishlistItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.wishlistItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wishlist delete error", error);
    return NextResponse.json(
      { message: "Unable to delete wishlist item" },
      { status: 500 },
    );
  }
}

