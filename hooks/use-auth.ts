 "use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getUserProfileWithRetry } from "@/lib/auth";
import type { Profile } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ 1. Load session ONCE
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("[useAuth] initial session", session?.user?.id ?? "none");

      setSession(session);

      if (session) {
        const p = await getUserProfileWithRetry();
        console.log("[useAuth] initial profile", p);
        setProfile(p);
      }

      setLoading(false);
    });
  }, []);

  // ✅ 2. Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[useAuth] auth state changed", event, session?.user?.id ?? "none");

        setSession(session);

        if (session) {
          const p = await getUserProfileWithRetry();
          console.log("[useAuth] profile after auth change", p);
          setProfile(p);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { session, profile, loading };
}