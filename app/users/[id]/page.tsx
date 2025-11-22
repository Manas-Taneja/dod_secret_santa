import { redirect, notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { SessionProvider } from "@/hooks/useSession";
import UserProfile from "@/components/UserProfile";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserProfilePage({ params }: Params) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    redirect("/login");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
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
  });

  if (!user) {
    notFound();
  }

  // Serialize dates to strings for client component
  const serializedUser = {
    ...user,
    wishlistItems: user.wishlistItems.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  };

  return (
    <div className="bg-rotatable min-h-screen py-12">
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <SessionProvider initialUser={currentUser}>
          <UserProfile user={serializedUser} currentUserId={currentUser.id} />
        </SessionProvider>
      </main>
    </div>
  );
}

