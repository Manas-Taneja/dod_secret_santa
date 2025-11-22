"use client";

import Link from "next/link";
import { useState } from "react";

type Mode = "login" | "register";

type Props = {
  mode: Mode;
};

const copy = {
  login: {
    title: "Welcome back",
    description: "Sign in to manage your wishlist and see your match.",
    submit: "Sign in",
    alt: {
      label: "Need an account?",
      href: "/register",
      text: "Create one",
    },
  },
  register: {
    title: "Join the Secret Santa",
    description: "Create an account to add your wishlist and view your match.",
    submit: "Create account",
    alt: {
      label: "Already have an account?",
      href: "/login",
      text: "Sign in",
    },
  },
} as const;

export default function AuthForm({ mode }: Props) {
  const content = copy[mode];
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message ?? "Something went wrong");
        return;
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Auth error", err);
      setError("Unable to reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/20 bg-black/50 p-8 text-white shadow-xl backdrop-blur-lg">
      <div className="mb-8 text-center">
        <h1 className="rounded-2xl bg-white/10 px-4 py-2 text-3xl font-semibold text-white backdrop-blur">{content.title}</h1>
        <p className="mt-2 rounded-2xl bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">{content.description}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} suppressHydrationWarning>
        <div className="space-y-1">
          <label className="rounded-2xl bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur" htmlFor="username">
            Username
          </label>
          <input
            className="w-full rounded-2xl border border-white/20 bg-black/50 px-4 py-3 text-base text-white placeholder-white/50 outline-none transition focus:border-white/40 focus:bg-black/70 backdrop-blur"
            id="username"
            name="username"
            type="text"
            placeholder="alex"
            required
            minLength={2}
            maxLength={60}
            value={form.username}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1">
          <label className="rounded-2xl bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-2xl border border-white/20 bg-black/50 px-4 py-3 text-base text-white placeholder-white/50 outline-none transition focus:border-white/40 focus:bg-black/70 backdrop-blur"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={handleChange}
            suppressHydrationWarning
          />
        </div>

        {error && (
          <p className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
            {error}
          </p>
        )}

        <button
          className="flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/20 px-4 py-3 text-base font-semibold text-white transition hover:bg-white/30 disabled:opacity-60 backdrop-blur"
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait…" : content.submit}
        </button>
      </form>

      <p className="mt-6 rounded-2xl bg-white/10 px-4 py-2 text-center text-sm text-white backdrop-blur">
        {content.alt.label}{" "}
        <Link className="font-semibold hover:text-gray-200" href={content.alt.href}>
          {content.alt.text}
        </Link>
      </p>
    </div>
  );
}

