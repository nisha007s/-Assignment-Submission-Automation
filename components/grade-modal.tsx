"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { gradeSubmission } from "@/lib/database";

export interface GradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  studentName: string;
  assignmentTitle: string;
  /** Version label, e.g. "v2" */
  versionLabel: string;
  fileName: string | null;
  initialGrade: number | null;
  initialFeedback: string | null;
  /** Called after a successful save so the parent can refresh lists */
  onSubmitted: () => void;
}

function parseGradeInput(raw: string): { ok: true; value: number } | { ok: false; message: string } {
  const t = raw.trim();
  if (t === "") return { ok: false, message: "Enter a grade between 0 and 100." };
  const n = Number(t);
  if (!Number.isFinite(n)) return { ok: false, message: "Enter a valid number." };
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) > 1e-6) {
    return { ok: false, message: "Grade must be a whole number." };
  }
  if (rounded < 0 || rounded > 100) return { ok: false, message: "Grade must be between 0 and 100." };
  return { ok: true, value: rounded };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Failed to save grade";
}

export function GradeModal({
  open,
  onOpenChange,
  submissionId,
  studentName,
  assignmentTitle,
  versionLabel,
  fileName,
  initialGrade,
  initialFeedback,
  onSubmitted,
}: GradeModalProps) {
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setGradeInput(initialGrade != null ? String(initialGrade) : "");
    setFeedbackInput(initialFeedback ?? "");
    setSubmitting(false);
  }, [open, submissionId, initialGrade, initialFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseGradeInput(gradeInput);
    if (!parsed.ok) {
      toast.error("Invalid grade", { description: parsed.message });
      return;
    }

    setSubmitting(true);
    try {
      await gradeSubmission(submissionId, parsed.value, feedbackInput.trim() || null);
      toast.success("Grade submitted");
      onOpenChange(false);
      onSubmitted();
    } catch (err) {
      console.error("[grade-modal] gradeSubmission failed", err);
      toast.error("Could not save grade", { description: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const latestVersionSummary = fileName
    ? `${versionLabel} · ${fileName}`
    : versionLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 mb-1">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-foreground">Grade submission</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1 text-muted-foreground text-sm text-left">
              <p>
                <span className="font-medium text-foreground">{studentName}</span>
                {" · "}
                <span className="text-foreground">{assignmentTitle}</span>
              </p>
              <p className="text-xs">
                Latest: <span className="text-foreground/90">{latestVersionSummary}</span>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grade-score" className="text-foreground">
              Score (0–100)
            </Label>
            <Input
              id="grade-score"
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              placeholder="e.g. 85"
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              disabled={submitting}
              className="rounded-xl bg-secondary border-border focus-visible:ring-orange-500/30"
              aria-describedby="grade-hint"
            />
            <p id="grade-hint" className="text-xs text-muted-foreground">
              Whole number from 0 to 100.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade-feedback" className="text-foreground">
              Feedback <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="grade-feedback"
              rows={4}
              placeholder="Comments for the student…"
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              disabled={submitting}
              className="rounded-xl resize-none bg-secondary border-border focus-visible:ring-orange-500/30"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl gradient-button font-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Submit grade"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
