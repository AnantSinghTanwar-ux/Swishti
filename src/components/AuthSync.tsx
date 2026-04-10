"use client";

import { useEffect } from "react";
import { subscribeToAuthChanges } from "@/lib/auth";
import { useReportStore, initRealtimeListeners } from "@/lib/store";
import { ensureUserProfile } from "@/lib/firestore";
import type { User } from "firebase/auth";

export function AuthSync() {
  const { setUser } = useReportStore();

  useEffect(() => {
    // Initialize real-time Firestore listeners
    initRealtimeListeners();

    // Subscribe to auth state
    const unsubscribe = subscribeToAuthChanges(async (user: User | null) => {
      setUser(user);
      if (user?.email) {
        await ensureUserProfile(user.email);
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  return null;
}
