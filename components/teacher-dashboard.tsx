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
import { LogOut, Download, Plus, GraduationCap } from "lucide-react";

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Create Assignment Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </CardTitle>
                <CardDescription>Add a new assignment for students</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAssignment}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="title">Title</FieldLabel>
                      <Input
                        id="title"
                        placeholder="Assignment title"
                        value={newAssignment.title}
                        onChange={(e) =>
                          setNewAssignment((prev) => ({ ...prev, title: e.target.value }))
                        }
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="description">Description</FieldLabel>
                      <Textarea
                        id="description"
                        placeholder="Assignment description"
                        value={newAssignment.description}
                        onChange={(e) =>
                          setNewAssignment((prev) => ({ ...prev, description: e.target.value }))
                        }
                        rows={3}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
                      <Input
                        id="deadline"
                        type="date"
                        value={newAssignment.deadline}
                        onChange={(e) =>
                          setNewAssignment((prev) => ({ ...prev, deadline: e.target.value }))
                        }
                        required
                      />
                    </Field>
                    <Button type="submit" className="w-full">
                      Create Assignment
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>

            {/* Current Assignments */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Current Assignments</CardTitle>
                <CardDescription>{assignments.length} assignments created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-3 rounded-lg border border-border bg-secondary/30"
                    >
                      <p className="font-medium text-sm">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {assignment.deadline}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Submissions Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Student Submissions</CardTitle>
                <CardDescription>
                  View and download student assignment submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStudentSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.studentName}
                        </TableCell>
                        <TableCell>{submission.assignmentName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{submission.latestVersion}</Badge>
                        </TableCell>
                        <TableCell>{submission.submissionDate}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownload(submission.studentName, submission.assignmentName)
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
