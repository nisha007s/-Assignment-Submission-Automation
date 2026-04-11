"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import { StudentDashboard } from "@/components/student-dashboard";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace("/");
      return;
    }

    if (profile && profile.role !== "student") {
      router.replace("/teacher-dashboard");
    }
  }, [loading, session, profile, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!session || !profile || profile.role !== "student") return null;

  return (
    <StudentDashboard
      userId={profile.id}
      userName={profile.full_name}
      onLogout={async () => {
        await signOut();
        router.push("/");
      }}
    />
  );
}
