"use client";

import { createClient } from "@supabase/supabase-js";

/** Static property access so Next.js inlines values in the client bundle (dynamic `process.env[name]` does not). */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Role = "student" | "teacher";

/** Row shape for `public.profiles` (used by auth and dashboards). */
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  created_at?: string;
  updated_at?: string;
}