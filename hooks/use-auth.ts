"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getUserProfileWithRetry } from "@/lib/auth";
import type { Profile } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      if (session) {
        const p = await getUserProfileWithRetry();
        setProfile(p);
      }

      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        const manual =
          typeof window !== "undefined" &&
          sessionStorage.getItem("asas_manual_logout");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("asas_manual_logout");
        }
        if (!manual) {
          toast.error("Session expired. Please login again.");
        }
      }

      setSession(session);

      if (session) {
        const p = await getUserProfileWithRetry();
        setProfile(p);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, profile, loading };
}