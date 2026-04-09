"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getUserProfile } from "@/lib/auth";
import type { Profile } from "@/lib/supabase";

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const p = await getUserProfile();
        setProfile(p);
      }
      setLoading(false);
    });

    // Listen for sign in / sign out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const p = await getUserProfile();
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { profile, loading };
}
