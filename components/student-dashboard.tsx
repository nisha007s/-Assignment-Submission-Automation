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
        return <Badge variant="default">Submitted</Badge>;
      case "under review":
        return <Badge variant="secondary">Under Review</Badge>;
      case "graded":
        return <Badge className="bg-accent text-accent-foreground">Graded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Welcome, {userName}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
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
            <h2 className="text-lg font-semibold mb-4">Available Assignments</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{assignment.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {assignment.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {assignment.deadline}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUploadClick(assignment.title)}
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
            <h2 className="text-lg font-semibold mb-4">My Submissions</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No submissions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {submission.assignmentName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{submission.version}</Badge>
                          </TableCell>
                          <TableCell>{submission.uploadDate}</TableCell>
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
    </div>
  );
}
