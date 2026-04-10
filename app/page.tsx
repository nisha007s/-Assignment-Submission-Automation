"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Login } from "@/components/login";

export default function Home() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) return;

    if (profile?.role === "student") {
      console.log("[home] redirecting student to /student-dashboard");
      router.replace("/student-dashboard");
      return;
    }

    if (profile?.role === "teacher") {
      console.log("[home] redirecting teacher to /teacher-dashboard");
      router.replace("/teacher-dashboard");
      return;
    }

    console.warn("[home] session exists but profile is missing");
  }, [loading, session, profile, router]);

  // Loading — check session
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Not logged in
  if (!session) return <Login />;

  // Logged in but profile not available
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background p-6 text-center">
        <div>
          <p className="text-foreground font-medium">Authenticated but profile not found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Check whether `profiles` table exists and contains a row for this user.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
