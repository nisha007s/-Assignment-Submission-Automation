"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UploadModal } from "@/components/upload-modal";
import { VersionHistory } from "@/components/version-history";
import { FloatingMenu } from "@/components/floating-menu";
import { UniversityHeader } from "@/components/ui/university-header";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { resolveAssignmentHandoutUrl } from "@/lib/storage";
import { getAssignments, getStudentSubmissions, type AssignmentRecord } from "@/lib/database";
import {
  Upload, Calendar, FileText,
  ClipboardList, CheckCircle, Clock, Eye, Download,
} from "lucide-react";

interface StudentDashboardProps {
  userId: string;
  userName: string;
  onLogout: () => void;
}

interface StudentSubmissionView {
  id: string;
  assignmentId: string;
  assignmentName: string;
  version: string;
  uploadDate: string;
  status: string;
  grade: number | null;
  feedback: string | null;
}

interface HistoryOpen {
  assignmentId: string;
  assignmentName: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getDeadlineInfo(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0)  return { label: "Overdue", cls: "text-red-500 font-medium" };
  if (days <= 2) return { label: `${days}d left`, cls: "text-red-500 font-medium" };
  if (days <= 5) return { label: `${days}d left`, cls: "text-amber-500 font-medium" };
  return { label: `${days}d left`, cls: "text-muted-foreground" };
}

function gradeScoreColorClass(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-500";
  return "text-red-600 dark:text-red-400";
}

