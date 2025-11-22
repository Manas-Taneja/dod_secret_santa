"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { PublicUser } from "@/lib/auth";

type SessionContextValue = {
  user: PublicUser | null;
  setUser: (user: PublicUser | null) => void;
  refresh: () => Promise<void>;
  loading: boolean;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

type ProviderProps = {
  initialUser: PublicUser | null;
  children: React.ReactNode;
};

export function SessionProvider({ initialUser, children }: ProviderProps) {
  const [user, setUser] = useState<PublicUser | null>(initialUser);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      const data = await response.json();
      setUser(data.user ?? null);
    } catch (error) {
      console.error("Session refresh failed", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialUser) {
      void refresh();
    }
  }, [initialUser]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      refresh,
      loading,
    }),
    [user, loading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

