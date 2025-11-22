"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { PublicUser } from "@/lib/auth";
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

type Props = {
  initialItems: WishlistItem[];
  user: PublicUser;
};

const defaultFormState = {
  title: "",
  description: "",
  url: "",
  priority: 1,
};

function sortItems(items: WishlistItem[]) {
  return [...items].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function WishlistDashboard({
  initialItems,
  user,
}: Props) {
  const { setUser } = useSession();
  const [items, setItems] = useState(() => sortItems(initialItems));
  const [form, setForm] = useState(defaultFormState);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const totalItems = items.length;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.message ?? "Unable to add item");
        return;
      }

      const data = await response.json();
      setItems((prev) => sortItems([...prev, data.item]));
      setForm(defaultFormState);
      setMessage("Item added!");
    } catch (error) {
      console.error("Create item error", error);
      setMessage("Network error, please try again.");
    } finally {
      setCreating(false);
    }
  };

  const updateItem = async (
    id: string,
    values: Partial<Omit<WishlistItem, "id">>,
  ) => {
    setPendingId(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.message ?? "Unable to update item");
        return;
      }

      const data = await response.json();
      setItems((prev) =>
        sortItems(prev.map((item) => (item.id === id ? data.item : item))),
      );
    } catch (error) {
      console.error("Update item error", error);
      setMessage("Network error, please try again.");
    } finally {
      setPendingId(null);
    }
  };

  const deleteItem = async (id: string) => {
    setPendingId(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.message ?? "Unable to delete item");
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete item error", error);
      setMessage("Network error, please try again.");
    } finally {
      setPendingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };


  return (
    <div className="flex flex-col gap-8">
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
            {totalItems <= 3
              ? `Hi ${user.displayName}, your wishlist is looking a little empty`
              : "Your wishlist is coming along great"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="rounded-2xl border border-white/20 bg-black/50 px-4 py-2 text-white backdrop-blur">
            <span className="font-bold">{totalItems}</span> item{totalItems === 1 ? "" : "s"} listed
          </span>
          <Link
            href="/wishlists"
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 font-semibold text-green-300 transition hover:bg-white/20 backdrop-blur"
          >
            View All Wishlists
          </Link>
        </div>
      </header>


      <section className="flex flex-col gap-6">
        <div className="rounded-3xl border border-white/20 bg-black/50 p-6 shadow-sm backdrop-blur-lg">
          <h2 className="rounded-2xl  px-4 py-2 text-xl font-semibold text-white ">Add new item</h2>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <div className="space-y-1">
              <label className="rounded-2xl px-3 py-1 text-sm text-white " htmlFor="title">
                Title
              </label>
              <input
                className="w-full rounded-2xl border border-white/20 bg-black/50 px-4 py-3 text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-black/70 backdrop-blur"
                id="title"
                name="title"
                placeholder="Cozy blanket"
                required
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="rounded-2xl bg-white/10 px-3 py-1 text-sm text-white backdrop-blur" htmlFor="description">
                Notes
              </label>
              <textarea
                className="w-full rounded-2xl border border-white/20 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-black/70 backdrop-blur"
                id="description"
                name="description"
                placeholder="Colors, sizes, brands..."
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <label className="rounded-2xl bg-white/10 px-3 py-1 text-sm text-white backdrop-blur" htmlFor="url">
                Link (optional)
              </label>
              <input
                className="w-full rounded-2xl border border-white/20 bg-black/50 px-4 py-3 text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-black/70 backdrop-blur"
                id="url"
                name="url"
                placeholder="https://example.com/gift"
                value={form.url}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    url: event.target.value,
                  }))
                }
              />
            </div>

            {message && (
              <p className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
                {message}
              </p>
            )}

            <button
              className="flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/20 px-4 py-3 font-semibold text-white transition hover:bg-white/30 disabled:opacity-60 backdrop-blur"
              type="submit"
              disabled={creating}
            >
              {creating ? "Saving…" : "Add to wishlist"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/20 bg-black/50 p-6 shadow-sm backdrop-blur-lg">
          <div className="mb-4">
            <h2 className="rounded-2xl px-4 py-2 text-xl font-semibold text-white">
              Your wishlist
            </h2>
          </div>

          {items.length === 0 ? (
            <p className="rounded-2xl px-4 py-2 text-sm text-white">
              Add your first gift idea to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <WishlistItemRow
                  key={item.id}
                  item={item}
                  pending={pendingId === item.id}
                  onDelete={() => deleteItem(item.id)}
                  onSave={(values) => updateItem(item.id, values)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type ItemRowProps = {
  item: WishlistItem;
  pending: boolean;
  onSave: (values: Partial<WishlistItem>) => void;
  onDelete: () => void;
};

function WishlistItemRow({ item, pending, onSave, onDelete }: ItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: item.title,
    description: item.description ?? "",
    url: item.url ?? "",
    priority: item.priority,
  });

  const hasChanges = useMemo(() => {
    return (
      draft.title !== item.title ||
      draft.description !== (item.description ?? "") ||
      draft.url !== (item.url ?? "") ||
      draft.priority !== item.priority
    );
  }, [draft, item]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      title: draft.title,
      description: draft.description,
      url: draft.url,
      priority: draft.priority,
    });
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border border-white/20 bg-black/50 p-4 shadow-sm backdrop-blur-lg">
      <div>
        <p className="rounded-2xl bg-white/10 px-3 py-1 text-lg font-semibold text-white backdrop-blur">{item.title}</p>
        {item.description && (
          <p className="rounded-2xl bg-white/10 px-3 py-1 mt-2 text-sm text-white backdrop-blur">{item.description}</p>
        )}
      </div>
      {item.url && (
        <div className="mt-2 w-full">
          <LinkPreviewCard key={`${item.id}-${item.url}`} url={item.url} />
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <button
          className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-white hover:bg-white/20 backdrop-blur"
          onClick={() => setEditing((prev) => !prev)}
        >
          {editing ? "Cancel" : "Edit"}
        </button>
        <button
          className="rounded-full border border-white/20 bg-black/50 px-4 py-1 text-white hover:bg-black/70 disabled:opacity-60 backdrop-blur"
          onClick={onDelete}
          disabled={pending}
        >
          Delete
        </button>
      </div>

      {editing && (
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input
            className="w-full rounded-2xl border border-white/20 bg-black/50 px-4 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-black/70 backdrop-blur"
            value={draft.title}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, title: event.target.value }))
            }
            required
          />
          <textarea
            className="w-full rounded-2xl border border-white/20 bg-black/50 px-4 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-black/70 backdrop-blur"
            rows={2}
            value={draft.description}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
          <input
            className="w-full rounded-2xl border border-white/20 bg-black/50 px-4 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-black/70 backdrop-blur"
            value={draft.url}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, url: event.target.value }))
            }
            placeholder="https://"
          />
          <div className="flex items-center gap-2">
            <label className="rounded-2xl bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">Priority</label>
            <input
              className="w-20 rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-white/40 focus:bg-black/70 backdrop-blur"
              type="number"
              min={1}
              max={5}
              value={draft.priority}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  priority: Number(event.target.value),
                }))
              }
            />
          </div>
          <button
            className="rounded-2xl border border-white/20 bg-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/30 disabled:opacity-60 backdrop-blur"
            type="submit"
            disabled={!hasChanges || pending}
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}
    </div>
  );
}

