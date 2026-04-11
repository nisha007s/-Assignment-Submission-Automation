"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getVersionHistory } from "@/lib/database";
import type { SubmissionVersionRecord } from "@/lib/database";
import { getVersionHistorySignedUrl } from "@/lib/storage";
import { Download, FileText, Loader2 } from "lucide-react";

export interface VersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  studentId: string;
  /** Shown under title, e.g. "Student · Assignment" */
  subtitle: string;
  /** When true, each row shows a download button (signed URL, 60s). */
  isTeacher: boolean;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatUploadDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso.split("T")[0] ?? iso;
  }
}

export function VersionHistory({
  open,
  onOpenChange,
  assignmentId,
  studentId,
  subtitle,
  isTeacher,
}: VersionHistoryProps) {
  const [rows, setRows] = useState<SubmissionVersionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !assignmentId || !studentId) {
      setRows([]);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    void getVersionHistory(assignmentId, studentId)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load history";
          setLoadError(msg);
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, assignmentId, studentId]);

  const handleDownload = useCallback(
    async (entry: SubmissionVersionRecord) => {
      if (!entry.file_url) {
        toast.error("No file", { description: "This version has no storage path." });
        return;
      }
      const safeName = entry.file_name?.replace(/[/\\]/g, "_") || `v${entry.version}-submission`;
      setDownloadingId(entry.id);
      try {
        let lastErr: unknown;
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const url = await getVersionHistorySignedUrl(entry.file_url);
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = safeName;
            a.rel = "noopener";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(objectUrl);
            toast.success("Download started", { description: safeName });
            return;
          } catch (e) {
            lastErr = e;
          }
        }
        throw lastErr instanceof Error ? lastErr : new Error("Download failed");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Download failed";
        toast.error("Download failed", {
          description: `${message} Try again (signed links expire quickly).`,
        });
      } finally {
        setDownloadingId(null);
      }
    },
    []
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-card border-border w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="p-5 pb-3 border-b border-border text-left shrink-0">
          <SheetTitle className="text-foreground">Version history</SheetTitle>
          <SheetDescription className="text-muted-foreground">{subtitle}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-sm">Loading versions…</p>
            </div>
          )}

          {!loading && loadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 p-4 text-sm text-red-700 dark:text-red-400">
              {loadError}
            </div>
          )}

          {!loading && !loadError && rows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <FileText className="h-10 w-10 opacity-40" />
              <p className="text-sm">No submissions for this assignment yet.</p>
            </div>
          )}

          {!loading && !loadError && rows.length > 0 && (
            <ul className="space-y-3">
              {rows.map((entry, index) => {
                const isLatest = index === 0;
                return (
                  <li
                    key={entry.id}
                    className={`rounded-xl border bg-muted/30 dark:bg-secondary/20 p-3 transition-colors ${
                      isLatest
                        ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-card border-orange-500/40"
                        : "border-border hover:border-orange-500/30"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isLatest
                              ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30"
                              : "bg-muted dark:bg-secondary text-muted-foreground"
                          }`}
                        >
                          v{entry.version}
                        </div>
                        {index < rows.length - 1 && (
                          <div className="w-px flex-1 bg-border min-h-[12px]" aria-hidden />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {isLatest && (
                              <Badge className="text-[10px] px-1.5 py-0 h-5 mb-1.5 bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30">
                                Latest
                              </Badge>
                            )}
                            <p className="text-sm font-medium text-foreground truncate" title={entry.file_name}>
                              {entry.file_name || "Unnamed file"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatUploadDate(entry.created_at)} · {formatFileSize(entry.file_size)}
                            </p>
                            {entry.version_note && (
                              <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                                {entry.version_note}
                              </p>
                            )}
                          </div>
                          {isTeacher && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!entry.file_url || downloadingId === entry.id}
                              className="h-8 w-8 p-0 shrink-0 rounded-lg hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-500/10"
                              aria-label={`Download version ${entry.version}`}
                              onClick={() => void handleDownload(entry)}
                            >
                              {downloadingId === entry.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
