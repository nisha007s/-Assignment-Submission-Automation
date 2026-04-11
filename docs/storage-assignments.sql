-- ============================================================
-- ASAS — Storage policies for bucket: assignments
-- Run in: Supabase Dashboard → SQL Editor (after creating bucket `assignments`)
-- Object path format in app: {auth.uid()}/{timestamp}_{filename}
-- ============================================================

DROP POLICY IF EXISTS "assignments_insert_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "assignments_select_own_or_teacher" ON storage.objects;
DROP POLICY IF EXISTS "assignments_delete_own_folder" ON storage.objects;

-- Allow authenticated users to upload only under their own user-id folder
CREATE POLICY "assignments_insert_own_folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Students: read own files; teachers: read all in bucket
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

-- Optional: allow users to delete own uploads (e.g. rollback)
CREATE POLICY "assignments_delete_own_folder"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
