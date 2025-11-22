import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import WishlistDashboard from "@/components/WishlistDashboard";
import { SessionProvider } from "@/hooks/useSession";

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  // Serialize dates to strings for client component
  const serializedItems = items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <div className="bg-rotatable min-h-screen py-12">
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <SessionProvider initialUser={user}>
          <WishlistDashboard
            user={user}
            initialItems={serializedItems}
          />
        </SessionProvider>
      </main>
    </div>
  );
}
