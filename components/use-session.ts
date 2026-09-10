"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/types";

export function useSession(expectedRole?: Session["role"]) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/session")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: Session | null) => {
        if (!data) throw new Error("Not authenticated");
        if (expectedRole && data.role !== expectedRole) {
          router.replace(data.role === "REGIONAL_MANAGER" ? "/regional-dashboard" : "/store-dashboard");
          return;
        }
        setSession(data);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [expectedRole, router]);

  return { session, loading };
}
