"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { UploadModal } from "@/components/upload-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { FloatingMenu } from "@/components/floating-menu";
import { Upload, LogOut, Calendar, FileText } from "lucide-react";

interface StudentDashboardProps {
  userName: string;
  onLogout: () => void;
}

// Mock data for available assignments
const mockAssignments = [
  {
    id: 1,
    title: "Database Design Project",
    description: "Design and implement a relational database schema for an e-commerce application.",
    deadline: "2026-04-15",
  },
  {
    id: 2,
    title: "Algorithm Analysis Report",
    description: "Analyze the time complexity of sorting algorithms and provide benchmarks.",
    deadline: "2026-04-20",
  },
  {
    id: 3,
    title: "Web Development Portfolio",
    description: "Create a personal portfolio website using modern web technologies.",
    deadline: "2026-04-25",
  },
];

// Mock data for student submissions
const mockSubmissions = [
  {
    id: 1,
    assignmentName: "Database Design Project",
    version: "v2",
    uploadDate: "2026-04-08",
    status: "submitted",
  },
  {
    id: 2,
    assignmentName: "Algorithm Analysis Report",
    version: "v1",
    uploadDate: "2026-04-05",
    status: "under review",
  },
];

export function StudentDashboard({ userName, onLogout }: StudentDashboardProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [submissions, setSubmissions] = useState(mockSubmissions);

  const handleUploadClick = (assignmentTitle: string) => {
    setSelectedAssignment(assignmentTitle);
    setUploadModalOpen(true);
  };

  const handleUploadSubmit = (file: File) => {
    const existingSubmission = submissions.find(
      (s) => s.assignmentName === selectedAssignment
    );
    const newVersion = existingSubmission
      ? `v${parseInt(existingSubmission.version.slice(1)) + 1}`
      : "v1";

    const newSubmission = {
      id: submissions.length + 1,
      assignmentName: selectedAssignment,
      version: newVersion,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "submitted",
    };

    setSubmissions((prev) => {
      const filtered = prev.filter((s) => s.assignmentName !== selectedAssignment);
      return [...filtered, newSubmission];
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-500 dark:border-orange-500/30 hover:bg-orange-200 dark:hover:bg-orange-500/25">
            Submitted
          </Badge>
        );
      case "under review":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-500 dark:border-amber-500/30 hover:bg-amber-200 dark:hover:bg-amber-500/25">
            Under Review
          </Badge>
        );
      case "graded":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-500 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-500/25">
            Graded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, <span className="font-medium text-orange-500">{userName}</span>
            </span>
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
        <div className="grid gap-8">
          {/* Available Assignments Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Available Assignments
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockAssignments.map((assignment) => (
                <Card 
                  key={assignment.id}
                  className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg dark:shadow-none transition-all duration-300 hover:-translate-y-1 dark:hover:orange-glow-sm"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-orange-500 transition-colors duration-200">
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                      {assignment.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span>Due: {assignment.deadline}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUploadClick(assignment.title)}
                        className="rounded-xl gradient-button font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* My Submissions Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              My Submissions
            </h2>
            <Card className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm dark:shadow-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-secondary/50 hover:bg-muted/50 dark:hover:bg-secondary/50 border-border">
                      <TableHead className="font-semibold text-foreground">Assignment</TableHead>
                      <TableHead className="font-semibold text-foreground">Version</TableHead>
                      <TableHead className="font-semibold text-foreground">Upload Date</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground/50" />
                            <span>No submissions yet</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissions.map((submission) => (
                        <TableRow 
                          key={submission.id}
                          className="transition-colors duration-200 hover:bg-muted/30 dark:hover:bg-secondary/30 border-border"
                        >
                          <TableCell className="font-medium text-foreground">
                            {submission.assignmentName}
                          </TableCell>
                          <TableCell>
                            {getVersionBadge(submission.version)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {submission.uploadDate}
                          </TableCell>
                          <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        assignmentTitle={selectedAssignment}
        onSubmit={handleUploadSubmit}
      />

      <FloatingMenu
        onHomeClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onUploadClick={() => {
          setSelectedAssignment(mockAssignments[0].title);
          setUploadModalOpen(true);
        }}
        onCenterClick={() => {
          setSelectedAssignment(mockAssignments[0].title);
          setUploadModalOpen(true);
        }}
        onShareClick={() => alert("Share feature coming soon!")}
        onFavoriteClick={() => alert("Favorites feature coming soon!")}
      />
    </div>
  );
}
