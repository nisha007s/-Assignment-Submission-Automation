"use client";

import { useState } from "react";
import { Login } from "@/components/login";
import { StudentDashboard } from "@/components/student-dashboard";
import { TeacherDashboard } from "@/components/teacher-dashboard";

type UserRole = "student" | "teacher" | null;

export default function Home() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState("");

  const handleLogin = (role: "student" | "teacher", email: string) => {
    setUserRole(role);
    // Extract name from email for display
    const name = email.split("@")[0].replace(/[._]/g, " ");
    setUserName(name.charAt(0).toUpperCase() + name.slice(1));
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName("");
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === "student") {
    return <StudentDashboard userName={userName} onLogout={handleLogout} />;
  }

  return <TeacherDashboard onLogout={handleLogout} />;
}
