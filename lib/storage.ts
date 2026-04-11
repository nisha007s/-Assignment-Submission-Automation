"use client";

import { supabase } from "./supabase";

/** Supabase Storage bucket for assignment files. */
export const ASSIGNMENTS_BUCKET = "assignments" as const;

const DEFAULT_SIGNED_URL_TTL = 3600;

/** Short TTL for version-history downloads (teacher). */
export const VERSION_HISTORY_SIGNED_URL_TTL = 60;

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?#]/g, "_").trim() || "file";
}

function getEnvOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export interface UploadFileResult {
  /** Object key within the bucket, e.g. `{userId}/{timestamp}_{name}`. */
  path: string;
  /** Public URL when the bucket is public (for display or legacy). Store `path` in DB for signed downloads. */
  publicUrl: string;
}

/**
 * Upload a file to the `assignments` bucket with XMLHttpRequest so upload progress is available.
 * Path: `${userId}/${Date.now()}_${file.name}` (sanitized file segment).
 */
export async function uploadFile(
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<UploadFileResult> {
  const safeName = sanitizeFileName(file.name);
  const path = `${userId}/${Date.now()}_${safeName}`;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");

  const baseUrl = getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const anonKey = getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const uploadUrl = `${baseUrl}/storage/v1/object/${ASSIGNMENTS_BUCKET}/${encodedPath}`;

  onProgress?.(0);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Cache-Control", "max-age=3600");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (e) => {
      if (!onProgress) return;
      if (e.lengthComputable && e.total > 0) {
        onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        reject(new Error(body.message || body.error || `Upload failed (${xhr.status})`));
      } catch {
        reject(new Error(xhr.statusText || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });

  const {
    data: { publicUrl },
  } = supabase.storage.from(ASSIGNMENTS_BUCKET).getPublicUrl(path);

  return { path, publicUrl: publicUrl ?? "" };
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
