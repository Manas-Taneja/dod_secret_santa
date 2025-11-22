"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useSession } from "@/hooks/useSession";
import LinkPreviewCard from "@/components/LinkPreviewCard";

type WishlistItem = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

type UserWithWishlist = {
  id: string;
  displayName: string;
  tshirtSize: string | null;
  bottomsSize: string | null;
  shoeSize: string | null;
  wishlistItems: WishlistItem[];
};

type Props = {
  currentUserId: string;
  users?: UserWithWishlist[];
};

export default function AllWishlistsView({ currentUserId, users: initialUsers }: Props) {
  const { user } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithWishlist[]>(initialUsers ?? []);
  const [loading, setLoading] = useState(!initialUsers);

  useEffect(() => {
    // Always fetch client-side
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        console.log("Fetched users:", data.users);
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="relative flex flex-col gap-4 rounded-3xl border border-white/20 bg-black/50 p-6 text-white shadow-sm backdrop-blur-lg">
          <div className="flex flex-col gap-2">
            <h1 className="rounded-2xl px-4 py-2 text-3xl font-semibold text-white">
              All Wishlists
            </h1>
            <p className="text-sm text-gray-300">
              View everyone's wishlist items
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="rounded-2xl border border-white/20 bg-black/50 px-4 py-2 text-white backdrop-blur">
              Loading...
            </span>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="relative flex flex-col gap-4 rounded-3xl border border-white/20 bg-black/50 p-6 text-white shadow-sm backdrop-blur-lg">
        <button
          className="absolute right-6 top-6 rounded-full p-2 text-red-400 transition hover:bg-red-900/30 hover:text-red-300"
          onClick={handleLogout}
          title="Log out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="rounded-2xl px-4 py-2 text-3xl font-semibold text-white">
            All Wishlists
          </h1>
          <p className="text-sm text-gray-300">
            View everyone's wishlist items
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <button
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 font-semibold text-green-300 transition hover:bg-white/20 backdrop-blur"
            onClick={() => router.push("/")}
          >
            My Wishlist
          </button>
          <span className="rounded-2xl border border-white/20 bg-black/50 px-4 py-2 text-white backdrop-blur">
            Logged in as <span className="font-semibold">{user?.displayName}</span>
          </span>
        </div>
      </header>

      <div className="space-y-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-3xl border border-white/20 bg-black/50 p-6 shadow-sm backdrop-blur-lg"
          >
            <Link href={`/users/${user.id}` as any}>
              <h2 className="mb-4 rounded-2xl bg-white/10 px-4 py-2 text-xl font-semibold text-white backdrop-blur cursor-pointer transition hover:bg-white/20">
                {user.displayName}
                {user.id === currentUserId && (
                  <span className="ml-2 text-sm font-normal">
                    (You)
                  </span>
                )}
              </h2>
            </Link>

            {user.wishlistItems.length === 0 ? (
              <p className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
                {user.displayName} hasn't added any items yet.
              </p>
            ) : (
              <div className="space-y-4">
                {user.wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/20 bg-black/50 p-4 text-sm backdrop-blur-lg"
                  >
                    <div>
                      <p className="rounded-2xl bg-white/10 px-3 py-1 text-lg font-semibold text-white backdrop-blur">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="rounded-2xl bg-white/10 px-3 py-1 mt-2 text-sm text-white backdrop-blur">{item.description}</p>
                      )}
                    </div>
                    {item.url && (
                      <div className="mt-2 w-full">
                        <LinkPreviewCard
                          key={`${item.id}-${item.url}`}
                          url={item.url}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

