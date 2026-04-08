"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen } from "lucide-react";

interface LoginProps {
  onLogin: (role: "student" | "teacher", email: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(role, email);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with theme toggle */}
      <header className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl border-border/50 bg-card shadow-2xl transition-all duration-300 hover:orange-glow-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 orange-glow-sm">
              <BookOpen className="h-7 w-7 text-black" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-500">
              Assignment Submission
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email" className="text-foreground">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl bg-secondary border-border/50 transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password" className="text-foreground">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl bg-secondary border-border/50 transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="role" className="text-foreground">Role</FieldLabel>
                  <Select value={role} onValueChange={(v) => setRole(v as "student" | "teacher")}>
                    <SelectTrigger id="role" className="h-11 rounded-xl bg-secondary border-border/50">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-card border-border/50">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Button 
                  type="submit" 
                  className="w-full mt-4 h-11 rounded-xl gradient-button text-black font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
