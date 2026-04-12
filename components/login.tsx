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
import { Loader2, AlertCircle } from "lucide-react";

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
        await signUp(email, password, name.trim(), role);
        toast.success("Account created! Welcome aboard 🎉", {
          description: `Signing you in as ${role}...`,
        });
      } else {
        await signIn(email, password);
        toast.success("Welcome back!", {
          description: "Redirecting to your dashboard...",
        });
      }

      const profile = await getUserProfileWithRetry();

      if (profile?.role === "student") {
        router.replace("/student-dashboard");
      } else if (profile?.role === "teacher") {
        router.replace("/teacher-dashboard");
      } else {
        const failMsg =
          "Your profile could not be loaded. Check Supabase profiles table and RLS policies.";
        setError(failMsg);
        toast.error(failMsg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (!isSignup) {
        toast.error("Invalid email or password");
      } else if (
        /already registered|already exists/i.test(msg) ||
        msg.includes("Invalid login credentials") ||
        msg.includes("Invalid")
      ) {
        toast.error("Invalid email or password");
      } else {
        toast.error(msg.length > 160 ? "Invalid email or password" : msg);
      }
      setError("");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: "signin" | "signup") => { setTab(t); setError(""); };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-muted dark:bg-background"
      style={{
        backgroundImage:
          "linear-gradient(105deg, rgba(15,15,20,0.88) 0%, rgba(80,20,20,0.75) 100%), url(https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="absolute top-0 right-0 z-10 p-4">
        <ThemeToggle className="border-white/30 bg-black/20 text-white hover:bg-white/10 hover:text-white" />
      </header>

      <div className="relative z-[1] flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md" style={{ animation: "slideUp 0.4s ease both" }}>
          <Card className="rounded-2xl border border-white/20 bg-card/95 shadow-2xl backdrop-blur-md dark:bg-card/90 dark:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex justify-center">
                <img
                  src="/iilm-logo.svg"
                  alt="IILM University"
                  width={120}
                  height={120}
                  className="h-24 w-24 rounded-2xl object-cover shadow-lg ring-2 ring-orange-500/20 sm:h-28 sm:w-28"
                />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                IILM University
              </p>
              <CardTitle className="mt-1 text-2xl font-bold text-foreground">Assignment Submission</CardTitle>
              <CardDescription className="text-muted-foreground">
                {isSignup ? "Create your account" : "Sign in here to access your dashboard"}
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
                    aria-label={t === "signin" ? "Sign in tab" : "Sign up tab"}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 ${
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
                      className="h-11 rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
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
                    className="h-11 rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
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
                    className="h-11 rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
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
                  className="w-full mt-2 h-11 rounded-xl gradient-button font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
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
