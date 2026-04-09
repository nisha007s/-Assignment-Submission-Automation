"use client";

import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import { Login } from "@/components/login";
import { StudentDashboard } from "@/components/student-dashboard";
import { TeacherDashboard } from "@/components/teacher-dashboard";

export default function Home() {
  const { profile, loading } = useAuth();

  // Loading — check session
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Not logged in — show login page
  if (!profile) return <Login />;

  // Logged in — route by role
  const handleLogout = async () => { await signOut(); };

  if (profile.role === "student") {
    return <StudentDashboard userName={profile.full_name} onLogout={handleLogout} />;
  }

  return <TeacherDashboard onLogout={handleLogout} />;
}
