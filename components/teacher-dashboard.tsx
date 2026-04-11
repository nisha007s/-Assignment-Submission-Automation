"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { ThemeToggle } from "@/components/theme-toggle";
import { FloatingMenu } from "@/components/floating-menu";
import { supabase } from "@/lib/supabase";
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
  getAllSubmissions,
  type AssignmentRecord,
  type TeacherSubmissionRecord,
} from "@/lib/database";
import {
  LogOut, Download, Plus, GraduationCap, Calendar, FileText,
  Trash2, X, History, ClipboardList, CheckCircle, Clock,
} from "lucide-react";

interface TeacherDashboardProps {
  onLogout: () => void;
}

interface SubmissionView {
  id: string;
  studentName: string;
  assignmentName: string;
  latestVersion: string;
  submissionDate: string;
  status: string;
}

// Dummy version history for the history panel (UI only)
const dummyVersionHistory = [
  { version: "v3", date: "2026-04-08", size: "1.6 MB", note: "Final revision" },
  { version: "v2", date: "2026-04-06", size: "1.3 MB", note: "Added diagrams" },
  { version: "v1", date: "2026-04-04", size: "980 KB",  note: "Initial submission" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function isExpired(deadline: string) {
  return new Date(deadline) < new Date();
}

type Submission = SubmissionView;

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionView[]>([]);

  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", deadline: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── NEW UI state ─────────────────────────────────────────────────────────
  const [deleteTarget,  setDeleteTarget]  = useState<AssignmentRecord | null>(null);
  const [gradeTarget,   setGradeTarget]   = useState<Submission | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Submission | null>(null);
  const [gradeScore,    setGradeScore]    = useState("");

  const mapTeacherSubmissions = (rows: TeacherSubmissionRecord[]): SubmissionView[] =>
    rows.map((row) => ({
      id: row.id,
      studentName: row.student_name,
      assignmentName: row.assignment_title,
      latestVersion: `v${row.version}`,
      submissionDate: row.created_at.split("T")[0],
      status: row.status,
    }));

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentRows, submissionRows] = await Promise.all([
        getAssignments(),
        getAllSubmissions(),
      ]);
      setAssignments(assignmentRows);
      setSubmissions(mapTeacherSubmissions(submissionRows));
    }  catch (err) {
      console.error("CREATE ASSIGNMENT ERROR:", err); // 👈 ADD THIS LINE
    
      const message =
        err instanceof Error ? err.message : "Failed to create assignment";
    
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("teacher-submissions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => {
          void loadData();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssignment.title && newAssignment.description && newAssignment.deadline) {
      try {
        setFormLoading(true);
        const created = await createAssignment(
          newAssignment.title,
          newAssignment.description,
          newAssignment.deadline
        );
        setAssignments((prev) => [created, ...prev]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create assignment";
        setError(message);
      } finally {
        setFormLoading(false);
      }
      setNewAssignment({ title: "", description: "", deadline: "" });
    }
  };

  const handleDownload = (studentName: string, assignmentName: string) => {
    alert(`Downloading ${assignmentName} from ${studentName}`);
  };

  const getVersionBadge = (version: string) => (
    <Badge className="bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 font-mono text-xs px-2 py-0.5">
      {version}
    </Badge>
  );

  // ── Stats (derived, no logic change) ─────────────────────────────────────
  const stats = useMemo(() => ({
    assignments:  assignments.length,
    total:        submissions.length,
    pending:      submissions.filter((s) => s.status !== "graded").length,
    graded:       submissions.filter((s) => s.status === "graded").length,
  }), [assignments.length, submissions]);

  const statCards = [
    { label: "Assignments",   value: stats.assignments, icon: ClipboardList,  color: "text-orange-500" },
    { label: "Total Submitted",value: stats.total,       icon: FileText,       color: "text-blue-500" },
    { label: "Pending",        value: stats.pending,     icon: Clock,          color: "text-amber-500" },
    { label: "Graded",         value: stats.graded,      icon: CheckCircle,    color: "text-emerald-500" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "graded":       return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Graded</Badge>;
      case "under_review": return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">Under Review</Badge>;
      default:             return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400">Submitted</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted dark:bg-background transition-colors duration-300">
      {/* Header (unchanged) */}
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
              variant="outline" size="sm" onClick={onLogout}
              className="rounded-xl border-border bg-card dark:bg-secondary transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-500 dark:hover:border-red-500/30"
            >
              <LogOut className="mr-2 h-4 w-4" />Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-28">
        {error && (
          <Card className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 mb-6">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void loadData()}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* ── NEW: Stats Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <Card key={s.label} className="rounded-2xl border border-border bg-card shadow-sm"
              style={{ animation: "slideUp 0.35s ease both", animationDelay: `${i * 0.07}s` }}>
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left sidebar: Create + Assignment list */}
          <div className="lg:col-span-1 space-y-4">
            {/* Create Assignment (form logic unchanged) */}
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
                      <Input id="title" placeholder="Assignment title" value={newAssignment.title}
                        onChange={(e) => setNewAssignment((prev) => ({ ...prev, title: e.target.value }))}
                        className="rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="description" className="text-foreground">Description</FieldLabel>
                      <Textarea id="description" placeholder="Assignment description" value={newAssignment.description}
                        onChange={(e) => setNewAssignment((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3} className="rounded-xl resize-none bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="deadline" className="text-foreground">Deadline</FieldLabel>
                      <Input id="deadline" type="date" value={newAssignment.deadline}
                        onChange={(e) => setNewAssignment((prev) => ({ ...prev, deadline: e.target.value }))}
                        className="rounded-xl bg-secondary border-border transition-all duration-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" required />
                    </Field>
                    <Button type="submit" disabled={formLoading} className="w-full rounded-xl gradient-button font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      Create Assignment
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>

            {/* Current Assignments — with Active/Expired badge + Delete button */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />Current Assignments
                </CardTitle>
                <CardDescription className="text-muted-foreground">{assignments.length} assignments created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div key={assignment.id}
                      className="group p-3 rounded-xl border border-border bg-muted/30 dark:bg-secondary/30 transition-all duration-200 hover:bg-muted/50 dark:hover:bg-secondary/50 hover:border-orange-500/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground group-hover:text-orange-500 transition-colors truncate">
                            {assignment.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 text-orange-500" />
                              <span>{assignment.deadline}</span>
                            </div>
                            {/* NEW: Active / Expired badge */}
                            {isExpired(assignment.deadline) ? (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-red-100 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                                Expired
                              </Badge>
                            ) : (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* NEW: Delete button */}
                        <button
                          onClick={() => setDeleteTarget(assignment)}
                          aria-label="Delete assignment"
                          className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions table — with Status, Grade, History columns */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />Student Submissions
                </CardTitle>
                <CardDescription className="text-muted-foreground">View, grade and download student submissions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-secondary/50 hover:bg-muted/50 dark:hover:bg-secondary/50 border-border">
                      <TableHead className="font-semibold text-foreground">Student</TableHead>
                      <TableHead className="font-semibold text-foreground">Assignment</TableHead>
                      <TableHead className="font-semibold text-foreground">Ver</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}
                        className="transition-colors duration-200 hover:bg-muted/30 dark:hover:bg-secondary/30 border-border">
                        <TableCell className="font-medium text-foreground">{submission.studentName}</TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-[120px] truncate">{submission.assignmentName}</TableCell>
                        <TableCell>{getVersionBadge(submission.latestVersion)}</TableCell>
                        {/* NEW: Status badge */}
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Download (existing) */}
                            <Button variant="ghost" size="sm"
                              onClick={() => handleDownload(submission.studentName, submission.assignmentName)}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-500">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            {/* NEW: Grade button */}
                            <Button variant="ghost" size="sm"
                              onClick={() => { setGradeTarget(submission); setGradeScore(""); }}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                              aria-label="Grade submission">
                              <GraduationCap className="h-3.5 w-3.5" />
                            </Button>
                            {/* NEW: History button */}
                            <Button variant="ghost" size="sm"
                              onClick={() => setHistoryTarget(submission)}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                              aria-label="View history">
                              <History className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      <FloatingMenu
        onHomeClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onUploadClick={() => alert("Upload feature for teachers coming soon!")}
        onCenterClick={() => document.getElementById("title")?.focus()}
        onShareClick={() => alert("Share feature coming soon!")}
        onFavoriteClick={() => alert("Favorites feature coming soon!")}
      />

      {/* ── NEW: Delete Confirmation Modal ─────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl p-6"
            style={{ animation: "slideUp 0.25s ease both" }}>
            <button onClick={() => setDeleteTarget(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/10 mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Delete Assignment?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-medium text-foreground">"{deleteTarget.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                disabled={deleteLoading}
                onClick={async () => {
                  try {
                    setDeleteLoading(true);
                    await deleteAssignment(deleteTarget.id);
                    setAssignments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
                    setDeleteTarget(null);
                  } catch (err) {
                    const message = err instanceof Error ? err.message : "Failed to delete assignment";
                    setError(message);
                  } finally {
                    setDeleteLoading(false);
                  }
                }}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Grade Modal ──────────────────────────────────────────────── */}
      {gradeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setGradeTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl p-6"
            style={{ animation: "slideUp 0.25s ease both" }}>
            <button onClick={() => setGradeTarget(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 mb-4">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-0.5">Grade Submission</h3>
            <p className="text-sm text-muted-foreground mb-5">
              {gradeTarget.studentName} · <span className="text-foreground">{gradeTarget.assignmentName}</span> ({gradeTarget.latestVersion})
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Score (0 – 100)</label>
                <Input
                  type="number" min={0} max={100} placeholder="e.g. 85"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="rounded-xl bg-secondary border-border focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Feedback <span className="text-muted-foreground font-normal">(optional)</span></label>
                <Textarea rows={3} placeholder="Written feedback for the student..."
                  className="rounded-xl resize-none bg-secondary border-border focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setGradeTarget(null)}>Cancel</Button>
              <Button className="flex-1 rounded-xl gradient-button font-semibold"
                disabled={!gradeScore || Number(gradeScore) < 0 || Number(gradeScore) > 100}
                onClick={() => setGradeTarget(null)}>
                Submit Grade
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: History Panel ────────────────────────────────────────────── */}
      {historyTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setHistoryTarget(null)} />
          <div className="relative w-full sm:max-w-sm h-[70vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-xl flex flex-col overflow-hidden"
            style={{ animation: "slideUp 0.3s ease both" }}>
            {/* Panel header */}
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div>
                <h3 className="font-semibold text-foreground">Submission History</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{historyTarget.studentName} · {historyTarget.assignmentName}</p>
              </div>
              <button onClick={() => setHistoryTarget(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Version timeline */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {dummyVersionHistory.map((v, i) => (
                <div key={v.version}
                  className="flex gap-3 p-3 rounded-xl border border-border bg-muted/30 dark:bg-secondary/20 hover:border-orange-500/30 transition-colors group">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30"
                        : "bg-muted dark:bg-secondary text-muted-foreground"
                    }`}>
                      {v.version}
                    </div>
                    {i < dummyVersionHistory.length - 1 && (
                      <div className="w-px flex-1 bg-border min-h-[16px]" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {i === 0 && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 mb-1 bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">Latest</Badge>
                        )}
                        <p className="text-sm text-muted-foreground">{v.date} · {v.size}</p>
                        {v.note && <p className="text-xs text-muted-foreground mt-0.5 italic">"{v.note}"</p>}
                      </div>
                      {/* Download per version (teachers only) */}
                      <Button variant="ghost" size="sm"
                        onClick={() => alert(`Downloading ${v.version}`)}
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-500/10 transition-all">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
