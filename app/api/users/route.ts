import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      tshirtSize: true,
      bottomsSize: true,
      shoeSize: true,
      wishlistItems: {
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      },
    },
    orderBy: {
      displayName: "asc",
    },
  });

  return NextResponse.json(
    { users },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
      },
    },
  );
}

