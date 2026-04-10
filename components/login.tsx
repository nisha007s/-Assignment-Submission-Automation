"use client";

import { useState } from "react";
import { signIn, signUp, getUserProfileWithRetry } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";

// No props needed — routing handled by useAuth in page.tsx
export function Login() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = tab === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) { setError("Please fill in all required fields."); return; }
    if (isSignup && !name.trim()) { setError("Please enter your full name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      if (isSignup) {
        const signUpData = await signUp(email, password, name.trim(), role);
        console.log("[login] signUp success", signUpData);
        toast.success("Account created! Welcome aboard 🎉", {
          description: `Signing you in as ${role}...`,
        });
      } else {
        const signInData = await signIn(email, password);
        console.log("[login] signIn success", signInData);
        toast.success("Welcome back!", {
          description: "Redirecting to your dashboard...",
        });
      }

      const profile = await getUserProfileWithRetry();
      console.log("[login] profile after auth", profile);

      if (profile?.role === "student") {
        router.replace("/student-dashboard");
      } else if (profile?.role === "teacher") {
        router.replace("/teacher-dashboard");
      } else {
        setError("Your profile could not be loaded. Check Supabase profiles table and RLS policies.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      // Map Supabase error messages to user-friendly text
      if (msg.includes("Invalid login credentials")) setError("Incorrect email or password.");
      else if (msg.includes("User already registered")) setError("An account with this email already exists.");
      else if (msg.includes("Password should be")) setError("Password must be at least 6 characters.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: "signin" | "signup") => { setTab(t); setError(""); };

  return (
    <div className="flex min-h-screen flex-col bg-muted dark:bg-background">
      <header className="absolute top-0 right-0 p-4 z-10">
        <ThemeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md" style={{ animation: "slideUp 0.4s ease both" }}>
          <Card className="rounded-2xl border border-border bg-card shadow-lg dark:shadow-2xl transition-shadow duration-300">
            {/* Logo + title */}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-orange-500">Assignment Submission</CardTitle>
              <CardDescription className="text-muted-foreground">
                {isSignup ? "Create your account" : "Sign in to access your dashboard"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              {/* Sign In / Sign Up tabs */}
              <div className="flex rounded-xl bg-muted dark:bg-secondary p-1 mb-5">
                {(["signin", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => switchTab(t)}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      tab === t
                        ? "bg-card shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full Name — signup only */}
                {isSignup && (
                  <div className="space-y-1.5" style={{ animation: "fadeIn 0.25s ease both" }}>
                    <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    required
                  />
                </div>

                {/* Role — signup only */}
                {isSignup && (
                  <div className="space-y-1.5" style={{ animation: "fadeIn 0.25s ease both" }}>
                    <label htmlFor="role" className="text-sm font-medium text-foreground">Role</label>
                    <Select value={role} onValueChange={(v) => setRole(v as "student" | "teacher")}>
                      <SelectTrigger id="role" className="h-11 rounded-xl bg-secondary border-border">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-card border-border">
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 h-11 rounded-xl gradient-button font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isSignup ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : (
                    isSignup ? "Create Account" : "Sign In"
                  )}
                </Button>

                {/* Switch mode hint */}
                <p className="text-center text-xs text-muted-foreground pt-1">
                  {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => switchTab(isSignup ? "signin" : "signup")}
                    className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    {isSignup ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
