import { supabase } from "./supabase";
import type { Profile, Role } from "./supabase";

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: Role
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });

  if (error) throw error;

  // ✅ INSERT PROFILE AFTER SIGNUP
  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: role,
        },
      ]);

    if (profileError) {
      console.error("Profile insert failed:", profileError);
      throw profileError;
    }
  }

  return data;
}
 

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[auth:getUserProfile] failed", error);
    return null;
  }

  return data;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("[auth:getSession] failed", error);
    throw error;
  }
  return data.session;
}

export async function ensureUserProfile(
  userId: string,
  email: string,
  fullName: string,
  role: Role
) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("[auth:ensureUserProfile] failed", error);
    return null;
  }

  return data as Profile;
}

export async function getUserProfileWithRetry(retries = 5, delayMs = 300) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const profile = await getUserProfile();
    if (profile) return profile;
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}
