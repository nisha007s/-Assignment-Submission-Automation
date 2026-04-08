"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { ThemeToggle } from "@/components/theme-toggle";
import { FloatingMenu } from "@/components/floating-menu";
import { LogOut, Download, Plus, GraduationCap, Calendar, FileText } from "lucide-react";

interface TeacherDashboardProps {
  onLogout: () => void;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
}

// Mock data for student submissions
const mockStudentSubmissions = [
  {
    id: 1,
    studentName: "Alice Johnson",
    assignmentName: "Database Design Project",
    latestVersion: "v2",
    submissionDate: "2026-04-08",
  },
  {
    id: 2,
    studentName: "Bob Smith",
    assignmentName: "Algorithm Analysis Report",
    latestVersion: "v1",
    submissionDate: "2026-04-07",
  },
  {
    id: 3,
    studentName: "Carol Williams",
    assignmentName: "Database Design Project",
    latestVersion: "v3",
    submissionDate: "2026-04-08",
  },
  {
    id: 4,
    studentName: "David Brown",
    assignmentName: "Web Development Portfolio",
    latestVersion: "v1",
    submissionDate: "2026-04-06",
  },
  {
    id: 5,
    studentName: "Emma Davis",
    assignmentName: "Algorithm Analysis Report",
    latestVersion: "v2",
    submissionDate: "2026-04-08",
  },
];

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 1,
      title: "Database Design Project",
      description: "Design and implement a relational database schema.",
      deadline: "2026-04-15",
    },
    {
      id: 2,
      title: "Algorithm Analysis Report",
      description: "Analyze the time complexity of sorting algorithms.",
      deadline: "2026-04-20",
    },
  ]);

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssignment.title && newAssignment.description && newAssignment.deadline) {
      const assignment: Assignment = {
        id: assignments.length + 1,
        ...newAssignment,
      };
      setAssignments((prev) => [...prev, assignment]);
      setNewAssignment({ title: "", description: "", deadline: "" });
    }
  };

  const handleDownload = (studentName: string, assignmentName: string) => {
    // Mock download functionality
    alert(`Downloading ${assignmentName} from ${studentName}`);
  };

  const getVersionBadge = (version: string) => {
    return (
      <Badge className="bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 font-mono text-xs px-2 py-0.5">
        {version}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-muted dark:bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 dark:bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Teacher Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="rounded-xl border-border bg-card dark:bg-secondary transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-500 dark:hover:border-red-500/30"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Create Assignment Section */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  Create Assignment
                </CardTitle>
                <CardDescription className="text-muted-foreground">Add a new assignment for students</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAssignment}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="title" className="text-foreground">Title</FieldLabel>
                      <Input
                        id="title"
                        placeholder="Assignment title"
                        value={newAssignment.title}
                        onChange={(e) =>
                          setNewAssignment((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="description" className="text-foreground">Description</FieldLabel>
                      <Textarea
                        id="description"
                        placeholder="Assignment description"
                        value={newAssignment.description}
                        onChange={(e) =>
                          setNewAssignment((prev) => ({ ...prev, description: e.target.value }))
                        }
                        rows={3}
                        className="rounded-xl resize-none bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="deadline" className="text-foreground">Deadline</FieldLabel>
                      <Input
                        id="deadline"
                        type="date"
                        value={newAssignment.deadline}
                        onChange={(e) =>
                          setNewAssignment((prev) => ({ ...prev, deadline: e.target.value }))
                        }
                        className="rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                        required
                      />
                    </Field>
                    <Button 
                      type="submit" 
                      className="w-full rounded-xl gradient-button font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Create Assignment
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>

            {/* Current Assignments */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  Current Assignments
                </CardTitle>
                <CardDescription className="text-muted-foreground">{assignments.length} assignments created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="group p-4 rounded-xl border border-border bg-muted/30 dark:bg-secondary/30 transition-all duration-200 hover:bg-muted/50 dark:hover:bg-secondary/50 hover:border-orange-500/30"
                    >
                      <p className="font-medium text-sm text-foreground group-hover:text-orange-500 transition-colors duration-200">
                        {assignment.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                        {assignment.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 text-orange-500" />
                        <span>Due: {assignment.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Submissions Section */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Student Submissions
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  View and download student assignment submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-secondary/50 hover:bg-muted/50 dark:hover:bg-secondary/50 border-border">
                      <TableHead className="font-semibold text-foreground">Student</TableHead>
                      <TableHead className="font-semibold text-foreground">Assignment</TableHead>
                      <TableHead className="font-semibold text-foreground">Version</TableHead>
                      <TableHead className="font-semibold text-foreground">Date</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStudentSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground/50" />
                            <span>No submissions yet</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      mockStudentSubmissions.map((submission) => (
                        <TableRow 
                          key={submission.id}
                          className="transition-colors duration-200 hover:bg-muted/30 dark:hover:bg-secondary/30 border-border"
                        >
                          <TableCell className="font-medium text-foreground">
                            {submission.studentName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {submission.assignmentName}
                          </TableCell>
                          <TableCell>
                            {getVersionBadge(submission.latestVersion)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {submission.submissionDate}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDownload(submission.studentName, submission.assignmentName)
                              }
                              className="rounded-lg hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-500 transition-all duration-200"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <FloatingMenu
        onHomeClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onUploadClick={() => alert("Upload feature for teachers coming soon!")}
        onCenterClick={() => {
          // Focus on the create assignment form
          document.getElementById("title")?.focus();
        }}
        onShareClick={() => alert("Share feature coming soon!")}
        onFavoriteClick={() => alert("Favorites feature coming soon!")}
      />
    </div>
  );
}