export function StudentDashboard({ userId, userName, onLogout }: StudentDashboardProps) {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [submissions, setSubmissions] = useState<StudentSubmissionView[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState<HistoryOpen | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentRows, submissionRows] = await Promise.all([
        getAssignments(),
        getStudentSubmissions(),
      ]);
      setAssignments(assignmentRows);
      setSubmissions(
        submissionRows.map((row) => ({
          id: row.id,
          assignmentId: row.assignment_id,
          assignmentName: row.assignment_title,
          version: `v${row.version}`,
          uploadDate: row.created_at.split("T")[0],
          status: row.status.replace("_", " "),
          grade: row.grade ?? null,
          feedback: row.feedback ?? null,
        }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(message);
      toast.error("Could not load dashboard", { description: message, id: "student-dashboard-load" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("student-assignments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assignments" },
        () => {
          void loadData();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("student-submissions-realtime")
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

  // ── Existing handlers (unchanged) ────────────────────────────────────────
  const handleUploadClick = (assignment: AssignmentRecord) => {
    setSelectedAssignment(assignment.title);
    setSelectedAssignmentId(assignment.id);
    setUploadModalOpen(true);
  };

  const handleDownloadHandout = async (assignment: AssignmentRecord) => {
    const url = assignment.file_url?.trim();
    if (!url) return;
    try {
      const resolved = await resolveAssignmentHandoutUrl(url);
      window.open(resolved, "_blank", "noopener,noreferrer");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      toast.error("Could not open assignment file", { description: message });
    }
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
    total:       assignments.length,
    submitted:   submissions.filter((s) => s.status === "submitted").length,
    pending:     assignments.length - submissions.length,
    underReview: submissions.filter((s) => s.status === "under review").length,
  }), [assignments.length, submissions]);

  // ── Filtered assignments ─────────────────────────────────────────────────
  const filteredAssignments = useMemo(() =>
    assignments.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description ?? "").toLowerCase().includes(search.toLowerCase())
    ), [assignments, search]);

  const statCards = [
    { label: "Total",       value: stats.total,       icon: ClipboardList, color: "text-orange-500" },
    { label: "Submitted",   value: stats.submitted,   icon: CheckCircle,   color: "text-emerald-500" },
    { label: "Pending",     value: stats.pending,     icon: Clock,         color: "text-amber-500" },
    { label: "Under Review",value: stats.underReview, icon: Eye,           color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-muted dark:bg-background transition-colors duration-300">
      <UniversityHeader
        userName={userName}
        onLogout={onLogout}
        roleLabel="Student Dashboard"
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assignments…"
      />

      <main className="container mx-auto px-4 py-8 pb-28">
        <div className="grid gap-8">
          {error && (
            <Card className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                <Button variant="outline" size="sm" onClick={() => void loadData()}>Retry</Button>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="rounded-2xl border border-border bg-card shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-7 w-12" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <section>
                <Skeleton className="h-6 w-48 mb-4 rounded-md" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="rounded-2xl border border-border bg-card">
                      <CardHeader className="pb-3 space-y-2">
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-8 w-24 rounded-lg" />
                          <Skeleton className="h-8 w-28 rounded-lg" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
              <section>
                <Skeleton className="h-6 w-40 mb-4 rounded-md" />
                <Card className="rounded-2xl border border-border bg-card">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              </section>
            </>
          ) : (
            <>
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
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Available Assignments
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssignments.length === 0 ? (
                <div className="col-span-3 flex flex-col items-center gap-2 py-14 text-muted-foreground">
                  <FileText className="h-8 w-8 opacity-30" />
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
                        {assignment.description ?? "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex min-w-0 flex-col gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                            <span className="truncate">Due: {assignment.deadline}</span>
                          </div>
                          <span className={`text-xs ${dl.cls}`}>{dl.label}</span>
                        </div>
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          {assignment.file_url ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  title="Download assignment"
                                  aria-label="Download assignment handout"
                                  onClick={() => void handleDownloadHandout(assignment)}
                                  className="h-8 shrink-0 gap-1 rounded-lg border-red-200/80 bg-background px-2.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-500/25 dark:bg-secondary dark:text-red-300 dark:hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                                >
                                  <Download className="h-3.5 w-3.5 shrink-0" />
                                  <span>Download</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[220px]">
                                Download assignment
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleUploadClick(assignment)}
                            aria-label={
                              isSubmitted
                                ? `Resubmit assignment: ${assignment.title}`
                                : `Upload submission for ${assignment.title}`
                            }
                            className="h-8 shrink-0 gap-1 rounded-lg px-2.5 text-xs font-medium gradient-button transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                          >
                            <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            {isSubmitted ? "Resubmit" : "Upload"}
                          </Button>
                        </div>
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
                <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-secondary/50 hover:bg-muted/50 dark:hover:bg-secondary/50 border-border">
                      <TableHead className="font-semibold text-foreground">Assignment</TableHead>
                      <TableHead className="font-semibold text-foreground">Version</TableHead>
                      <TableHead className="font-semibold text-foreground">Upload Date</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Grade</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
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
                          <TableCell>
                            {submission.status === "graded" && submission.grade != null ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "h-8 px-2 font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40",
                                      gradeScoreColorClass(submission.grade)
                                    )}
                                    aria-label={`Grade ${submission.grade} out of 100. Click for feedback.`}
                                  >
                                    {submission.grade}/100
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="start">
                                  <p className="text-sm font-medium text-foreground mb-2">Instructor feedback</p>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {submission.feedback?.trim()
                                      ? submission.feedback
                                      : "No written feedback."}
                                  </p>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                              aria-label={`View submission history for ${submission.assignmentName}`}
                              onClick={() =>
                                setHistoryOpen({
                                  assignmentId: submission.assignmentId,
                                  assignmentName: submission.assignmentName,
                                })
                              }
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              History
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </section>
            </>
          )}
        </div>
      </main>

      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        assignmentTitle={selectedAssignment}
        assignmentId={selectedAssignmentId}
        onSuccess={() => void loadData()}
      />

      <VersionHistory
        open={!!historyOpen}
        onOpenChange={(o) => !o && setHistoryOpen(null)}
        assignmentId={historyOpen?.assignmentId ?? ""}
        studentId={userId}
        subtitle={historyOpen ? `${userName} · ${historyOpen.assignmentName}` : ""}
        isTeacher={false}
      />

      <FloatingMenu
        onHomeClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onUploadClick={() => {
          if (assignments.length === 0) {
            alert("No assignments available");
            return;
          }
          handleUploadClick(assignments[0]);
        }}
        onCenterClick={() => {
          if (assignments.length === 0) {
            alert("No assignments available");
            return;
          }
          handleUploadClick(assignments[0]);
        }}
        onSearchClick={() => document.querySelector<HTMLInputElement>("input[placeholder*='Search']")?.focus()}
        centerLabel="Upload Assignment"
      />
    </div>
  );
}
