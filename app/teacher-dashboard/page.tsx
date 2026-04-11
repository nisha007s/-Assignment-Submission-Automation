"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import { TeacherDashboard } from "@/components/teacher-dashboard";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace("/");
      return;
    }

    if (profile && profile.role !== "teacher") {
      router.replace("/student-dashboard");
    }
  }, [loading, session, profile, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!session || !profile || profile.role !== "teacher") return null;

  return (
    <TeacherDashboard
      userName={profile.full_name}
      onLogout={async () => {
        await signOut();
        router.push("/");
      }}
    />
  );
}
