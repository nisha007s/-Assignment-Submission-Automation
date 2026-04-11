"use client";

import { supabase, supabaseUrl, supabaseAnonKey } from "./supabase";

/** Student submission files bucket. */
export const ASSIGNMENTS_BUCKET = "submissions" as const;

/** Teacher handout files (Create Assignment upload). Must exist in Supabase Storage. */
export const ASSIGNMENT_HANDOUTS_BUCKET = "assignments" as const;

const DEFAULT_SIGNED_URL_TTL = 3600;

/** Short TTL for version-history downloads (teacher). */
export const VERSION_HISTORY_SIGNED_URL_TTL = 60;

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?#]/g, "_").trim() || "file";
}

export interface UploadFileResult {
  /** Object key within the bucket: `{assignmentId}/{userId}/{version}/{timestamp}_{name}`. */
  path: string;
  /** Public URL when the bucket is public (for display or legacy). Store `path` in DB for signed downloads. */
  publicUrl: string;
}

export interface UploadFileContext {
  assignmentId: string;
  userId: string;
  version: number;
}

async function getValidAccessToken(): Promise<string> {
  let {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw new Error(`Session refresh failed: ${error.message}`);
    session = data.session;
  }

  if (!session?.access_token) throw new Error("Not authenticated");
  return session.access_token;
}

async function xhrUploadToBucket(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  const accessToken = await getValidAccessToken();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local and restart the dev server."
    );
  }
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const anonKey = supabaseAnonKey;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const uploadUrl = `${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`;

  console.log("[storage] starting XHR upload", { bucket, path, bytes: file.size });

  onProgress?.(0);

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const settle = (action: "ok" | "err", err?: Error) => {
      if (settled) return;
      settled = true;
      if (action === "ok") {
        onProgress?.(100);
        resolve();
      } else {
        reject(err ?? new Error("Upload failed"));
      }
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.timeout = 15 * 60 * 1000;
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Cache-Control", "max-age=3600");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (e) => {
      if (!onProgress) return;
      if (e.lengthComputable && e.total > 0) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(Math.min(100, pct));
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("[storage] XHR complete", { status: xhr.status, path });
        settle("ok");
        return;
      }
      if (xhr.status === 0) {
        settle("err", new Error("Network error during upload (status 0)"));
        return;
      }
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        settle(
          "err",
          new Error(body.message || body.error || `Upload failed (${xhr.status})`)
        );
      } catch {
        settle("err", new Error(xhr.statusText || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => settle("err", new Error("Network error during upload"));
    xhr.ontimeout = () => settle("err", new Error("Upload timed out"));

    xhr.send(file);
  });
}

/**
 * Upload a file to the `submissions` bucket with XMLHttpRequest so upload progress is available.
 * Path: `{assignmentId}/{userId}/{version}/{timestamp}_{sanitizedName}` (matches Storage RLS in docs).
 */
export async function uploadFile(
  file: File,
  context: UploadFileContext,
  onProgress?: (percent: number) => void
): Promise<UploadFileResult> {
  const { assignmentId, userId, version } = context;
  if (!assignmentId?.trim()) throw new Error("Missing assignmentId for upload path");
  if (!userId?.trim()) throw new Error("Missing userId for upload path");

  const safeName = sanitizeFileName(file.name);
  const path = `${assignmentId}/${userId}/v${version}-${Date.now()}-${safeName}`;

  await xhrUploadToBucket(ASSIGNMENTS_BUCKET, path, file, onProgress);

  const {
    data: { publicUrl },
  } = supabase.storage.from(ASSIGNMENTS_BUCKET).getPublicUrl(path);

  console.log("[storage] uploadFile resolved", { path });
  return { path, publicUrl: publicUrl ?? "" };
}

const HANDOUT_ACCEPT = /\.(pdf|doc|docx)$/i;

/**
 * Upload teacher handout to bucket `assignments` at `assignments/{teacherId}/{timestamp}_{name}`.
 * Returns storage path (store in DB) and a public URL if the bucket is public.
 */
export async function uploadTeacherAssignmentFile(
  file: File,
  teacherId: string,
  onProgress?: (percent: number) => void
): Promise<{ path: string; publicUrl: string }> {
  if (!teacherId?.trim()) throw new Error("Missing teacher id");
  if (!HANDOUT_ACCEPT.test(file.name)) {
    throw new Error("Invalid file type. Use PDF, DOC, or DOCX.");
  }

  const safeName = sanitizeFileName(file.name);
  const path = `assignments/${teacherId}/${Date.now()}_${safeName}`;

  await xhrUploadToBucket(ASSIGNMENT_HANDOUTS_BUCKET, path, file, onProgress);

  const {
    data: { publicUrl },
  } = supabase.storage.from(ASSIGNMENT_HANDOUTS_BUCKET).getPublicUrl(path);

  return { path, publicUrl: publicUrl ?? "" };
}

/** Signed download URL for a stored handout path (private bucket) or pass-through for http(s). */
export async function resolveAssignmentHandoutUrl(fileUrl: string): Promise<string> {
  const trimmed = fileUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const { data, error } = await supabase.storage
    .from(ASSIGNMENT_HANDOUTS_BUCKET)
    .createSignedUrl(trimmed, DEFAULT_SIGNED_URL_TTL);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Could not create signed URL for assignment file");
  return data.signedUrl;
}

export async function deleteTeacherAssignmentFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(ASSIGNMENT_HANDOUTS_BUCKET).remove([filePath]);
  if (error) throw error;
}

/**
 * Signed URL for private buckets (or short-lived access). Default 1 hour.
 */
export async function getDownloadUrl(
  filePath: string,
  expiresInSeconds: number = DEFAULT_SIGNED_URL_TTL
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(ASSIGNMENTS_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Could not create signed URL");
  return data.signedUrl;
}

/**
 * Resolve a `submissions.file_url` value: storage path → signed URL; already `http(s)` → use as-is (legacy / public).
 */
export async function resolveSubmissionDownloadUrl(fileUrl: string): Promise<string> {
  const trimmed = fileUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return getDownloadUrl(trimmed, DEFAULT_SIGNED_URL_TTL);
}

/** Signed URL (60s) for a version row; full `http` URLs returned as-is (legacy). */
export async function getVersionHistorySignedUrl(fileUrl: string): Promise<string> {
  const trimmed = fileUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return getDownloadUrl(trimmed, VERSION_HISTORY_SIGNED_URL_TTL);
}

/** Retry once (e.g. transient or clock skew). */
export async function resolveSubmissionDownloadUrlWithRetry(
  fileUrl: string,
  maxAttempts = 2
): Promise<string> {
  let lastError: unknown;
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      return await resolveSubmissionDownloadUrl(fileUrl);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Download URL failed");
}

/** Remove an object from the assignments bucket (e.g. rollback after failed DB insert). */
export async function deleteFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(ASSIGNMENTS_BUCKET).remove([filePath]);
  if (error) throw error;
}
