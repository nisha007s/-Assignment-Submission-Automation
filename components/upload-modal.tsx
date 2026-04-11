"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadFile, deleteFile } from "@/lib/storage";
import { createSubmission, getNextVersionNumber } from "@/lib/database";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = /\.(pdf|doc|docx|zip|ppt|pptx)$/i;

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentTitle: string;
  assignmentId: string;
  onSuccess?: () => void;
}

export function UploadModal({
  open,
  onOpenChange,
  assignmentTitle,
  assignmentId,
  onSuccess,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[upload] submit: click");

    if (!selectedFile) {
      console.log("[upload] submit: aborted — no file");
      return;
    }
    if (uploading) {
      console.log("[upload] submit: aborted — already uploading");
      return;
    }
    if (!assignmentId?.trim()) {
      console.error("[upload] submit: missing assignmentId");
      toast.error("Upload failed", { description: "No assignment selected." });
      return;
    }

    if (!ACCEPTED.test(selectedFile.name)) {
      toast.error("Invalid file type", {
        description: "Use PDF, DOC, DOCX, ZIP, PPT, or PPTX.",
      });
      return;
    }

    if (selectedFile.size > MAX_BYTES) {
      toast.error("File too large", {
        description: "Maximum size is 10 MB.",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log("[upload] resolving user…");
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("[upload] getUser error", userError);
        throw userError;
      }

      const user = userData.user;
      if (!user) {
        console.error("[upload] no user on session");
        throw new Error("Not signed in");
      }

      console.log("[upload] user OK", { id: user.id });

      console.log("[upload] getNextVersionNumber…", { assignmentId, studentId: user.id });
      const version = await getNextVersionNumber(assignmentId, user.id);
      console.log("[upload] next version", version);

      console.log("[upload] starting storage upload…");
      const { path } = await uploadFile(
        selectedFile,
        { assignmentId: assignmentId.trim(), userId: user.id, version },
        (pct) => setUploadProgress(pct)
      );
      console.log("[upload] storage upload finished", { path });

      try {
        console.log("[upload] inserting submission row…");
        const insertResult = await createSubmission({
          assignment_id: assignmentId.trim(),
          student_id: user.id,
          file_url: path,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          version,
        });
        console.log("[upload] insert finished", insertResult);
      } catch (insertErr) {
        console.error("[upload] insert failed — removing uploaded object", insertErr);
        await deleteFile(path).catch((delErr) =>
          console.warn("[upload] rollback deleteFile failed", delErr)
        );
        throw insertErr;
      }

      toast.success("Submission uploaded", {
        description: `Version ${version} submitted for ${assignmentTitle}.`,
      });

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onOpenChange(false);
      onSuccess?.();
      console.log("[upload] flow complete");
    } catch (err) {
      console.error("[upload] flow error", err);
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error("Upload failed", { description: message });
    } finally {
      console.log("[upload] finally: clearing loading state");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Upload className="h-4 w-4 text-white" />
            </div>
            Upload Assignment
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Submit your work for: <span className="font-medium text-orange-500">{assignmentTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-300
                ${uploading ? "pointer-events-none opacity-60" : ""}
                ${
                  isDragging
                    ? "border-orange-500 bg-orange-500/10 scale-[1.02]"
                    : "border-border hover:border-orange-500/50 hover:bg-muted/50 dark:hover:bg-secondary/50"
                }
                ${selectedFile ? "border-orange-500/50 bg-orange-50 dark:bg-orange-500/5" : ""}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/15">
                    <FileText className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploading}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      clearFile();
                    }}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted dark:bg-secondary">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-foreground">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, ZIP up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Uploading… {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border bg-muted dark:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploading}
              className="rounded-xl gradient-button font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
