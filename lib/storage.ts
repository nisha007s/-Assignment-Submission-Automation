"use client";

import { supabase } from "./supabase";

/** Private bucket name — create in Supabase Dashboard → Storage (Phase 4.1). */
export const SUBMISSIONS_BUCKET = "submissions" as const;

const DEFAULT_SIGNED_URL_TTL = 3600;

/**
 * Phase 4.1 — Run in Supabase SQL Editor after creating the `submissions` bucket (private).
 *
 * ```sql
 * -- Storage Policy: Students can upload to own folder
 * CREATE POLICY "Students can upload files"
 * ON storage.objects FOR INSERT
 * WITH CHECK (
 *   bucket_id = 'submissions' AND auth.role() = 'authenticated'
 * );
 *
 * -- Storage Policy: Users can access their own files; teachers can access all
 * CREATE POLICY "Access own files"
 * ON storage.objects FOR SELECT
 * USING (
 *   bucket_id = 'submissions' AND (
 *     auth.uid()::text = (storage.foldername(name))[2]
 *     OR EXISTS (
 *       SELECT 1 FROM public.profiles
 *       WHERE id = auth.uid() AND role = 'teacher'
 *     )
 *   )
 * );
 * ```
 *
 * Object path convention: `assignments/{studentId}/{assignmentId}/v{version}-{safeFileName}`
 * so `(storage.foldername(name))[2]` = `studentId` for RLS.
 */

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\]/g, "_").replace(/\s+/g, " ").trim() || "file";
}

function buildObjectPath(
  assignmentId: string,
  studentId: string,
  version: number,
  fileName: string
): string {
  const safe = sanitizeFileName(fileName);
  return `assignments/${studentId}/${assignmentId}/v${version}-${safe}`;
}

export interface UploadFileResult {
  /** Path within the bucket (use with `getDownloadUrl` / `deleteFile`). */
  path: string;
  bucket: typeof SUBMISSIONS_BUCKET;
}

/**
 * Upload a file to the submissions bucket.
 * @returns Storage path inside the bucket (suitable for `file_url` if you store path + bucket separately, or store as `bucket/path` if you prefer).
 */
export async function uploadFile(
  file: File,
  assignmentId: string,
  studentId: string,
  version: number
): Promise<UploadFileResult> {
  const path = buildObjectPath(assignmentId, studentId, version, file.name);

  const { error } = await supabase.storage
    .from(SUBMISSIONS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  return { path, bucket: SUBMISSIONS_BUCKET };
}

/**
 * Create a signed URL for temporary download (default 1 hour).
 * @param filePath — Path returned from `uploadFile` (within bucket).
 */
export async function getDownloadUrl(
  filePath: string,
  expiresInSeconds: number = DEFAULT_SIGNED_URL_TTL
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(SUBMISSIONS_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("No signed URL returned");
  return data.signedUrl;
}

/**
 * Remove an object from the submissions bucket.
 * @param filePath — Path within bucket (same as `uploadFile` result `.path`).
 */
export async function deleteFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(SUBMISSIONS_BUCKET).remove([filePath]);
  if (error) throw error;
}
