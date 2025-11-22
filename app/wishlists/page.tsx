import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { SessionProvider } from "@/hooks/useSession";
import AllWishlistsView from "@/components/AllWishlistsView";

export default async function AllWishlistsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-rotatable min-h-screen py-12">
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <SessionProvider initialUser={user}>
          <AllWishlistsView currentUserId={user.id} />
        </SessionProvider>
      </main>
    </div>
  );
}

