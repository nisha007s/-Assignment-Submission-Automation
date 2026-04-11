-- ============================================================
-- ASAS — Storage policies
-- Run in: Supabase Dashboard → SQL Editor (after creating buckets)
-- ============================================================
--
-- App bucket name: **submissions** (see lib/storage.ts ASSIGNMENTS_BUCKET)
-- New object path: {assignment_id}/{user_id}/{version}/{timestamp}_{filename}
--   → 2nd segment = student id
-- Legacy path (older app builds): {user_id}/{timestamp}_{filename}
--   → 1st segment = student id
-- Policies allow either shape so existing objects keep working.
-- ============================================================

-- ── Bucket: submissions (primary) ──────────────────────────

DROP POLICY IF EXISTS "submissions_insert_own_segment" ON storage.objects;
DROP POLICY IF EXISTS "submissions_select_own_or_teacher" ON storage.objects;
DROP POLICY IF EXISTS "submissions_delete_own_segment" ON storage.objects;

CREATE POLICY "submissions_insert_own_segment"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'submissions'
  AND (string_to_array(name, '/'))[2] = auth.uid()::text
);

CREATE POLICY "submissions_select_own_or_teacher"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'submissions'
  AND (
    (string_to_array(name, '/'))[1] = auth.uid()::text
    OR (string_to_array(name, '/'))[2] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  )
);

CREATE POLICY "submissions_delete_own_segment"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'submissions'
  AND (
    (string_to_array(name, '/'))[1] = auth.uid()::text
    OR (string_to_array(name, '/'))[2] = auth.uid()::text
  )
);

-- ── Bucket: assignments (legacy / optional) ────────────────
-- Path format: {auth.uid()}/{timestamp}_{filename}

DROP POLICY IF EXISTS "assignments_insert_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "assignments_select_own_or_teacher" ON storage.objects;
DROP POLICY IF EXISTS "assignments_delete_own_folder" ON storage.objects;

CREATE POLICY "assignments_insert_own_folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "assignments_select_own_or_teacher"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'assignments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  )
);

CREATE POLICY "assignments_delete_own_folder"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
