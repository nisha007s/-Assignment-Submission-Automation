"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Upload, LogOut, Calendar, FileText,
  Search, ClipboardList, CheckCircle, Clock, Eye,
} from "lucide-react";

interface StudentDashboardProps {
  userName: string;
  onLogout: () => void;
}

// ── Mock data (unchanged) ───────────────────────────────────────────────────
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

const mockSubmissions = [
  { id: 1, assignmentName: "Database Design Project", version: "v2", uploadDate: "2026-04-08", status: "submitted" },
  { id: 2, assignmentName: "Algorithm Analysis Report", version: "v1", uploadDate: "2026-04-05", status: "under review" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function getDeadlineInfo(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0)  return { label: "Overdue", cls: "text-red-500 font-medium" };
  if (days <= 2) return { label: `${days}d left`, cls: "text-red-500 font-medium" };
  if (days <= 5) return { label: `${days}d left`, cls: "text-amber-500 font-medium" };
  return { label: `${days}d left`, cls: "text-muted-foreground" };
}

export function StudentDashboard({ userName, onLogout }: StudentDashboardProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [search, setSearch] = useState("");

  // ── Existing handlers (unchanged) ────────────────────────────────────────
  const handleUploadClick = (assignmentTitle: string) => {
    setSelectedAssignment(assignmentTitle);
    setUploadModalOpen(true);
  };

  const handleUploadSubmit = (file: File) => {
    const existingSubmission = submissions.find((s) => s.assignmentName === selectedAssignment);
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
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-500 dark:border-orange-500/30 hover:bg-orange-200 dark:hover:bg-orange-500/25">Submitted</Badge>;
      case "under review":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-500 dark:border-amber-500/30 hover:bg-amber-200 dark:hover:bg-amber-500/25">Under Review</Badge>;
      case "graded":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-500 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-500/25">Graded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVersionBadge = (version: string) => (
    <Badge className="bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 font-mono text-xs px-2 py-0.5">
      {version}
    </Badge>
  );

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:       mockAssignments.length,
    submitted:   submissions.filter((s) => s.status === "submitted").length,
    pending:     mockAssignments.length - submissions.length,
    underReview: submissions.filter((s) => s.status === "under review").length,
  }), [submissions]);

  // ── Filtered assignments ─────────────────────────────────────────────────
  const filteredAssignments = useMemo(() =>
    mockAssignments.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const statCards = [
    { label: "Total",       value: stats.total,       icon: ClipboardList, color: "text-orange-500" },
    { label: "Submitted",   value: stats.submitted,   icon: CheckCircle,   color: "text-emerald-500" },
    { label: "Pending",     value: stats.pending,     icon: Clock,         color: "text-amber-500" },
    { label: "Under Review",value: stats.underReview, icon: Eye,           color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-muted dark:bg-background transition-colors duration-300">
      {/* Header (unchanged) */}
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
              variant="outline" size="sm" onClick={onLogout}
              className="rounded-xl border-border bg-card dark:bg-secondary transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-500 dark:hover:border-red-500/30"
            >
              <LogOut className="mr-2 h-4 w-4" />Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-28">
        <div className="grid gap-8">

          {/* ── NEW: Stats Cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <Card
                key={s.label}
                className="rounded-2xl border border-border bg-card shadow-sm"
                style={{ animation: `slideUp 0.35s ease both`, animationDelay: `${i * 0.07}s` }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted dark:bg-secondary shrink-0">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Available Assignments ────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Available Assignments
              </h2>
              {/* NEW: Search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search assignments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 rounded-xl bg-card border-border text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssignments.length === 0 ? (
                <div className="col-span-3 flex flex-col items-center gap-2 py-14 text-muted-foreground">
                  <Search className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No assignments match your search.</p>
                </div>
              ) : filteredAssignments.map((assignment, i) => {
                const dl = getDeadlineInfo(assignment.deadline);
                const isSubmitted = submissions.some((s) => s.assignmentName === assignment.title);
                return (
                  <Card
                    key={assignment.id}
                    className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg dark:shadow-none transition-all duration-300 hover:-translate-y-1 dark:hover:orange-glow-sm"
                    style={{ animation: `slideUp 0.35s ease both`, animationDelay: `${i * 0.08}s` }}
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
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            <span>Due: {assignment.deadline}</span>
                          </div>
                          {/* NEW: Deadline urgency indicator */}
                          <span className={`text-xs ${dl.cls}`}>{dl.label}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleUploadClick(assignment.title)}
                          className="rounded-xl gradient-button font-medium transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
                        >
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                          {isSubmitted ? "Resubmit" : "Upload"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* ── My Submissions (unchanged structure) ────────────────────── */}
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
                          <TableCell className="font-medium text-foreground">{submission.assignmentName}</TableCell>
                          <TableCell>{getVersionBadge(submission.version)}</TableCell>
                          <TableCell className="text-muted-foreground">{submission.uploadDate}</TableCell>
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
        onUploadClick={() => { setSelectedAssignment(mockAssignments[0].title); setUploadModalOpen(true); }}
        onCenterClick={() => { setSelectedAssignment(mockAssignments[0].title); setUploadModalOpen(true); }}
        onSearchClick={() => document.querySelector<HTMLInputElement>("input[placeholder*='Search']")?.focus()}
        centerLabel="Upload Assignment"
      />
    </div>
  );
}
